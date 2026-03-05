import { GoogleGenerativeAI } from '@google/generative-ai';
import { SOURCE } from '../utils/constants.js';
import { AppError } from '../middleware/errorHandler.js';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * small helper to avoid rate limits
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Build the AI prompt
 */
const buildPrompt = (exam, subject, topic, difficulty, count) => {
  return `Generate ${count} multiple choice questions for ${exam} exam, subject: ${subject}, topic: ${topic}, difficulty: ${difficulty}.

Requirements:
- Each question must have exactly 4 options (A, B, C, D)
- Only ONE correct answer per question
- Explanation must be under 40 words
- Return ONLY valid JSON array, no markdown, no extra text
- Each question object must have: question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, source

JSON format:
[
  {
    "question_text": "",
    "option_a": "",
    "option_b": "",
    "option_c": "",
    "option_d": "",
    "correct_option": "A|B|C|D",
    "explanation": "",
    "difficulty": "${difficulty}",
    "source": "AI"
  }
]`;
};

/**
 * Validate AI response
 */
const validateAIResponse = (questions) => {
  if (!Array.isArray(questions)) return false;

  for (const q of questions) {
    if (
      !q.question_text ||
      !q.option_a ||
      !q.option_b ||
      !q.option_c ||
      !q.option_d ||
      !q.correct_option ||
      !['A', 'B', 'C', 'D'].includes(q.correct_option) ||
      !q.difficulty ||
      !q.source
    ) {
      return false;
    }
  }

  return true;
};

/**
 * Extract JSON safely from model response
 */
const extractJsonFromResponse = (text) => {
  try {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');

    if (start === -1 || end === -1) {
      throw new Error();
    }

    const jsonString = text.substring(start, end + 1);

    return JSON.parse(jsonString);
  } catch {
    throw new Error('No valid JSON found in response');
  }
};

/**
 * Generate questions using Gemini
 */
export const generateQuestionsWithAI = async (
  exam,
  subject,
  topic,
  difficulty,
  count
) => {

  const models = ['gemini-2.0-flash-lite'];
  let lastError = null;

  for (const modelName of models) {

    try {

      console.log(`Trying model: ${modelName}`);

      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = buildPrompt(exam, subject, topic, difficulty, count);

      const result = await model.generateContent(prompt);

      const content = result.response?.text();

      if (!content) {
        throw new AppError('Empty response from AI', 500);
      }

      const questions = extractJsonFromResponse(content);

      if (!validateAIResponse(questions)) {
        throw new AppError('Invalid question structure in AI response', 500);
      }

      const enrichedQuestions = questions.map((q) => ({
        ...q,
        exam,
        subject,
        topic,
        source: SOURCE.AI
      }));

      console.log(`✅ Questions generated successfully`);

      return enrichedQuestions;

    } catch (error) {

      lastError = error;

      const msg = error.message || '';

      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        console.log('Rate limit reached. Waiting 5 seconds...');
        await sleep(5000);
        continue;
      }

      if (msg.includes('API_KEY') || msg.includes('permission')) {
        throw new AppError('Invalid Gemini API key', 500);
      }

      console.log(`Model ${modelName} failed:`, msg.substring(0, 120));
    }
  }

  throw lastError || new AppError('All Gemini models failed', 500);
};

/**
 * Retry wrapper
 */
export const generateQuestionsWithRetry = async (
  exam,
  subject,
  topic,
  difficulty,
  count,
  maxRetries = 3
) => {

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {

    try {

      console.log(`AI Generation Attempt ${attempt}/${maxRetries}`);

      return await generateQuestionsWithAI(
        exam,
        subject,
        topic,
        difficulty,
        count
      );

    } catch (error) {

      lastError = error;

      const msg = error.message || '';

      console.error(`Attempt ${attempt} failed:`, msg);

      if (
        msg.includes('API key') ||
        msg.includes('permission') ||
        error.statusCode === 401
      ) {
        throw error;
      }

      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {

        if (attempt === maxRetries) {
          throw new AppError(
            'Gemini free-tier quota exhausted. Please try again later.',
            429
          );
        }

        const wait = attempt * 4000;

        console.log(`Waiting ${wait}ms before retry...`);

        await sleep(wait);
      }
    }
  }

  throw lastError || new AppError('Failed to generate questions', 500);
};

export default {
  generateQuestionsWithAI,
  generateQuestionsWithRetry
};
