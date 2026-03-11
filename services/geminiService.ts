import { AnalysisResult, RegionMode } from "../types";

export class WizardError extends Error {
  constructor(public category: 'network' | 'safety' | 'quota' | 'generic', message: string) {
    super(message);
  }
}

export async function analyzeProblem(textInput: string, imageBase64: string | undefined, mode: RegionMode): Promise<AnalysisResult> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        textInput,
        imageBase64,
        mode,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error || `Server error: ${response.status}`;
      
      if (message.toLowerCase().includes('quota')) {
        throw new WizardError('quota', "Rate limited.");
      }
      if (message.toLowerCase().includes('safety')) {
        throw new WizardError('safety', "Protocol blocked.");
      }
      throw new WizardError('generic', message);
    }

    return await response.json();

  } catch (error: any) {
    if (error instanceof WizardError) throw error;
    
    if (!navigator.onLine) throw new WizardError('network', "Link lost.");
    
    console.error('Frontend Analyze Error:', error);
    throw new WizardError('generic', error?.message || "Internal system fault.");
  }
}
