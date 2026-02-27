import { GoogleGenerativeAI } from '@google/generative-ai';
import { SOURCE } from '../utils/constants.js';
import { AppError } from '../middleware/errorHandler.js';
import dotenv from 'dotenv';
dotenv.config();

// Check for API key
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing");
}

// Initialize Google Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Build the AI prompt for question generation
 */
const buildPrompt = (exam, subject, topic, difficulty, count) => {
  return `Generate ${count} multiple choice questions for ${exam} exam, subject: ${subject}, topic: ${topic}, difficulty: ${difficulty}.

Requirements:
- Each question must have exactly 4 options (A, B, C, D)
- Only ONE correct answer per question
- Provide a brief explanation for the correct answer
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
 * Validate AI response structure
 */
const validateAIResponse = (questions) => {
  if (!Array.isArray(questions)) {
    return false;
  }

  for (const q of questions) {
    const hasRequiredFields =
      q.question_text &&
      q.option_a &&
      q.option_b &&
      q.option_c &&
      q.option_d &&
      q.correct_option &&
      ['A', 'B', 'C', 'D'].includes(q.correct_option) &&
      q.difficulty &&
      q.source;

    if (!hasRequiredFields) {
      return false;
    }
  }

  return true;
};

/**
 * Extract JSON from Gemini response
 */
const extractJsonFromResponse = (text) => {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error('No valid JSON found in response');
};

/**
 * Generate questions using Google Gemini
 */
export const generateQuestionsWithAI = async (exam, subject, topic, difficulty, count) => {
  // List of models to try (in order of preference for free tier)
  const models = ['gemini-1.5-flash-8b', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  let lastError = null;

  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}`);

      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = buildPrompt(exam, subject, topic, difficulty, count);

      const result = await model.generateContent(prompt);
      const response = result.response;
      const content = response.text();

      if (!content) {
        throw new AppError('Empty response from AI', 500);
      }

      let questions;
      try {
        questions = extractJsonFromResponse(content);
      } catch (parseError) {
        console.error('AI JSON Parse Error:', parseError);
        console.error('AI Response:', content);
        throw new AppError('Invalid JSON format from AI response', 500);
      }

      if (!validateAIResponse(questions)) {
        throw new AppError('Invalid question structure in AI response', 500);
      }

      const enrichedQuestions = questions.map(q => ({
        ...q,
        exam,
        subject,
        topic,
        source: SOURCE.AI
      }));

      console.log(`✅ Successfully generated questions with model: ${modelName}`);
      return enrichedQuestions;

    } catch (error) {
      console.log(`Model ${modelName} failed:`, error.message?.substring(0, 100));
      lastError = error;

      // If it's a quota error, don't try other models
      if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        throw new AppError('Gemini API quota exceeded. Please check your billing.', 500);
      }

      // If it's an API key error, don't try other models
      if (error.message?.includes('API_KEY') || error.message?.includes('permission')) {
        throw new AppError('Invalid Gemini API key', 500);
      }

      // Continue to next model
    }
  }

  // All models failed
  throw lastError || new AppError('All Gemini models failed', 500);
};

/**
 * Generate questions with retry logic
 */
export const generateQuestionsWithRetry = async (
  exam,
  subject,
  topic,
  difficulty,
  count,
  maxRetries = 2  // Reduced retries since we try multiple models
) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`AI Generation Attempt ${attempt}/${maxRetries}`);
      return await generateQuestionsWithAI(exam, subject, topic, difficulty, count);
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error.message);

      // Don't retry on certain errors
      if (error.statusCode === 401 ||
        error.message?.includes('API key') ||
        error.message?.includes('not found')) {
        throw error;
      }
      if (
        error.message?.includes('429') ||
        error.message?.includes('RESOURCE_EXHAUSTED') ||
        error.message?.includes('quota')
      ) {
        throw new AppError(
          'Gemini free-tier quota exhausted. Please try again later.',
          429
        );
      }
    }
  }

  throw lastError || new AppError('Failed to generate questions after retries', 500);
};

export default {
  generateQuestionsWithAI,
  generateQuestionsWithRetry
};
