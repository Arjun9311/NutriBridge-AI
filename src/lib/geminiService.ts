import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData, Recommendation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateAILogic(disease: string, cropType: string, weather: WeatherData, lang: string = 'en'): Promise<Recommendation> {
  const weatherStr = `${weather.temp}°C, ${weather.condition}${weather.rainExpected ? ' (Rain expected)' : ''}`;
  
  const prompt = `You are a world-class agricultural expert speaking to a rural farmer.
Given:
* Disease: ${disease}
* Crop: ${cropType}
* Weather: ${weatherStr}

Generate a structured recommendation in language: ${lang}.
CRITICAL: Every string value in the JSON response (action, time, reason, cost, savings, explanation) MUST BE ENTIRELY in ${lang}. DO NOT use English for these fields.
The user is a rural farmer who prefers very short, simple sentences.
The tone should be helpful and direct.

IMPORTANT:
1. If rain is expected, recommend delaying chemical spraying.
2. Estimate cost in INR (₹).
3. Estimate "Savings Prevented" (Money saved by taking action).
4. Assign a Risk Level (Low, Medium, High).

Return a structured response.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING, description: "Specific action" },
          time: { type: Type.STRING, description: "Best time" },
          reason: { type: Type.STRING, description: "Why" },
          cost: { type: Type.STRING, description: "Cost in INR" },
          savings: { type: Type.STRING, description: "Estimated crop value saved" },
          risk: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          explanation: { type: Type.STRING, description: "Simple explanation" }
        },
        required: ["action", "time", "reason", "cost", "savings", "risk", "explanation"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return {
      action: "Consult a local representative",
      time: "As soon as possible",
      reason: "Could not generate specific AI recommendation",
      cost: "Varies",
      savings: "Varies",
      risk: "Medium",
      explanation: "Please ensure your crop is well monitored while we investigate further."
    };
  }
}

export async function chatWithAI(query: string, history: any[], lang: string = 'en') {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history,
      { role: "user", parts: [{ text: query }] }
    ],
    config: {
      systemInstruction: `You are a helpful nutrition assistant named NutriBridge. You MUST answer rural farmers' queries EXCLUSIVELY in ${lang} language. Use simple words and short sentences. Always use the native script of the language (e.g., Devanagari for Hindi). Keep advice practical and local.`
    },
  });

  return response.text;
}
