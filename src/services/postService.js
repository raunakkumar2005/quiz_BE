import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Vote from '../models/Vote.js';
import Community from '../models/Community.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Post Service - Handles all post-related business logic
 */
class PostService {
  
  /**
   * Create a new post
   */
  async createPost(data, userId) {
    const { title, content, communityName, post_type, tags, is_anonymous } = data;

    // Check if community exists
    const community = await Community.findByName(communityName);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Check if user is a member of the community
    if (!community.isMember(userId)) {
      throw new AppError('You must be a member of this community to post', 403);
    }

    const post = new Post({
      title,
      content,
      author: userId,
      community: community._id,
      post_type: post_type || 'discussion',
      tags: tags || [],
      is_anonymous: is_anonymous || false
    });

    await post.save();
    
    // Update community's post count (if needed)
    // Note: We could add a post_count field to community if needed
    
    return post.populate([
      { path: 'author', select: 'name email' },
      { path: 'community', select: 'name' }
    ]);
  }

  /**
   * Get post by ID
   */
  async getPostById(postId) {
    const post = await Post.findById(postId)
      .populate('author', 'name email')
      .populate('community', 'name');

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    return post;
  }

  /**
   * Update a post
   */
  async updatePost(postId, userId, data) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Check if user is author or moderator
    const community = await Community.findById(post.community);
    if (!post.author.equals(userId) && !community.isModerator(userId)) {
      throw new AppError('You can only edit your own posts', 403);
    }

    // Update fields
    Object.assign(post, data);
    await post.save();

    return post.populate('author', 'name email')
      .populate('community', 'name');
  }

  /**
   * Delete a post
   */
  async deletePost(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Check if user is author or moderator
    const community = await Community.findById(post.community);
    if (!post.author.equals(userId) && !community.isModerator(userId)) {
      throw new AppError('You can only delete your own posts', 403);
    }

    // Delete associated comments and votes
    await Comment.deleteMany({ post: postId });
    await Vote.deleteMany({ post: postId });

    await post.remove();
    return { message: 'Post deleted successfully' };
  }

  /**
   * Vote on a post
   */
  async voteOnPost(postId, userId, voteType) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const result = await Vote.updatePostVote(userId, postId, voteType);

    // Update post vote counts
    if (result.action === 'added') {
      if (voteType === 'upvote') {
        post.upvotes += 1;
      } else {
        post.downvotes += 1;
      }
    } else if (result.action === 'removed') {
      if (result.voteType === 'upvote') {
        post.upvotes -= 1;
      } else {
        post.downvotes -= 1;
      }
    } else if (result.action === 'changed') {
      if (voteType === 'upvote') {
        post.upvotes += 1;
        post.downvotes -= 1;
      } else {
        post.upvotes -= 1;
        post.downvotes += 1;
      }
    }

    await post.updateVoteScore();
    return { post, vote: result };
  }

  /**
   * Get user's posts
   */
  async getUserPosts(userId, limit = 20, skip = 0) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const posts = await Post.find({ author: userId, is_locked: false })
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .populate('author', 'name email')
      .populate('community', 'name');

    const total = await Post.countDocuments({ author: userId, is_locked: false });
    
    return {
      posts,
      total,
      hasMore: skip + limit < total
    };
  }

  /**
   * Pin/unpin a post
   */
  async togglePinPost(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Check if user is moderator
    const community = await Community.findById(post.community);
    if (!community.isModerator(userId)) {
      throw new AppError('Only moderators can pin posts', 403);
    }

    post.is_pinned = !post.is_pinned;
    await post.save();

    return post;
  }

  /**
   * Lock/unlock a post
   */
  async toggleLockPost(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Check if user is moderator
    const community = await Community.findById(post.community);
    if (!community.isModerator(userId)) {
      throw new AppError('Only moderators can lock posts', 403);
    }

    post.is_locked = !post.is_locked;
    await post.save();

    return post;
  }

  /**
   * Search posts
   */
  async searchPosts(query, communityName = null, limit = 20, skip = 0) {
    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ],
      is_locked: false
    };

    if (communityName) {
      const community = await Community.findByName(communityName);
      if (!community) {
        throw new AppError('Community not found', 404);
      }
      searchQuery.community = community._id;
    }

    const posts = await Post.find(searchQuery)
      .sort({ vote_score: -1, created_at: -1 })
      .limit(limit)
      .skip(skip)
      .populate('author', 'name email')
      .populate('community', 'name');

    const total = await Post.countDocuments(searchQuery);
    
    return {
      posts,
      total,
      hasMore: skip + limit < total
    };
  }
}

export default new PostService();