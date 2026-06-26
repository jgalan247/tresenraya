import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to safely obtain GoogleGenAI client
let aiInstance: GoogleGenAI | null = null;

function getGeminiAI(): GoogleGenAI {
  if (aiInstance) return aiInstance;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    throw new Error("GEMINI_API_KEY environment variable is not configured in settings/secrets.");
  }
  aiInstance = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  return aiInstance;
}

// 1. Endpoint: Check API health and key status
app.get("/api/health", (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const hasKey = !!(apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "");
  res.json({
    status: "ok",
    aiEnabled: hasKey,
    timestamp: new Date().toISOString()
  });
});

// 2. Endpoint: Generate a Spanish-learning multiple choice question
app.post("/api/spanish/generate-question", async (req: express.Request, res: express.Response) => {
  try {
    const { category, difficulty, seed } = req.body;
    
    const validCategories = ["vocab", "travel", "grammar", "slang", "listening"];
    const validDifficulties = ["beginner", "intermediate", "advanced"];
    
    const cat = validCategories.includes(category) ? category : "vocab";
    const diff = validDifficulties.includes(difficulty) ? difficulty : "beginner";
    
    const ai = getGeminiAI();
    
    let categoryDescription = "";
    if (cat === "vocab") {
      categoryDescription = "Spanish vocabulary, words, nouns, adjectives, or verbs and their English meanings.";
    } else if (cat === "travel") {
      categoryDescription = "Travel scenarios, greetings, ordering food, asking for directions, or essential questions in Spanish.";
    } else if (cat === "grammar") {
      categoryDescription = "Spanish grammar rules, tenses, verb conjugation (e.g., ser vs estar, por vs para, preterite vs imperfect), and grammatical gender.";
    } else if (cat === "slang") {
      categoryDescription = "Authentic colloquial expressions, idioms, or street slang used in Spanish-speaking countries (e.g., 'mola', 'guay', 'chévere', 'chido').";
    } else if (cat === "listening") {
      categoryDescription = "Listening comprehension. The 'spanishText' should contain a clean Spanish spoken phrase, and the question should ask what that spoken phrase translates to or what a key word in it means.";
    }

    const prompt = `Generate a highly engaging, unique multiple-choice question to teach Spanish.
Difficulty level: ${diff}
Learning Category: ${cat} (${categoryDescription})
Randomizer Seed: ${seed || Math.random()}

Make sure:
1. The question is clear and targeted.
2. The options include EXACTLY 4 strings, with only 1 correct answer.
3. The options should look plausible but have a clear single correct index (0-3).
4. 'spanishText' must contain the primary Spanish phrase involved in the question. This is crucial for audio pronunciation and listening challenges.
5. The 'explanation' must be a brief, friendly, encouraging pedagogical explanation in English about the grammar, slang, or word.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert, friendly bilingual Spanish-English Tutor. You construct structured language puzzles for a game, catering to the designated category and difficulty.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: "The learning question in English, or a Spanish fill-in-the-blank." },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 4 multiple-choice options."
            },
            correctIndex: { type: Type.INTEGER, description: "The 0-based index of the correct option (0 to 3)." },
            explanation: { type: Type.STRING, description: "Friendly, helpful explanation in English." },
            spanishText: { type: Type.STRING, description: "The core Spanish word or phrase spoken in the question, suitable for pronunciation (e.g. '¿Cuánto cuesta esto?' or 'bolígrafo')." }
          },
          required: ["question", "options", "correctIndex", "explanation", "spanishText"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text received from Gemini.");
    }

    const parsedQuestion = JSON.parse(resultText.trim());
    res.json(parsedQuestion);
  } catch (error: any) {
    console.error("Error generating question:", error);
    res.status(500).json({ error: error.message || "Failed to generate question" });
  }
});

// 3. Endpoint: AI Explanation and Tutoring Assistant
app.post("/api/spanish/explain", async (req: express.Request, res: express.Response) => {
  try {
    const { question, options, correctIndex, userAnswer, category, difficulty } = req.body;
    
    const ai = getGeminiAI();
    
    const prompt = `The user is playing a Spanish Tic-Tac-Toe game.
They faced this question in the ${category} category (Difficulty: ${difficulty}):
Question: "${question}"
Options: ${JSON.stringify(options)}
Correct Answer: "${options[correctIndex]}"
User selected: "${userAnswer}"

Please provide a highly supportive, friendly, and comprehensive pedagogical explanation of this Spanish concept.
- If they got it right, praise their language skills and add an extra fun fact or related vocabulary word.
- If they got it wrong, gently explain why the correct answer is right, why their selected answer might be a common mistake, and provide a clear tip to help them remember it next time.
Keep it conversational, warm, and brief (2-3 short paragraphs).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are 'Santi', a charismatic, helpful Spanish language coach who uses humorous, encouraging, and clear pedagogical guidance.",
      }
    });

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.error("Error in AI explanation:", error);
    res.status(500).json({ error: error.message || "Failed to generate explanation" });
  }
});

// 4. Endpoint: Spanish Text-To-Speech (TTS) using gemini-3.1-flash-tts-preview
app.post("/api/spanish/tts", async (req: express.Request, res: express.Response) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Text is required for TTS pronunciation." });
    }

    const ai = getGeminiAI();
    
    // We want the voice to sound native Spanish. We tell the model to speak the text in Spanish clearly.
    const prompt = `Pronounce this Spanish word or phrase clearly and naturally: "${text}"`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        // Specify Modality.AUDIO
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" }, // Kore sounds bright and natural
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio payload returned from Gemini TTS.");
    }

    res.json({ audio: base64Audio });
  } catch (error: any) {
    console.error("Error generating TTS:", error);
    res.status(500).json({ error: error.message || "Failed to generate pronunciation audio." });
  }
});

// 5. Endpoint: General AI Chat with Tutor Santi
app.post("/api/spanish/chat", async (req: express.Request, res: express.Response) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGeminiAI();
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction: "You are 'Santi', a warm, enthusiastic, and highly encouraging Spanish language tutor. You love teaching Spanish culture, vocabulary, and grammar. Always keep your responses supportive, fun, clear, and pedagogical. Include both Spanish and English explanations, along with simple examples. Keep it concise, around 2-3 brief paragraphs.",
      }
    });

    res.json({ text: response.text || "I was unable to formulate a response. Let's try again!" });
  } catch (error: any) {
    console.error("Error in Tutor Chat:", error);
    res.status(500).json({ error: error.message || "Failed to contact your tutor." });
  }
});

// 6. Integrate Vite in Development or Serve Static Build in Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
