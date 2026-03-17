import express from 'express';
import communityController from '../controllers/communityController.js';
import { authenticate } from '../middleware/auth.js';
import { validateCreateCommunity, validateJoinCommunity, validateModeratorAction } from '../middleware/communityValidator.js';

const router = express.Router();

// All community routes require authentication
router.use(authenticate);

// POST /api/communities - Create a new community
router.post('/', validateCreateCommunity, communityController.createCommunity);

// GET /api/communities - Get all communities with filtering
router.get('/', communityController.getCommunities);

// GET /api/communities/:communityName - Get community by name
router.get('/:communityName', communityController.getCommunity);

// POST /api/communities/:communityName/join - Join a community
router.post('/:communityName/join', communityController.joinCommunity);

// POST /api/communities/:communityName/leave - Leave a community
router.post('/:communityName/leave', communityController.leaveCommunity);

// POST /api/communities/:communityName/moderators/add - Add moderator
router.post('/:communityName/moderators/add', validateModeratorAction, communityController.addModerator);

// POST /api/communities/:communityName/moderators/remove - Remove moderator
router.post('/:communityName/moderators/remove', validateModeratorAction, communityController.removeModerator);

// POST /api/communities/:communityName/ban - Ban user
router.post('/:communityName/ban', validateModeratorAction, communityController.banUser);

// GET /api/communities/:communityName/posts - Get community posts
router.get('/:communityName/posts', communityController.getCommunityPosts);

// GET /api/communities/:communityName/trending - Get trending posts in community
router.get('/:communityName/trending', (req, res, next) => {
  // Override sortBy to 'top' for trending
  req.query.sortBy = 'top';
  communityController.getCommunityPosts(req, res, next);
});

export default router;