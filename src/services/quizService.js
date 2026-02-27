import Quiz from '../models/Quiz.js';
import QuizQuestion from '../models/QuizQuestion.js';
import QuizAttempt from '../models/QuizAttempt.js';
import questionService from './questionService.js';
import aiService from './aiService.js';
import { DEFAULT_CONFIG, MESSAGES } from '../utils/constants.js';
import { selectRandomItems, shuffleArray } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Create a new quiz with questions
 * @param {Object} quizData - Quiz configuration
 * @returns {Object} - Created quiz with questions
 */
export const createQuiz = async (quizData) => {
  const { exam, subject, topic, difficulty, num_questions } = quizData;

  // Step 1: Try to find existing questions in database
  let questions = await questionService.getRandomQuestions(
    exam,
    subject,
    topic,
    difficulty,
    num_questions
  );

  let aiGenerated = false;
  let message = MESSAGES.QUIZ_CREATED;

  // Step 2: If insufficient questions, use AI to generate more
  if (questions.length < num_questions) {
    const neededQuestions = num_questions - questions.length;
    console.log(`Insufficient questions (${questions.length}/${num_questions}). Generating ${neededQuestions} via AI...`);
    message = MESSAGES.INSUFFICIENT_QUESTIONS;

    try {
      // Generate missing questions via AI
      const generatedQuestions = await aiService.generateQuestionsWithRetry(
        exam,
        subject,
        topic,
        difficulty,
        neededQuestions
      );

      // Save AI-generated questions to database
      if (generatedQuestions && generatedQuestions.length > 0) {
        const savedQuestions = await questionService.createQuestions(generatedQuestions);
        questions = [...questions, ...savedQuestions];
        aiGenerated = true;
        console.log(`Successfully generated and saved ${savedQuestions.length} questions via AI`);
      }
    } catch (aiError) {
      console.error('AI Generation Failed:', aiError.message);
      // If AI fails and we have some questions, proceed with available questions
      // If no questions at all, throw error
      if (questions.length === 0) {
        throw new AppError(MESSAGES.AI_GENERATION_FAILED, 500);
      }
    }
  }

  // Step 3: If still more questions than needed, select random subset
  if (questions.length > num_questions) {
    questions = selectRandomItems(questions, num_questions);
  }

  // Step 4: Create the quiz
  const quiz = await Quiz.create({
    exam,
    subject,
    topic,
    difficulty,
    total_questions: questions.length
  });

  // Step 5: Map quiz to questions
  const quizQuestions = questions.map((question, index) => ({
    quiz_id: quiz._id,
    question_id: question._id,
    order: index + 1
  }));

  await QuizQuestion.insertMany(quizQuestions);

  return {
    quiz,
    questions: questions.map(q => q._id),
    total_questions: questions.length,
    ai_generated: aiGenerated,
    message
  };
};

/**
 * Get quiz questions for display (without correct answers)
 * @param {string} quizId - Quiz ID
 * @returns {Object} - Quiz with questions (hidden answers)
 */
export const getQuizQuestions = async (quizId) => {
  // Get quiz details
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) {
    throw new AppError('Quiz not found', 404);
  }

  // Get quiz-question mappings
  const quizQuestionMappings = await QuizQuestion.find({ quiz_id: quizId })
    .sort({ order: 1 })
    .lean();

  // Get question IDs
  const questionIds = quizQuestionMappings.map(m => m.question_id);

  // Get full question details
  const questions = await questionService.findQuestionsByIds(questionIds);

  // Create a map for ordering
  const questionOrderMap = {};
  quizQuestionMappings.forEach(m => {
    questionOrderMap[m.question_id.toString()] = m.order;
  });

  // Process questions - hide correct answers and shuffle options per user
  const processedQuestions = questions.map(q => {
    const { correct_option, explanation, ...questionWithoutAnswer } = q;
    return {
      ...questionWithoutAnswer,
      // Add shuffled options for this session
      options: shuffleArray([
        { key: 'A', value: q.option_a },
        { key: 'B', value: q.option_b },
        { key: 'C', value: q.option_c },
        { key: 'D', value: q.option_d }
      ])
    };
  });

  // Sort by order
  processedQuestions.sort((a, b) => {
    const orderA = questionOrderMap[a._id.toString()];
    const orderB = questionOrderMap[b._id.toString()];
    return orderA - orderB;
  });

  return {
    quiz: {
      _id: quiz._id,
      exam: quiz.exam,
      subject: quiz.subject,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      total_questions: quiz.total_questions,
      created_at: quiz.created_at
    },
    questions: processedQuestions
  };
};

/**
 * Submit quiz answers and get results
 * @param {string} quizId - Quiz ID
 * @param {Array} answers - Array of answers
 * @returns {Object} - Quiz result summary
 */
export const submitQuiz = async (quizId, answers) => {
  // Get quiz
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) {
    throw new AppError('Quiz not found', 404);
  }

  // Get all question IDs for this quiz
  const quizQuestionMappings = await QuizQuestion.find({ quiz_id: quizId }).lean();
  const questionIdMap = {};
  quizQuestionMappings.forEach(m => {
    questionIdMap[m.question_id.toString()] = m;
  });

  // Get all questions to validate answers
  const questionIds = quizQuestionMappings.map(m => m.question_id);
  const questions = await questionService.findQuestionsByIds(questionIds);

  // Create a map for quick lookup
  const questionMap = {};
  questions.forEach(q => {
    questionMap[q._id.toString()] = q;
  });

  // Process each answer
  const results = [];
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  for (const answer of answers) {
    const questionId = answer.question_id;
    const question = questionMap[questionId.toString()];

    if (!question) {
      continue; // Skip invalid question IDs
    }

    const isCorrect = question.correct_option === answer.selected_option;

    if (isCorrect) {
      correctCount++;
    } else if (answer.selected_option) {
      incorrectCount++;
    } else {
      unansweredCount++;
    }

    // Store attempt
    await QuizAttempt.findOneAndUpdate(
      { quiz_id: quizId, question_id: questionId },
      {
        quiz_id: quizId,
        question_id: questionId,
        selected_option: answer.selected_option || null,
        is_correct: isCorrect
      },
      { upsert: true, new: true }
    );

    results.push({
      question_id: questionId,
      selected_option: answer.selected_option,
      correct_option: question.correct_option,
      is_correct: isCorrect,
      explanation: question.explanation
    });
  }

  // Calculate score
  const totalAnswered = correctCount + incorrectCount;
  const scorePercentage = totalAnswered > 0 
    ? Math.round((correctCount / totalAnswered) * 100) 
    : 0;

  return {
    quiz_id: quizId,
    total_questions: quiz.total_questions,
    correct_answers: correctCount,
    incorrect_answers: incorrectCount,
    unanswered: unansweredCount,
    score_percentage: scorePercentage,
    results: results.sort((a, b) => {
      const orderA = questionIdMap[a.question_id.toString()]?.order || 0;
      const orderB = questionIdMap[b.question_id.toString()]?.order || 0;
      return orderA - orderB;
    })
  };
};

/**
 * Get quiz result by ID
 * @param {string} quizId - Quiz ID
 * @returns {Object} - Quiz result
 */
export const getQuizResult = async (quizId) => {
  // Get quiz
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) {
    throw new AppError('Quiz not found', 404);
  }

  // Get all attempts
  const attempts = await QuizAttempt.find({ quiz_id: quizId }).lean();

  if (attempts.length === 0) {
    return {
      quiz_id: quizId,
      total_questions: quiz.total_questions,
      correct_answers: 0,
      incorrect_answers: 0,
      unanswered: quiz.total_questions,
      score_percentage: 0,
      results: []
    };
  }

  // Calculate stats
  const correctCount = attempts.filter(a => a.is_correct).length;
  const incorrectCount = attempts.filter(a => !a.is_correct && a.selected_option).length;
  const unansweredCount = quiz.total_questions - attempts.length;

  const totalAnswered = correctCount + incorrectCount;
  const scorePercentage = totalAnswered > 0
    ? Math.round((correctCount / totalAnswered) * 100)
    : 0;

  // Get question details for results
  const questionIds = attempts.map(a => a.question_id);
  const questions = await questionService.findQuestionsByIds(questionIds);
  
  const questionMap = {};
  questions.forEach(q => {
    questionMap[q._id.toString()] = q;
  });

  const results = attempts.map(attempt => {
    const question = questionMap[attempt.question_id.toString()];
    return {
      question_id: attempt.question_id,
      selected_option: attempt.selected_option,
      correct_option: question?.correct_option,
      is_correct: attempt.is_correct,
      explanation: question?.explanation
    };
  });

  return {
    quiz_id: quizId,
    total_questions: quiz.total_questions,
    correct_answers: correctCount,
    incorrect_answers: incorrectCount,
    unanswered: unansweredCount,
    score_percentage: scorePercentage,
    results
  };
};

export default {
  createQuiz,
  getQuizQuestions,
  submitQuiz,
  getQuizResult
};
