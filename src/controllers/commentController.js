import commentService from '../services/commentService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Comment Controller - Handles comment-related HTTP requests
 */
class CommentController {

  /**
   * Create a new comment
   */
  createComment = asyncHandler(async (req, res) => {
    const { content, parentCommentId, is_anonymous } = req.body;
    const { postId } = req.params;
    const userId = req.userId;

    const comment = await commentService.createComment({
      content,
      postId,
      parentCommentId,
      is_anonymous
    }, userId);

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment created successfully'
    });
  });

  /**
   * Get comment by ID
   */
  getComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await commentService.getCommentById(commentId);

    res.json({
      success: true,
      data: comment
    });
  });

  /**
   * Update a comment
   */
  updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.userId;
    const updateData = req.body;

    const comment = await commentService.updateComment(commentId, userId, updateData);

    res.json({
      success: true,
      data: comment,
      message: 'Comment updated successfully'
    });
  });

  /**
   * Delete a comment
   */
  deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.userId;

    await commentService.deleteComment(commentId, userId);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  });

  /**
   * Vote on a comment
   */
  voteOnComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { voteType } = req.body;
    const userId = req.userId;

    const result = await commentService.voteOnComment(commentId, userId, voteType);

    res.json({
      success: true,
      data: result
    });
  });

  /**
   * Get comments for a post
   */
  getPostComments = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const comments = await commentService.getPostComments(
      postId,
      parseInt(limit),
      parseInt(skip)
    );

    res.json({
      success: true,
      data: comments
    });
  });

  /**
   * Get user's comments
   */
  getUserComments = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { limit = 20, skip = 0 } = req.query;

    const result = await commentService.getUserComments(
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
   * Get top-level comments for a post
   */
  getTopLevelComments = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { limit = 50 } = req.query;

    const comments = await commentService.getTopLevelComments(postId, parseInt(limit));

    res.json({
      success: true,
      data: comments
    });
  });

  /**
   * Get replies to a comment
   */
  getCommentReplies = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { limit = 20 } = req.query;

    const replies = await commentService.getCommentReplies(commentId, parseInt(limit));

    res.json({
      success: true,
      data: replies
    });
  });
}

export default new CommentController();