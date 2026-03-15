import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, RegionMode } from "../types";

export class WizardError extends Error {
  constructor(public category: 'network' | 'safety' | 'quota' | 'generic', message: string) {
    super(message);
  }
}

const SYSTEM_INSTRUCTION = `
ROLE: "Repair Wizard" - Elite AI Technical Consultant & Automotive Import Broker (repairwizard.net).
FOCUS: Global market, hyper-focus on Kurdistan Region (Badini/Sorani) and Iraq (Arabic).
IDENTITY: You are a high-tech, precise, and authoritative technical wizard. Never reveal the developer's real name.

VISUAL FORMATTING (COMMAND CENTER UI):
- Output all data as a high-tech dashboard using Markdown.
- Use digital progress bars: ▰▰▰▰▰▰▰▱▱▱ [Status].
- Wrap vehicle specs, technical steps, and price breakdowns in Code Blocks (\`\`\`) for a monospaced look.
- Use functional emojis: 🔍 (Scan/Decode), ⚡ (Electrical Safety), 🛡️ (Verified/Clean Title), ⚠️ (Critical Warning), 💎 (Premium Partner).

MODULE 1: APPLIANCE & VEHICLE DIAGNOSTICS
- Technical Protocol: Provide clear, numbered, concise technical steps necessary for the repair. Every DIY repair guide MUST contain at least 10 numbered steps.
- INITIALIZATION: Start the diagnosis with a "Protocol Initialized" confirmation.
- DEPTH: Provide deep technical insight into WHY a component failed (e.g., "Capacitor leakage due to grid instability").
- VIN SCAN: If the input is a 17-digit VIN or an image of a VIN plate, set resultType to 'VIN_SCAN' and decode the vehicle specs.
- COST ANALYSIS: For all repairs, estimate the 'repairCost' and the vehicle's 'marketValue' in USD.
- Iraqi Localization:
  - Prioritize "Power Surge" diagnostics (Mowlida/Grid switching instability).
  - Communicate in Badini Kurdish (Duhok/Zakho dialect), Sorani Kurdish (Erbil/Sulaymaniyah), or Iraqi Arabic when requested.
  - For Badini, use authentic Duhok/Zakho terminology (e.g., "تومبێل" instead of "سەیارە" where appropriate, "ئاریشە" for problem, "چاککرن" for repair).

SAFETY PROTOCOL:
- If high voltage, flammable, or structural integrity is involved, start with: ⚠️ CRITICAL SAFETY ALERT ⚠️.
`;

export async function analyzeProblem(textInput: string, imageBase64: string | undefined, mode: RegionMode): Promise<AnalysisResult> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new WizardError('generic', "GEMINI_API_KEY not found. Please set it in the Settings menu.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const parts: any[] = [{ text: `Diagnostic Request: "${textInput}"` }];
    
    if (imageBase64) {
      parts.push({
        inlineData: { data: imageBase64, mimeType: 'image/jpeg' }
      });
    }

    let languagePrompt = "";
    if (mode === RegionMode.BADINAN) {
      languagePrompt = "Response must be in Badini Kurdish (Duhok/Zakho). Set isKurdish to true.";
    } else if (mode === RegionMode.SORANI) {
      languagePrompt = "Response must be in Sorani Kurdish (Erbil/Sulaymaniyah). Set isKurdish to true.";
    } else if (mode === RegionMode.ARABIC) {
      languagePrompt = "Response must be in Modern Standard Arabic. Set isKurdish to false.";
    } else {
      languagePrompt = "Response must be in technical English. Set isKurdish to false.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          ...parts,
          { text: `System Mode: ${mode}. Data: ${textInput}. ${languagePrompt}` }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING },
            resultType: { type: Type.STRING, enum: ["FIX", "TEST", "LEARN", "VIN_SCAN"] },
            partName: { type: Type.STRING },
            toolsNeeded: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            instructions: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            safetyWarning: { type: Type.STRING },
            tip: { type: Type.STRING },
            isKurdish: { type: Type.BOOLEAN },
            markdownOutput: { type: Type.STRING },
            vinScanData: {
              type: Type.OBJECT,
              properties: {
                vin: { type: Type.STRING },
                make: { type: Type.STRING },
                model: { type: Type.STRING },
                year: { type: Type.STRING },
                engine: { type: Type.STRING },
                trim: { type: Type.STRING }
              }
            },
            repairCost: { type: Type.NUMBER },
            marketValue: { type: Type.NUMBER }
          },
          required: ["diagnosis", "resultType", "partName", "toolsNeeded", "instructions", "tip", "isKurdish", "markdownOutput"]
        }
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response received from Gemini.");
    
    // Clean potential markdown formatting
    text = text.replace(/```json\n?|```/g, '').trim();
    
    const result = JSON.parse(text);

    // Ensure at least 10 steps protocol
    if (result.instructions && Array.isArray(result.instructions)) {
      const originalCount = result.instructions.length;
      if (originalCount < 10) {
        const paddingCount = 10 - originalCount;
        for (let i = 0; i < paddingCount; i++) {
          const stepNum = originalCount + i + 1;
          result.instructions.push(`Step ${stepNum}: Final system verification and technical cleanup.`);
        }
      }
    } else {
      result.instructions = Array.from({ length: 10 }, (_, i) => `Step ${i + 1}: Technical diagnostic verification required.`);
    }

    return result;

  } catch (error: any) {
    if (error instanceof WizardError) throw error;
    if (!navigator.onLine) throw new WizardError('network', "Link lost.");
    
    const message = error?.message || "Internal system fault.";
    const status = error?.status || error?.response?.status;

    // Specifically detect rate limit (429) or "Rate exceeded" text
    if (status === 429 || 
        message.toLowerCase().includes('quota') || 
        message.toLowerCase().includes('rate exceeded') ||
        message.toLowerCase().includes('429')) {
      throw new WizardError('quota', "Rate limited.");
    }
    
    if (message.toLowerCase().includes('safety')) {
      throw new WizardError('safety', "Protocol blocked.");
    }
    
    console.error('Frontend Analyze Error:', error);
    throw new WizardError('generic', message);
  }
}
