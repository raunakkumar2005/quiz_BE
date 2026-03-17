import express from 'express';
import postController from '../controllers/postController.js';
import { authenticate } from '../middleware/auth.js';
import { validateCreatePost, validateUpdatePost, validateVote } from '../middleware/postValidator.js';

const router = express.Router();

// All post routes require authentication
router.use(authenticate);

// POST /api/posts - Create a new post
router.post('/', validateCreatePost, postController.createPost);

// GET /api/posts/:postId - Get post by ID
router.get('/:postId', postController.getPost);

// PUT /api/posts/:postId - Update a post
router.put('/:postId', validateUpdatePost, postController.updatePost);

// DELETE /api/posts/:postId - Delete a post
router.delete('/:postId', postController.deletePost);

// POST /api/posts/:postId/vote - Vote on a post
router.post('/:postId/vote', validateVote, postController.voteOnPost);

// GET /api/posts/user/:userId - Get user's posts
router.get('/user/:userId', postController.getUserPosts);

// POST /api/posts/:postId/pin - Pin/unpin a post
router.post('/:postId/pin', postController.togglePinPost);

// POST /api/posts/:postId/lock - Lock/unlock a post
router.post('/:postId/lock', postController.toggleLockPost);

// GET /api/posts/search - Search posts
router.get('/search', postController.searchPosts);

export default router;