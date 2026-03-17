import communityService from '../services/communityService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Community Controller - Handles community-related HTTP requests
 */
class CommunityController {

  /**
   * Create a new community
   */
  createCommunity = asyncHandler(async (req, res) => {
    const { name, description, exam, rules } = req.body;
    const userId = req.userId;

    const community = await communityService.createCommunity(
      { name, description, exam, rules },
      userId
    );

    res.status(201).json({
      success: true,
      data: community,
      message: 'Community created successfully'
    });
  });

  /**
   * Get community by name
   */
  getCommunity = asyncHandler(async (req, res) => {
    const { communityName } = req.params;

    const community = await communityService.getCommunityByName(communityName);

    res.json({
      success: true,
      data: community
    });
  });

  /**
   * Get all communities with filtering
   */
  getCommunities = asyncHandler(async (req, res) => {
    const { exam, search, limit = 20, skip = 0 } = req.query;

    const filter = {};
    if (exam) filter.exam = exam;
    if (search) filter.search = search;

    const result = await communityService.getCommunities(
      filter,
      parseInt(limit),
      parseInt(skip)
    );

    res.json({
      success: true,
      data: result
    });
  });

  /**
   * Join a community
   */
  joinCommunity = asyncHandler(async (req, res) => {
    const { communityName } = req.params;
    const userId = req.userId;

    const community = await communityService.joinCommunity(communityName, userId);

    res.json({
      success: true,
      data: community,
      message: 'Successfully joined community'
    });
  });

  /**
   * Leave a community
   */
  leaveCommunity = asyncHandler(async (req, res) => {
    const { communityName } = req.params;
    const userId = req.userId;

    const community = await communityService.leaveCommunity(communityName, userId);

    res.json({
      success: true,
      data: community,
      message: 'Successfully left community'
    });
  });

  /**
   * Add moderator to community
   */
  addModerator = asyncHandler(async (req, res) => {
    const { communityName } = req.params;
    const { userId: targetUserId } = req.body;
    const userId = req.userId;

    const community = await communityService.addModerator(
      communityName,
      userId,
      targetUserId
    );

    res.json({
      success: true,
      data: community,
      message: 'Moderator added successfully'
    });
  });

  /**
   * Remove moderator from community
   */
  removeModerator = asyncHandler(async (req, res) => {
    const { communityName } = req.params;
    const { userId: targetUserId } = req.body;
    const userId = req.userId;

    const community = await communityService.removeModerator(
      communityName,
      userId,
      targetUserId
    );

    res.json({
      success: true,
      data: community,
      message: 'Moderator removed successfully'
    });
  });

  /**
   * Ban user from community
   */
  banUser = asyncHandler(async (req, res) => {
    const { communityName } = req.params;
    const { userId: targetUserId } = req.body;
    const userId = req.userId;

    const community = await communityService.banUser(
      communityName,
      userId,
      targetUserId
    );

    res.json({
      success: true,
      data: community,
      message: 'User banned successfully'
    });
  });

  /**
   * Get community posts
   */
  getCommunityPosts = asyncHandler(async (req, res) => {
    const { communityName } = req.params;
    const { limit = 20, skip = 0, sortBy = 'new' } = req.query;

    const result = await communityService.getCommunityPosts(
      communityName,
      parseInt(limit),
      parseInt(skip),
      sortBy
    );

    res.json({
      success: true,
      data: result
    });
  });

  /**
   * Get trending posts across all communities
   */
  getTrendingPosts = asyncHandler(async (req, res) => {
    const { limit = 20 } = req.query;

    const posts = await communityService.getTrendingPosts(parseInt(limit));

    res.json({
      success: true,
      data: posts
    });
  });

  /**
   * Get user's feed (posts from joined communities)
   */
  getUserFeed = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { limit = 20, skip = 0 } = req.query;

    const result = await communityService.getUserFeed(
      userId,
      parseInt(limit),
      parseInt(skip)
    );

    res.json({
      success: true,
      data: result
    });
  });
}

export default new CommunityController();