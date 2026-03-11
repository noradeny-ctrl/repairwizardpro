import { GoogleGenAI, Type } from "@google/genai";
import { RegionMode } from "../types";

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

JSON OUTPUT FORMAT:
{
  "diagnosis": "Technical Identification",
  "resultType": "FIX | TEST | LEARN | VIN_SCAN",
  "partName": "Core Component",
  "toolsNeeded": ["Tool 1", "Tool 2"],
  "instructions": ["Step 1", ..., "Step 20"],
  "safetyWarning": "⚠️ CRITICAL SAFETY ALERT ⚠️ (if applicable)",
  "tip": "Expert Wizard Insight",
  "isKurdish": boolean,
  "repairCostEstimate": number,
  "marketValueEstimate": number,
  "repairVsReplaceRatio": number,
  "iqdPriceGuard": [{ "partName": "Part", "priceRangeIQD": "Range" }],
  "vinScanData": {
    "make": "Make",
    "model": "Model",
    "year": 2024,
    "engine": "Engine",
    "origin": "Origin",
    "recalls": ["Recall 1"],
    "auctionHistory": "History",
    "mileageStatus": "Status",
    "titleStatus": "Status"
  },
  "wizardDirectPitch": boolean,
  "markdownOutput": "The full dashboard output in Markdown"
}
`;

export default async function handler(req: any, res: any) {
  // Set CORS headers for Vercel if needed (though /api is same-origin by default)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { textInput, imageBase64, mode } = req.body;

  if (!textInput && !imageBase64) {
    return res.status(400).json({ error: 'Input required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
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
    
    res.status(200).json(JSON.parse(text));

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error?.message || "Internal system fault." });
  }
}
