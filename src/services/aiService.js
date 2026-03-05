import { GoogleGenerativeAI } from "@google/generative-ai";
import { SOURCE } from "../utils/constants.js";
import { AppError } from "../middleware/errorHandler.js";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ---------------- RATE LIMIT GUARD ---------------- */

let lastRequestTime = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const throttle = async () => {
  const MIN_DELAY = 1200; // ~1 request/sec safe for free tier

  const now = Date.now();
  const diff = now - lastRequestTime;

  if (diff < MIN_DELAY) {
    await sleep(MIN_DELAY - diff);
  }

  lastRequestTime = Date.now();
};

/* ---------------- EXPONENTIAL BACKOFF ---------------- */

const getBackoffDelay = (attempt) => {
  const base = 2000;
  const jitter = Math.random() * 1000;
  return base * Math.pow(2, attempt) + jitter;
};

/* ---------------- PROMPT BUILDER ---------------- */

const buildPrompt = (exam, subject, topic, difficulty, count) => {
  return `Generate ${count} multiple choice questions.

Exam: ${exam}
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}

Rules:
- Exactly 4 options (A,B,C,D)
- Only one correct option
- Explanation under 40 words
- Return ONLY valid JSON
- No markdown
- No extra text

JSON format:

[
{
"question_text":"",
"option_a":"",
"option_b":"",
"option_c":"",
"option_d":"",
"correct_option":"A",
"explanation":"",
"difficulty":"${difficulty}",
"source":"AI"
}
]`;
};

/* ---------------- JSON PARSER ---------------- */

const extractJsonFromResponse = (text) => {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");

    if (start === -1 || end === -1) {
      throw new Error("JSON not found");
    }

    const jsonString = cleaned.substring(start, end + 1);

    return JSON.parse(jsonString);
  } catch (err) {
    throw new AppError("Failed to parse AI response JSON", 500);
  }
};

/* ---------------- VALIDATION ---------------- */

const validateAIResponse = (questions) => {
  if (!Array.isArray(questions)) return false;

  for (const q of questions) {
    if (
      !q.question_text ||
      !q.option_a ||
      !q.option_b ||
      !q.option_c ||
      !q.option_d ||
      !["A", "B", "C", "D"].includes(q.correct_option)
    ) {
      return false;
    }
  }

  return true;
};

/* ---------------- AI GENERATION ---------------- */

export const generateQuestionsWithAI = async (
  exam,
  subject,
  topic,
  difficulty,
  count
) => {
  const models = [
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.5-flash"
  ];

  let lastError = null;

  for (const modelName of models) {
    try {
      console.log(`🤖 Trying model: ${modelName}`);

      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = buildPrompt(exam, subject, topic, difficulty, count);

      await throttle();

      const result = await model.generateContent(prompt);

      const text = result?.response?.text();

      if (!text) {
        throw new AppError("Empty response from AI", 500);
      }

      const questions = extractJsonFromResponse(text);

      if (!validateAIResponse(questions)) {
        throw new AppError("Invalid AI response structure", 500);
      }

      const enrichedQuestions = questions.map((q) => ({
        ...q,
        exam,
        subject,
        topic,
        source: SOURCE.AI,
      }));

      console.log("✅ Questions generated");

      return enrichedQuestions;
    } catch (error) {
      lastError = error;

      const msg = error?.message || "";

      console.log(`⚠️ Model ${modelName} failed:`, msg.slice(0, 120));

      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        console.log("⏳ Rate limit hit. Switching model...");
        continue;
      }

      if (msg.includes("API_KEY") || msg.includes("permission")) {
        throw new AppError("Invalid Gemini API key", 401);
      }
    }
  }

  throw lastError || new AppError("All Gemini models failed", 500);
};

/* ---------------- RETRY WRAPPER ---------------- */

export const generateQuestionsWithRetry = async (
  exam,
  subject,
  topic,
  difficulty,
  count,
  maxRetries = 4
) => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🚀 AI generation attempt ${attempt + 1}/${maxRetries}`);

      return await generateQuestionsWithAI(
        exam,
        subject,
        topic,
        difficulty,
        count
      );
    } catch (error) {
      lastError = error;

      const msg = error?.message || "";

      console.error("❌ Attempt failed:", msg);

      if (
        msg.includes("API key") ||
        msg.includes("permission") ||
        error.statusCode === 401
      ) {
        throw error;
      }

      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        if (attempt === maxRetries - 1) {
          throw new AppError(
            "Gemini quota exhausted. Try again later.",
            429
          );
        }

        const delay = getBackoffDelay(attempt);

        console.log(`⏳ Waiting ${delay}ms before retry`);

        await sleep(delay);
      }
    }
  }

  throw lastError || new AppError("AI generation failed", 500);
};

export default {
  generateQuestionsWithAI,
  generateQuestionsWithRetry,
};
