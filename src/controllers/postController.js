import postService from '../services/postService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Post Controller - Handles post-related HTTP requests
 */
class PostController {

  /**
   * Create a new post
   */
  createPost = asyncHandler(async (req, res) => {
    const { title, content, communityName, post_type, tags, is_anonymous } = req.body;
    const userId = req.userId;

    const post = await postService.createPost({
      title,
      content,
      communityName,
      post_type,
      tags,
      is_anonymous
    }, userId);

    res.status(201).json({
      success: true,
      data: post,
      message: 'Post created successfully'
    });
  });

  /**
   * Get post by ID
   */
  getPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await postService.getPostById(postId);

    res.json({
      success: true,
      data: post
    });
  });

  /**
   * Update a post
   */
  updatePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.userId;
    const updateData = req.body;

    const post = await postService.updatePost(postId, userId, updateData);

    res.json({
      success: true,
      data: post,
      message: 'Post updated successfully'
    });
  });

  /**
   * Delete a post
   */
  deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.userId;

    await postService.deletePost(postId, userId);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  });

  /**
   * Vote on a post
   */
  voteOnPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { voteType } = req.body;
    const userId = req.userId;

    const result = await postService.voteOnPost(postId, userId, voteType);

    res.json({
      success: true,
      data: result
    });
  });

  /**
   * Get user's posts
   */
  getUserPosts = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { limit = 20, skip = 0 } = req.query;

    const result = await postService.getUserPosts(
      userId,
      parseInt(limit),
      parseInt(skip)
    );

    res.json({
      success: true,
      data: result
    });
  });

  /**
   * Pin/unpin a post
   */
  togglePinPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.userId;

    const post = await postService.togglePinPost(postId, userId);

    res.json({
      success: true,
      data: post,
      message: post.is_pinned ? 'Post pinned successfully' : 'Post unpinned successfully'
    });
  });

  /**
   * Lock/unlock a post
   */
  toggleLockPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.userId;

    const post = await postService.toggleLockPost(postId, userId);

    res.json({
      success: true,
      data: post,
      message: post.is_locked ? 'Post locked successfully' : 'Post unlocked successfully'
    });
  });

  /**
   * Search posts
   */
  searchPosts = asyncHandler(async (req, res) => {
    const { q: query, communityName, limit = 20, skip = 0 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const result = await postService.searchPosts(
      query,
      communityName,
      parseInt(limit),
      parseInt(skip)
    );

    res.json({
      success: true,
      data: result
    });
  });
}

export default new PostController();