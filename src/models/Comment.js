import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  parent_comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  vote_score: {
    type: Number,
    default: 0
  },
  is_anonymous: {
    type: Boolean,
    default: false
  },
  depth: {
    type: Number,
    default: 0
  },
  reply_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for efficient queries
commentSchema.index({ post: 1, created_at: -1 });
commentSchema.index({ author: 1, created_at: -1 });
commentSchema.index({ parent_comment: 1 });
commentSchema.index({ post: 1, parent_comment: 1, created_at: -1 });

// Virtual for net score
commentSchema.virtual('net_score').get(function() {
  return this.upvotes - this.downvotes;
});

// Instance method to update vote score
commentSchema.methods.updateVoteScore = function() {
  this.vote_score = this.upvotes - this.downvotes;
  return this.save();
};

// Static method to get top-level comments for a post
commentSchema.statics.getTopLevelComments = function(postId, limit = 50) {
  return this.find({ post: postId, parent_comment: null })
    .sort({ vote_score: -1, created_at: -1 })
    .limit(limit)
    .populate('author', 'name email');
};

// Static method to get nested comments (with replies)
commentSchema.statics.getNestedComments = async function(postId, limit = 100) {
  const topLevelComments = await this.find({ post: postId, parent_comment: null })
    .sort({ vote_score: -1, created_at: -1 })
    .limit(limit)
    .populate('author', 'name email');

  // Get replies for each top-level comment
  for (const comment of topLevelComments) {
    const replies = await this.find({ parent_comment: comment._id })
      .sort({ vote_score: -1, created_at: -1 })
      .populate('author', 'name email');
    comment.replies = replies;
  }

  return topLevelComments;
};

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;