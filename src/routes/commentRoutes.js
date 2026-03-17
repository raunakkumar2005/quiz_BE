import express from 'express';
import commentController from '../controllers/commentController.js';
import { authenticate } from '../middleware/auth.js';
import { validateCreateComment, validateUpdateComment, validateVote } from '../middleware/commentValidator.js';

const router = express.Router();

// All comment routes require authentication
router.use(authenticate);

// POST /api/posts/:postId/comments - Create a new comment
router.post('/posts/:postId/comments', validateCreateComment, commentController.createComment);

// GET /api/comments/:commentId - Get comment by ID
router.get('/:commentId', commentController.getComment);

// PUT /api/comments/:commentId - Update a comment
router.put('/:commentId', validateUpdateComment, commentController.updateComment);

// DELETE /api/comments/:commentId - Delete a comment
router.delete('/:commentId', commentController.deleteComment);

// POST /api/comments/:commentId/vote - Vote on a comment
router.post('/:commentId/vote', validateVote, commentController.voteOnComment);

// GET /api/posts/:postId/comments - Get comments for a post
router.get('/posts/:postId/comments', commentController.getPostComments);

// GET /api/comments/user/:userId - Get user's comments
router.get('/user/:userId', commentController.getUserComments);

// GET /api/posts/:postId/comments/top - Get top-level comments for a post
router.get('/posts/:postId/comments/top', commentController.getTopLevelComments);

// GET /api/comments/:commentId/replies - Get replies to a comment
router.get('/:commentId/replies', commentController.getCommentReplies);

export default router;