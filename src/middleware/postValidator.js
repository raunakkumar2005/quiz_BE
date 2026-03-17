import { body, param, query, validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

/**
 * Post validation middleware
 */

// Validation for creating a post
export const validateCreatePost = [
  body('title')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('content')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  
  body('communityName')
    .isLength({ min: 3, max: 50 })
    .withMessage('Community name must be between 3 and 50 characters'),
  
  body('post_type')
    .optional()
    .isIn(['discussion', 'question', 'announcement', 'resource'])
    .withMessage('Post type must be one of: discussion, question, announcement, resource'),
  
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  
  body('tags.*')
    .isLength({ max: 50 })
    .withMessage('Each tag must be less than 50 characters'),
  
  body('is_anonymous')
    .optional()
    .isBoolean()
    .withMessage('is_anonymous must be a boolean'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      throw new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
    }
    next();
  }
];

// Validation for updating a post
export const validateUpdatePost = [
  param('postId')
    .isMongoId()
    .withMessage('Invalid post ID format'),
  
  body('title')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('content')
    .optional()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  
  body('post_type')
    .optional()
    .isIn(['discussion', 'question', 'announcement', 'resource'])
    .withMessage('Post type must be one of: discussion, question, announcement, resource'),
  
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  
  body('tags.*')
    .isLength({ max: 50 })
    .withMessage('Each tag must be less than 50 characters'),
  
  body('is_anonymous')
    .optional()
    .isBoolean()
    .withMessage('is_anonymous must be a boolean'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      throw new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
    }
    next();
  }
];

// Validation for voting on a post
export const validateVote = [
  body('voteType')
    .isIn(['upvote', 'downvote'])
    .withMessage('Vote type must be either upvote or downvote'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      throw new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
    }
    next();
  }
];

// Validation for post query parameters
export const validatePostQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip must be a non-negative integer'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      throw new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
    }
    next();
  }
];

// Validation for post search
export const validatePostSearch = [
  query('q')
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  
  query('communityName')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Community name must be between 3 and 50 characters'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip must be a non-negative integer'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      throw new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
    }
    next();
  }
];