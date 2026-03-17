import { body, param, query, validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

/**
 * Comment validation middleware
 */

// Validation for creating a comment
export const validateCreateComment = [
  param('postId')
    .isMongoId()
    .withMessage('Invalid post ID format'),
  
  body('content')
    .isLength({ min: 2, max: 2000 })
    .withMessage('Comment content must be between 2 and 2000 characters'),
  
  body('parentCommentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID format'),
  
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

// Validation for updating a comment
export const validateUpdateComment = [
  param('commentId')
    .isMongoId()
    .withMessage('Invalid comment ID format'),
  
  body('content')
    .isLength({ min: 2, max: 2000 })
    .withMessage('Comment content must be between 2 and 2000 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      throw new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
    }
    next();
  }
];

// Validation for voting on a comment
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

// Validation for comment query parameters
export const validateCommentQuery = [
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

// Validation for comment replies
export const validateCommentReplies = [
  param('commentId')
    .isMongoId()
    .withMessage('Invalid comment ID format'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      throw new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
    }
    next();
  }
];