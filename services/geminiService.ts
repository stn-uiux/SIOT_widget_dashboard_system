
import { GoogleGenAI, Type } from "@google/genai";
import { DashboardTheme, ThemeMode } from "../types";

export const getAIGeneratedThemes = async (siteDescription: string): Promise<DashboardTheme[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is not set");
    return [];
  }
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this site description: "${siteDescription}". Generate 3 professional UI theme variations. Each variation should include a primary brand color (hex), a suggested border radius (in px, 0-24), a suggested widget spacing (in px, 2-16), a theme mode (light or dark), and typography settings: titleSize (14-24), titleWeight (400-900), and contentSize (10-16).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            primaryColor: { type: Type.STRING },
            borderRadius: { type: Type.NUMBER },
            spacing: { type: Type.NUMBER },
            mode: { type: Type.STRING, enum: ['light', 'dark'] },
            titleSize: { type: Type.NUMBER },
            titleWeight: { type: Type.STRING },
            contentSize: { type: Type.NUMBER },
          },
          required: ['primaryColor', 'borderRadius', 'spacing', 'mode', 'titleSize', 'titleWeight', 'contentSize'],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text || '[]').map((t: any) => ({
      ...t,
      mode: t.mode === 'dark' ? ThemeMode.DARK : ThemeMode.LIGHT
    }));
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return [];
  }
};
