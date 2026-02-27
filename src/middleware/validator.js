import { DIFFICULTY, OPTIONS } from '../utils/constants.js';
import { AppError } from './errorHandler.js';

/**
 * Validate quiz creation request body
 */
export const validateCreateQuiz = (req, res, next) => {
  const { exam, subject, topic, difficulty, num_questions } = req.body;

  if (!exam || !subject || !topic || !difficulty || !num_questions) {
    throw new AppError('Missing required fields: exam, subject, topic, difficulty, num_questions', 400);
  }

  if (!Object.values(DIFFICULTY).includes(difficulty)) {
    throw new AppError(`Invalid difficulty. Must be one of: ${Object.values(DIFFICULTY).join(', ')}`, 400);
  }

  if (typeof num_questions !== 'number' || num_questions < 1 || num_questions > 50) {
    throw new AppError('num_questions must be a number between 1 and 50', 400);
  }

  next();
};

/**
 * Validate quiz submission request body
 */
export const validateSubmitQuiz = (req, res, next) => {
  // Get quiz_id from params (URL) instead of body
  const { quiz_id } = req.params;
  const { answers } = req.body;

  if (!quiz_id || !answers) {
    throw new AppError('Missing required fields: quiz_id, answers', 400);
  }

  if (!Array.isArray(answers)) {
    throw new AppError('answers must be an array', 400);
  }

  for (const answer of answers) {
    if (!answer.question_id || !answer.selected_option) {
      throw new AppError('Each answer must have question_id and selected_option', 400);
    }

    if (!OPTIONS.includes(answer.selected_option)) {
      throw new AppError(`Invalid selected_option. Must be one of: ${OPTIONS.join(', ')}`, 400);
    }
  }

  next();
};

/**
 * Validate quiz ID parameter
 */
export const validateQuizId = (req, res, next) => {
  const { quiz_id } = req.params;

  if (!quiz_id) {
    throw new AppError('Quiz ID is required', 400);
  }

  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(quiz_id)) {
    throw new AppError('Invalid Quiz ID format', 400);
  }

  next();
};
