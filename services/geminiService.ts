import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the client with the API key from the environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SUPPORT_SYSTEM_INSTRUCTION = `
You are the "bbqp Product Specialist". You are an expert on the bbqp dual-mode grill/oven.
Your goal is to help potential customers understand the unique features of the grill and guide them towards selecting a model.

Key Product Features to emphasize:
1. Dual Mode (The Partition): A folding partition instantly switches the device from a high-heat Oven (ideal for pilaf, boiling water) to a scattered-heat Grill (ideal for skewers, steaks).
2. AutoDraft: Physics-based airflow system. No fans needed. Just add coals, and the draft accelerates ignition and maintains even heat.
3. Materials: 3mm heat-resistant stainless steel. Durable, rust-free.
4. Personalization: Laser engraving available for logos, names, or messages.
5. Military Edition: Matte tactical coating, reinforced construction, free engraving for veterans/SVO participants.

Tone:
- Professional, knowledgeable, concise, and premium.
- Use technical terms correctly but explain them simply.
- Be helpful and polite.

Guidelines:
- If asked about price or how to order, explain that models vary and suggest clicking the buttons on the site to contact the manager on Telegram (@thetaranov).
- Keep answers under 100 words unless a detailed technical explanation is requested.
- Respond in Russian.
`;

const RECIPE_SYSTEM_INSTRUCTION = `
You are "bbqp AI Chef", a world-class Pitmaster specializing in American BBQ (Texas, Carolina, Kansas City styles) and German Grill cuisine (Bratwurst, Schwenker, Spießbraten).

Your Goal:
Generate detailed, mouth-watering recipes for the user based on their request (e.g., "Ribeye steak", "Pork ribs", "Grilled sausages").

Rules:
1. Cuisine Focus: STRICTLY stick to American BBQ or German Grill styles. If asked for sushi or pasta, politely steer back to the grill.
2. Format:
   - Title (Creative and Bold)
   - Ingredients (List with metric units)
   - Preparation (Marinades, rubs)
   - Grilling Process (Mention distinct Direct vs Indirect heat zones, similar to bbqp capabilities).
   - Doneness: Always specify internal temperatures (e.g., 54°C for Medium Rare).
3. Tone: Passionate, appetizing, masculine, and encouraging. Use emojis like 🥩, 🔥, 🍺.
4. Language: Russian.
5. Keep it concise but informative.
`;

export const askPitmaster = async (userPrompt: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SUPPORT_SYSTEM_INSTRUCTION,
    });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    return response.text() || "Извините, сейчас я не могу ответить. Пожалуйста, свяжитесь с нами через форму на сайте.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Connection to support failed.");
  }
};

export const generateBBQRecipe = async (userPrompt: string): Promise<{ text: string; image?: string }> => {
    try {
      // For recipe text generation
      const textModel = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        systemInstruction: RECIPE_SYSTEM_INSTRUCTION,
      });

      // Simple image prompt logic (since Gemini API image generation is complex to setup directly, 
      // we'll focus on text first or return a placeholder if image gen isn't available in this tier)

      const result = await textModel.generateContent(userPrompt);
      const response = await result.response;
      const text = response.text() || "Шеф сейчас отошел от гриля. Попробуйте спросить еще раз!";

      // Placeholder image logic or actual generation if key supports it
      // For now, returning just text to prevent errors
      return { text };

    } catch (error) {
      console.error("Gemini Recipe Error:", error);
      throw new Error("Recipe generation failed.");
    }
  };