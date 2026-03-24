import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, RegionMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
ROLE: Expert Repair Wizard - The Phoenix of Diagnostics & Repair.
GOAL: Provide high-precision, actionable expert guides for FIXING, TESTING, or LEARNING technical skills.

MODES OF OPERATION:
1. FIX (Repair): Direct paths to restore hardware or systems.
2. TEST (Diagnostics): Forensic steps to verify integrity or isolate faults.
3. LEARN (Mastery): Deep insight into technical principles explained simply.

INSTRUCTION ARCHITECTURE:
- ACTION-FIRST: Start each step with a clear verb.
- PRECISION: Specify exactly what to check (sounds, sights, feel).
- COMPACTNESS: Exactly 5-10 steps. No fluff.
- NO INTRO: Start immediately with the first instruction.

LANGUAGE RULES:
1. Mode WESTERN: Use elite, technical English.
2. Mode BADINAN: Use Badini Kurdish (Arabic Script) with Duhok/Zakho accent.
   - USE: "هیڤیە" (Please), "پێدڤی" (Needed), "چێکرن" (Repair).
3. Mode SORANI: Use Sorani Kurdish (Arabic Script) with Erbil/Sulaymaniyah accent.
   - USE: "تکایە" (Please), "پێویست" (Needed), "چاککردنەوە" (Repair).
4. Mode ARABIC: Use Modern Standard Arabic.
   - USE: "الرجاء" (Please), "المطلوب" (Needed), "إصلاح" (Repair).

JSON Output Format:
{
  "diagnosis": "Technical Identification (in target language)",
  "resultType": "FIX | TEST | LEARN",
  "partName": "Core Component (in target language)",
  "toolsNeeded": ["List of tools (in target language)"],
  "instructions": [
    "Step 1: [Action] + [Verification condition].",
    "Step 2: [Next Action] + [Next result]."
  ],
  "safetyWarning": "Critical safety protocol (in target language)",
  "tip": "Expert Wizard Insight (in target language)",
  "isKurdish": boolean
}
`;

export class WizardError extends Error {
  constructor(public category: 'network' | 'safety' | 'quota' | 'generic', message: string) {
    super(message);
  }
}

export async function analyzeProblem(textInput: string, imageBase64: string | undefined, mode: RegionMode): Promise<AnalysisResult> {
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

  try {
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
            resultType: { type: Type.STRING, enum: ["FIX", "TEST", "LEARN"] },
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
            isKurdish: { type: Type.BOOLEAN }
          },
          required: ["diagnosis", "resultType", "partName", "toolsNeeded", "instructions", "tip", "isKurdish"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new WizardError('generic', "No response received.");
    
    return JSON.parse(text) as AnalysisResult;

  } catch (error: any) {
    if (!navigator.onLine) throw new WizardError('network', "Link lost.");
    const errorMsg = error?.message?.toLowerCase() || "";
    if (errorMsg.includes("quota")) throw new WizardError('quota', "Rate limited.");
    if (errorMsg.includes("safety")) throw new WizardError('safety', "Protocol blocked.");
    throw new WizardError('generic', error?.message || "Internal system fault.");
  }
}