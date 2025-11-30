import { GoogleGenAI } from "@google/genai";
import { Tone } from "../types";

/**
 * Generates emoji-enhanced text based on the user input and selected tone.
 * Uses streaming to provide immediate feedback.
 * 
 * @param text - The text to enhance.
 * @param tone - The selected tone style.
 * @param onChunk - Callback for streaming chunks.
 */
export const streamEmojiEnhancement = async (
  text: string,
  tone: Tone,
  onChunk: (chunk: string) => void
): Promise<void> => {
  
  // The API Key is injected automatically into process.env.API_KEY 
  // after the user selects it via window.aistudio.openSelectKey()
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key not found. Please connect your Google account.");
  }

  // Initialize client dynamically to ensure it uses the latest selected key
  const ai = new GoogleGenAI({ apiKey: apiKey });

  const systemInstruction = `
    You are an AI assistant for "EmojiHub". 
    TASK: Rewrite the user's text by inserting appropriate emojis based on the selected TONE.
    
    TONE: ${tone}
    
    GUIDELINES:
    1. ${getToneInstruction(tone)}
    2. STRICTLY MAINTAIN the original language of the user's text. If the input is Portuguese, the output MUST be Portuguese.
    3. Do not change the core meaning of the text.
    4. Do not output any conversational filler (e.g., "Here is the text", "Sure"). Output ONLY the rewritten text.
    5. Formatting: Use line breaks where appropriate to make it readable.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      }
    });

    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      if (chunkText) {
        onChunk(chunkText);
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error.message?.includes('Requested entity was not found') || error.toString().includes('API key')) {
      throw new Error("API Key Error: Please reconnect your Google Account.");
    }
    
    throw new Error("Failed to enhance text. Please check your connection.");
  }
};

const getToneInstruction = (tone: Tone): string => {
  switch (tone) {
    case Tone.General:
      return "Use a balanced amount of emojis. Place them naturally at end of sentences or to emphasize key words.";
    case Tone.Animated:
      return "Use many emojis! Be enthusiastic, colorful, and fun. Use multiple emojis in a row if it fits the vibe.";
    case Tone.Formal:
      return "Use very few, subtle emojis. Stick to neutral faces or objects. Keep the text professional.";
    case Tone.Witty:
      return "Use clever, ironic, or funny emojis. The tone should be sharp and humorous.";
    case Tone.Romantic:
      return "Use hearts, flowers, and affectionate emojis. The tone should be warm and loving.";
    default:
      return "Add appropriate emojis.";
  }
};