import { body, param, query, validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

/**
 * Community validation middleware
 */

// Validation for creating a community
export const validateCreateCommunity = [
  body('name')
    .isLength({ min: 3, max: 50 })
    .withMessage('Community name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Community name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  body('description')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('exam')
    .isLength({ min: 2, max: 100 })
    .withMessage('Exam name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('Exam name can only contain letters, numbers, and spaces'),
  
  body('rules')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Rules must be an array with maximum 10 items'),
  
  body('rules.*')
    .isLength({ max: 200 })
    .withMessage('Each rule must be less than 200 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      throw new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
    }
    next();
  }
];

// Validation for joining a community
export const validateJoinCommunity = [
  param('communityName')
    .isLength({ min: 3, max: 50 })
    .withMessage('Community name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Community name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      throw new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
    }
    next();
  }
];

// Validation for moderator actions (add/remove moderator, ban user)
export const validateModeratorAction = [
  param('communityName')
    .isLength({ min: 3, max: 50 })
    .withMessage('Community name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Community name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      throw new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
    }
    next();
  }
];

// Validation for community query parameters
export const validateCommunityQuery = [
  query('exam')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Exam filter must be less than 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Exam filter can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip must be a non-negative integer'),
  
  query('sortBy')
    .optional()
    .isIn(['new', 'top', 'hot'])
    .withMessage('SortBy must be one of: new, top, hot'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      throw new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
    }
    next();
  }
];

// Validation for community post queries
export const validateCommunityPostsQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip must be a non-negative integer'),
  
  query('sortBy')
    .optional()
    .isIn(['new', 'top', 'hot'])
    .withMessage('SortBy must be one of: new, top, hot'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      throw new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
    }
    next();
  }
];