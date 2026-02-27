import quizService from '../services/quizService.js';
import { MESSAGES } from '../utils/constants.js';

/**
 * Create a new quiz
 */
export const createQuiz = async (req, res, next) => {
  const { exam, subject, topic, difficulty, num_questions } = req.body;

  const result = await quizService.createQuiz({
    exam,
    subject,
    topic,
    difficulty,
    num_questions
  });

  res.status(201).json({
    success: true,
    message: result.message,
    data: {
      quiz_id: result.quiz._id,
      exam: result.quiz.exam,
      subject: result.quiz.subject,
      topic: result.quiz.topic,
      difficulty: result.quiz.difficulty,
      total_questions: result.total_questions,
      ai_generated: result.ai_generated,
      created_at: result.quiz.created_at
    }
  });
};

/**
 * Get quiz questions (without correct answers)
 */
export const getQuizQuestions = async (req, res, next) => {
  const { quiz_id } = req.params;

  const result = await quizService.getQuizQuestions(quiz_id);

  res.status(200).json({
    success: true,
    message: MESSAGES.QUIZ_FETCHED,
    data: result
  });
};

/**
 * Submit quiz answers
 */
export const submitQuiz = async (req, res, next) => {
  // Get quiz_id from params (URL)
  const { quiz_id } = req.params;
  const { answers } = req.body;

  const result = await quizService.submitQuiz(quiz_id, answers);

  res.status(200).json({
    success: true,
    message: MESSAGES.QUIZ_SUBMITTED,
    data: result
  });
};

/**
 * Get quiz result
 */
export const getQuizResult = async (req, res, next) => {
  const { quiz_id } = req.params;

  const result = await quizService.getQuizResult(quiz_id);

  res.status(200).json({
    success: true,
    message: MESSAGES.RESULT_FETCHED,
    data: result
  });
};

export default {
  createQuiz,
  getQuizQuestions,
  submitQuiz,
  getQuizResult
};
