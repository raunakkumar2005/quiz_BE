import Community from '../models/Community.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Vote from '../models/Vote.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Community Service - Handles all community-related business logic
 */
class CommunityService {
  
  /**
   * Create a new community
   */
  async createCommunity(data, userId) {
    const { name, description, exam, rules } = data;

    // Check if community name already exists
    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
      throw new AppError('Community name already exists', 400);
    }

    // Get creator user
    const creator = await User.findById(userId);
    if (!creator) {
      throw new AppError('User not found', 404);
    }

    const community = new Community({
      name,
      description,
      exam,
      creator: userId,
      moderators: [userId],
      members: [userId],
      rules: rules || []
    });

    await community.save();
    return community.populate('creator', 'name email');
  }

  /**
   * Get community by name
   */
  async getCommunityByName(name) {
    const community = await Community.findByName(name)
      .populate('creator', 'name email')
      .populate('moderators', 'name email')
      .populate('members', 'name email');

    if (!community) {
      throw new AppError('Community not found', 404);
    }

    return community;
  }

  /**
   * Get all communities with optional filtering
   */
  async getCommunities(filter = {}, limit = 20, skip = 0) {
    const query = {};
    
    if (filter.exam) {
      query.exam = { $regex: filter.exam, $options: 'i' };
    }
    
    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { description: { $regex: filter.search, $options: 'i' } }
      ];
    }

    const communities = await Community.find(query)
      .sort({ member_count: -1, created_at: -1 })
      .limit(limit)
      .skip(skip)
      .populate('creator', 'name email');

    const total = await Community.countDocuments(query);
    
    return {
      communities,
      total,
      hasMore: skip + limit < total
    };
  }

  /**
   * Join a community
   */
  async joinCommunity(communityName, userId) {
    const community = await Community.findByName(communityName);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Check if user is already a member
    if (community.members.includes(userId)) {
      throw new AppError('You are already a member of this community', 400);
    }

    community.members.push(userId);
    community.member_count = community.members.length;
    await community.save();

    return community.populate('creator', 'name email');
  }

  /**
   * Leave a community
   */
  async leaveCommunity(communityName, userId) {
    const community = await Community.findByName(communityName);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Check if user is creator (cannot leave)
    if (community.creator.equals(userId)) {
      throw new AppError('Community creator cannot leave their own community', 400);
    }

    // Remove user from members and moderators
    community.members = community.members.filter(id => !id.equals(userId));
    community.moderators = community.moderators.filter(id => !id.equals(userId));
    community.member_count = community.members.length;
    
    await community.save();
    return community;
  }

  /**
   * Add moderator to community
   */
  async addModerator(communityName, userId, targetUserId) {
    const community = await Community.findByName(communityName);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Check if user is creator or moderator
    if (!community.isModerator(userId)) {
      throw new AppError('Only moderators can add new moderators', 403);
    }

    // Check if target user is a member
    if (!community.members.includes(targetUserId)) {
      throw new AppError('User must be a member to become moderator', 400);
    }

    // Check if already moderator
    if (community.moderators.includes(targetUserId)) {
      throw new AppError('User is already a moderator', 400);
    }

    community.moderators.push(targetUserId);
    await community.save();

    return community.populate('moderators', 'name email');
  }

  /**
   * Remove moderator from community
   */
  async removeModerator(communityName, userId, targetUserId) {
    const community = await Community.findByName(communityName);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Check if user is creator (only creator can remove moderators)
    if (!community.creator.equals(userId)) {
      throw new AppError('Only community creator can remove moderators', 403);
    }

    // Check if target user is creator (cannot remove creator)
    if (community.creator.equals(targetUserId)) {
      throw new AppError('Cannot remove community creator', 400);
    }

    // Remove from moderators
    community.moderators = community.moderators.filter(id => !id.equals(targetUserId));
    await community.save();

    return community.populate('moderators', 'name email');
  }

  /**
   * Ban user from community
   */
  async banUser(communityName, userId, targetUserId) {
    const community = await Community.findByName(communityName);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Check if user is moderator
    if (!community.isModerator(userId)) {
      throw new AppError('Only moderators can ban users', 403);
    }

    // Check if target user is creator (cannot ban creator)
    if (community.creator.equals(targetUserId)) {
      throw new AppError('Cannot ban community creator', 400);
    }

    // Remove from members and moderators
    community.members = community.members.filter(id => !id.equals(targetUserId));
    community.moderators = community.moderators.filter(id => !id.equals(targetUserId));
    community.member_count = community.members.length;
    
    await community.save();
    return community;
  }

  /**
   * Get community posts
   */
  async getCommunityPosts(communityName, limit = 20, skip = 0, sortBy = 'new') {
    const community = await Community.findByName(communityName);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    let sortOptions = { created_at: -1 };
    if (sortBy === 'top') {
      sortOptions = { vote_score: -1, created_at: -1 };
    } else if (sortBy === 'hot') {
      // Hot algorithm: score / (age_hours ^ 1.8)
      sortOptions = { vote_score: -1, created_at: -1 };
    }

    const posts = await Post.find({ community: community._id, is_locked: false })
      .sort(sortOptions)
      .limit(limit)
      .skip(skip)
      .populate('author', 'name email')
      .populate('community', 'name');

    const total = await Post.countDocuments({ community: community._id, is_locked: false });
    
    return {
      posts,
      total,
      hasMore: skip + limit < total
    };
  }

  /**
   * Get trending posts across all communities
   */
  async getTrendingPosts(limit = 20) {
    const posts = await Post.find({ is_locked: false })
      .sort({ vote_score: -1, created_at: -1 })
      .limit(limit)
      .populate('author', 'name email')
      .populate('community', 'name');

    return posts;
  }

  /**
   * Get user's feed (posts from joined communities)
   */
  async getUserFeed(userId, limit = 20, skip = 0) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get communities user is a member of
    const userCommunities = await Community.find({ members: userId });
    const communityIds = userCommunities.map(c => c._id);

    const posts = await Post.find({ 
      community: { $in: communityIds },
      is_locked: false 
    })
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .populate('author', 'name email')
      .populate('community', 'name');

    const total = await Post.countDocuments({ 
      community: { $in: communityIds },
      is_locked: false 
    });
    
    return {
      posts,
      total,
      hasMore: skip + limit < total
    };
  }
}

export default new CommunityService();