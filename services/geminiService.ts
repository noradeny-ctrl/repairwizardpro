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
- Use functional emojis: 🔍 (Scan/Decode), ⚡ (Electrical Safety), 🛡️ (Verified/Clean Title), ⚠️ (Critical Warning), 💎 (Premium Partner), 🇺🇸 (Wizard Direct).

MODULE 1: APPLIANCE & VEHICLE DIAGNOSTICS
- 20-Step Protocol: Every DIY repair guide MUST contain exactly 20 numbered, concise, technical steps.
- 50% Rule: Calculate estimated repair cost vs. total market value. If cost > 50%, advise against repair and recommend replacement.
- Iraqi Localization:
  - Prioritize "Power Surge" diagnostics (Mowlida/Grid switching instability).
  - Use the "Sina'a Street Price Guard": Provide fair Iraqi Dinar (IQD) price ranges for parts.
  - Communicate in Badini Kurdish, Sorani Kurdish, or Iraqi Arabic when requested.

MODULE 2: VEHICLE IDENTITY & SAFETY (VIN SCANNING)
- Trigger: When a 17-character alphanumeric VIN is provided.
- Output: "Vehicle Identity Scan".
- Check: Safety recalls, engine specs, origin, auction history, mileage discrepancies, salvage/flood titles.

MODULE 3: MONETIZATION & REFERRALS
- Global: Recommend tools/parts using Amazon Affiliate ID: repairwizar0d-20.
- Support/Brokerage: For direct import assistance or joining the partner program, contact: https://wa.me/16153392046.
- Iraq/KRG: Recommend local "Verified Partner Shops" (Ustas) with WhatsApp links (e.g., https://wa.me/964xxxxxxxxx).

MODULE 4: 🇺🇸 WIZARD DIRECT (USA TO KURDISTAN IMPORTS)
- Trigger: If repair > 50%, VIN scan shows heavy damage/totaled, or user asks about importing.
- Pitch: "⚠️ Repairing this vehicle is economically unviable. Skip the local dealership markups. Use the 🇺🇸 Wizard Direct portal to import a Clean Title vehicle directly from the USA to the Ibrahim Khalil border."
- Logistics: Quote shipping via Port of Mersin (Turkey) to Ibrahim Khalil border (Zakho).
- Costs Breakdown:
  - USA Inland Towing: $300 - $800 (depending on auction location).
  - Ocean Freight (USA to Mersin): $1,200 - $1,800.
  - Land Transit (Mersin to Zakho): $500 - $700.
  - KRG Customs (ASYCUDA): 15% (Standard).
- Action: Provide a "Wizard Direct Import Estimate" table in the markdown output.

SAFETY PROTOCOL:
- If high voltage, flammable, or structural integrity is involved, start with: ⚠️ CRITICAL SAFETY ALERT ⚠️.
`;

export async function analyzeProblem(textInput: string, imageBase64: string | undefined, mode: RegionMode): Promise<AnalysisResult> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new WizardError('generic', "GEMINI_API_KEY not found. Please set it in the Settings menu.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const isVIN = /^[A-HJ-NPR-Z0-9]{17}$/i.test(textInput?.trim() || "");
    const parts: any[] = [{ text: isVIN ? `VIN Scan Request: "${textInput}"` : `Diagnostic Request: "${textInput}"` }];
    
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
            repairCostEstimate: { type: Type.NUMBER },
            marketValueEstimate: { type: Type.NUMBER },
            repairVsReplaceRatio: { type: Type.NUMBER },
            iqdPriceGuard: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  partName: { type: Type.STRING },
                  priceRangeIQD: { type: Type.STRING }
                }
              }
            },
            vinScanData: {
              type: Type.OBJECT,
              properties: {
                make: { type: Type.STRING },
                model: { type: Type.STRING },
                year: { type: Type.NUMBER },
                engine: { type: Type.STRING },
                origin: { type: Type.STRING },
                recalls: { type: Type.ARRAY, items: { type: Type.STRING } },
                auctionHistory: { type: Type.STRING },
                mileageStatus: { type: Type.STRING },
                titleStatus: { type: Type.STRING }
              }
            },
            wizardDirectPitch: { type: Type.BOOLEAN },
            markdownOutput: { type: Type.STRING }
          },
          required: ["diagnosis", "resultType", "partName", "toolsNeeded", "instructions", "tip", "isKurdish", "markdownOutput"]
        }
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response received from Gemini.");
    
    // Clean potential markdown formatting
    text = text.replace(/```json\n?|```/g, '').trim();
    
    return JSON.parse(text);

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
