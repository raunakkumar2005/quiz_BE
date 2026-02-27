// Question difficulty levels
export const DIFFICULTY = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
  PYQ: 'PYQ'
};

// Question source
export const SOURCE = {
  AI: 'AI',
  PYQ: 'PYQ'
};

// Valid options
export const OPTIONS = ['A', 'B', 'C', 'D'];

// API Response messages
export const MESSAGES = {
  QUIZ_CREATED: 'Quiz created successfully',
  QUIZ_FETCHED: 'Quiz questions fetched successfully',
  QUIZ_SUBMITTED: 'Quiz submitted successfully',
  RESULT_FETCHED: 'Quiz result fetched successfully',
  INSUFFICIENT_QUESTIONS: 'Insufficient questions, generating from AI...',
  AI_GENERATION_SUCCESS: 'Questions generated successfully via AI',
  AI_GENERATION_FAILED: 'Failed to generate questions via AI',
  VALIDATION_ERROR: 'Validation error',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Internal server error'
};

// Default quiz configuration
export const DEFAULT_CONFIG = {
  MAX_QUESTIONS_PER_QUIZ: 50,
  MIN_QUESTIONS_FOR_QUIZ: 1,
  AI_GENERATION_BATCH_SIZE: 10
};
