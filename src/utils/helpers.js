import { OPTIONS } from './constants.js';

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Select random items from an array
 * @param {Array} array - Array to select from
 * @param {number} count - Number of items to select
 * @returns {Array} - Selected items
 */
export const selectRandomItems = (array, count) => {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
};

/**
 * Shuffle question options and track the new correct option
 * @param {Object} question - Question object with options and correct_option
 * @returns {Object} - Question with shuffled options and updated correct_option
 */
export const shuffleQuestionOptions = (question) => {
  const optionKeys = ['option_a', 'option_b', 'option_c', 'option_d'];
  const options = optionKeys.map(key => question[key]);
  const shuffledOptions = shuffleArray(options);
  
  // Find the index of correct option in shuffled array
  const correctIndex = shuffledOptions.indexOf(question[`option_${question.correct_option.toLowerCase()}`]);
  const newCorrectOption = OPTIONS[correctIndex];
  
  return {
    ...question,
    option_a: shuffledOptions[0],
    option_b: shuffledOptions[1],
    option_c: shuffledOptions[2],
    option_d: shuffledOptions[3],
    correct_option: newCorrectOption,
    original_correct_option: question.correct_option
  };
};

/**
 * Format API response
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {any} data - Response data
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Formatted response
 */
export const formatResponse = (success, message, data = null, statusCode = 200) => {
  const response = {
    success,
    message
  };
  if (data !== null) {
    response.data = data;
  }
  return response;
};

/**
 * Validate required fields
 * @param {Object} obj - Object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - Validation result { valid: boolean, missing: Array }
 */
export const validateRequiredFields = (obj, requiredFields) => {
  const missing = requiredFields.filter(field => !obj[field]);
  return {
    valid: missing.length === 0,
    missing
  };
};

/**
 * Generate pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} - Pagination metadata
 */
export const generatePaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};
