import { GoogleGenAI, Type } from '@google/genai';
import { PlanDetails, OutingType } from '../types.ts';

// Initialize SDK. Assumes process.env.API_KEY is available in the environment.
// For this browser-based prototype without a bundler injecting env vars, 
// we will simulate it or require it to be set globally if this were a real build.
// Since we must use process.env.API_KEY per instructions, we assume the environment provides it.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'dummy_key_for_type_safety', vertexai: true });

export async function extractPlanDetails(prompt: string): Promise<Partial<PlanDetails>> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract night out planning details from the following text. If a detail is not mentioned, omit it or use a reasonable default. Text: "${prompt}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "A catchy name for the plan" },
            type: { type: Type.STRING, description: "One of: FRIENDS, COUPLE, COUPLES_GROUP" },
            date: { type: Type.STRING, description: "Date of the outing, e.g., 'Saturday' or '2024-10-26'" },
            location: { type: Type.STRING, description: "General area or city" },
            preferredStartTime: { type: Type.STRING, description: "e.g., '18:00' or '6 PM'" },
            latestEndTime: { type: Type.STRING, description: "e.g., '23:00' or '11 PM'" },
            expectedSize: { type: Type.INTEGER, description: "Number of people" },
            preferredRadiusMiles: { type: Type.INTEGER, description: "Distance willing to travel" }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    
    const parsed = JSON.parse(text);
    
    // Map string type to enum safely
    let mappedType = OutingType.FRIENDS;
    if (parsed.type === 'COUPLE') mappedType = OutingType.COUPLE;
    if (parsed.type === 'COUPLES_GROUP') mappedType = OutingType.COUPLES_GROUP;

    return {
      ...parsed,
      type: mappedType
    };
  } catch (error) {
    console.error("Error extracting details:", error);
    throw new Error("Failed to understand the plan details. Please try again or enter manually.");
  }
}

export async function generateWhyItFits(agenda: any, participants: any[]): Promise<string> {
  try {
    const prompt = `
      Given this agenda: Dinner at ${agenda.restaurant.name} (${agenda.restaurant.categories.join(', ')}) and Activity at ${agenda.activity.name} (${agenda.activity.categories.join(', ')}).
      And these participants: ${participants.length} people with various budgets and preferences.
      Write a short, 2-sentence explanation of why this is a good fit for the group. Keep it punchy and exciting.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "A great combination of food and fun that fits the group's budget and location.";
  } catch (e) {
    return "A great combination of food and fun that fits the group's budget and location.";
  }
}
