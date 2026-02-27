import express from 'express';
import quizController from '../controllers/quizController.js';
import { validateCreateQuiz, validateSubmitQuiz, validateQuizId } from '../middleware/validator.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All quiz routes require authentication
// router.use(authenticate);

// POST /api/quizzes - Create a new quiz
router.post('/', validateCreateQuiz, asyncHandler(quizController.createQuiz));

// GET /api/quizzes/:quiz_id/questions - Get quiz questions
router.get('/:quiz_id/questions', validateQuizId, asyncHandler(quizController.getQuizQuestions));

// POST /api/quizzes/:quiz_id/submit - Submit quiz answers
router.post('/:quiz_id/submit', validateQuizId, validateSubmitQuiz, asyncHandler(quizController.submitQuiz));

// GET /api/quizzes/:quiz_id/result - Get quiz result
router.get('/:quiz_id/result', validateQuizId, asyncHandler(quizController.getQuizResult));

export default router;
