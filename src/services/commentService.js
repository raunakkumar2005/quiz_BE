import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Vote from '../models/Vote.js';
import Community from '../models/Community.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Comment Service - Handles all comment-related business logic
 */
class CommentService {
  
  /**
   * Create a new comment
   */
  async createComment(data, userId) {
    const { content, postId, parentCommentId, is_anonymous } = data;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Check if post is locked
    if (post.is_locked) {
      throw new AppError('Cannot comment on locked posts', 403);
    }

    // Check if user is a member of the community (unless anonymous allowed)
    const community = await Community.findById(post.community);
    if (!community.isMember(userId) && !community.settings.allow_anonymous_posts) {
      throw new AppError('You must be a member of this community to comment', 403);
    }

    const comment = new Comment({
      content,
      author: userId,
      post: postId,
      parent_comment: parentCommentId || null,
      is_anonymous: is_anonymous || false,
      depth: parentCommentId ? 1 : 0
    });

    await comment.save();

    // Update post comment count
    const postToUpdate = await Post.findById(postId);
    postToUpdate.comment_count = await Comment.countDocuments({ post: postId });
    await postToUpdate.save();

    return comment.populate('author', 'name email');
  }

  /**
   * Get comment by ID
   */
  async getCommentById(commentId) {
    const comment = await Comment.findById(commentId)
      .populate('author', 'name email');

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    return comment;
  }

  /**
   * Update a comment
   */
  async updateComment(commentId, userId, data) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Check if user is author or moderator
    const post = await Post.findById(comment.post);
    const community = await Community.findById(post.community);
    
    if (!comment.author.equals(userId) && !community.isModerator(userId)) {
      throw new AppError('You can only edit your own comments', 403);
    }

    // Update fields
    Object.assign(comment, data);
    await comment.save();

    return comment.populate('author', 'name email');
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Check if user is author or moderator
    const post = await Post.findById(comment.post);
    const community = await Community.findById(post.community);
    
    if (!comment.author.equals(userId) && !community.isModerator(userId)) {
      throw new AppError('You can only delete your own comments', 403);
    }

    // Delete associated votes
    await Vote.deleteMany({ comment: commentId });

    // Delete replies to this comment
    await Comment.deleteMany({ parent_comment: commentId });

    await comment.remove();

    // Update post comment count
    const postToUpdate = await Post.findById(comment.post);
    postToUpdate.comment_count = await Comment.countDocuments({ post: comment.post });
    await postToUpdate.save();

    return { message: 'Comment deleted successfully' };
  }

  /**
   * Vote on a comment
   */
  async voteOnComment(commentId, userId, voteType) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    const result = await Vote.updateCommentVote(userId, commentId, voteType);

    // Update comment vote counts
    if (result.action === 'added') {
      if (voteType === 'upvote') {
        comment.upvotes += 1;
      } else {
        comment.downvotes += 1;
      }
    } else if (result.action === 'removed') {
      if (result.voteType === 'upvote') {
        comment.upvotes -= 1;
      } else {
        comment.downvotes -= 1;
      }
    } else if (result.action === 'changed') {
      if (voteType === 'upvote') {
        comment.upvotes += 1;
        comment.downvotes -= 1;
      } else {
        comment.upvotes -= 1;
        comment.downvotes += 1;
      }
    }

    await comment.updateVoteScore();
    return { comment, vote: result };
  }

  /**
   * Get comments for a post
   */
  async getPostComments(postId, limit = 50, skip = 0) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const comments = await Comment.getNestedComments(postId, limit);

    return comments;
  }

  /**
   * Get user's comments
   */
  async getUserComments(userId, limit = 20, skip = 0) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const comments = await Comment.find({ author: userId })
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .populate('author', 'name email')
      .populate('post', 'title');

    const total = await Comment.countDocuments({ author: userId });
    
    return {
      comments,
      total,
      hasMore: skip + limit < total
    };
  }

  /**
   * Get top-level comments for a post
   */
  async getTopLevelComments(postId, limit = 50) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const comments = await Comment.getTopLevelComments(postId, limit);
    return comments;
  }

  /**
   * Get replies to a comment
   */
  async getCommentReplies(commentId, limit = 20) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    const replies = await Comment.find({ parent_comment: commentId })
      .sort({ vote_score: -1, created_at: -1 })
      .limit(limit)
      .populate('author', 'name email');

    return replies;
  }
}

export default new CommentService();