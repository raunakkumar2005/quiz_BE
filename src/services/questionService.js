import Question from '../models/Question.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Find questions by criteria
 * @param {Object} filters - Query filters
 * @param {number} limit - Max questions to return
 * @returns {Array} - Array of questions
 */
export const findQuestions = async (filters, limit = null) => {
  const query = Question.find(filters);
  
  if (limit) {
    query.limit(limit);
  }
  
  return await query.lean();
};

/**
 * Count questions by criteria
 * @param {Object} filters - Query filters
 * @returns {number} - Count of questions
 */
export const countQuestions = async (filters) => {
  return await Question.countDocuments(filters);
};

/**
 * Create multiple questions
 * @param {Array} questions - Array of question objects
 * @returns {Array} - Created questions
 */
export const createQuestions = async (questions) => {
  return await Question.insertMany(questions, { ordered: false });
};

/**
 * Get questions by exam, subject, topic, and difficulty
 * @param {string} exam - Exam name
 * @param {string} subject - Subject name
 * @param {string} topic - Topic name
 * @param {string} difficulty - Difficulty level
 * @param {number} limit - Number of questions to fetch
 * @returns {Array} - Array of questions
 */
export const getQuestionsByCriteria = async (exam, subject, topic, difficulty, limit) => {
  const filters = {
    exam,
    subject,
    topic,
    difficulty
  };
  
  return await findQuestions(filters, limit);
};

/**
 * Get random questions by criteria
 * @param {string} exam - Exam name
 * @param {string} subject - Subject name
 * @param {string} topic - Topic name
 * @param {string} difficulty - Difficulty level
 * @param {number} count - Number of questions to fetch
 * @returns {Array} - Random questions
 */
export const getRandomQuestions = async (exam, subject, topic, difficulty, count) => {
  return await Question.aggregate([
    {
      $match: {
        exam,
        subject,
        topic,
        difficulty
      }
    },
    { $sample: { size: count } }
  ]);
};

/**
 * Find a question by ID
 * @param {string} questionId - Question ID
 * @returns {Object} - Question object
 */
export const findQuestionById = async (questionId) => {
  const question = await Question.findById(questionId).lean();
  if (!question) {
    throw new AppError('Question not found', 404);
  }
  return question;
};

/**
 * Find multiple questions by IDs
 * @param {Array} questionIds - Array of question IDs
 * @returns {Array} - Array of questions
 */
export const findQuestionsByIds = async (questionIds) => {
  return await Question.find({ _id: { $in: questionIds } }).lean();
};

export default {
  findQuestions,
  countQuestions,
  createQuestions,
  getQuestionsByCriteria,
  getRandomQuestions,
  findQuestionById,
  findQuestionsByIds
};
