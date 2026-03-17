import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  vote_type: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: true
  },
  vote_value: {
    type: Number,
    enum: [1, -1]
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index to ensure a user can only vote once per post/comment
voteSchema.index({ user: 1, post: 1 }, { unique: true, sparse: true });
voteSchema.index({ user: 1, comment: 1 }, { unique: true, sparse: true });

// Pre-save middleware to set vote_value based on vote_type
voteSchema.pre('save', function(next) {
  if (this.vote_type === 'upvote') {
    this.vote_value = 1;
  } else if (this.vote_type === 'downvote') {
    this.vote_value = -1;
  }
  next();
});

// Static method to get user's vote for a post
voteSchema.statics.getUserVoteForPost = function(userId, postId) {
  return this.findOne({ user: userId, post: postId });
};

// Static method to get user's vote for a comment
voteSchema.statics.getUserVoteForComment = function(userId, commentId) {
  return this.findOne({ user: userId, comment: commentId });
};

// Static method to update vote for a post
voteSchema.statics.updatePostVote = async function(userId, postId, voteType) {
  const existingVote = await this.findOne({ user: userId, post: postId });
  
  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Remove vote
      await existingVote.remove();
      return { action: 'removed', voteType: null };
    } else {
      // Change vote
      existingVote.vote_type = voteType;
      await existingVote.save();
      return { action: 'changed', voteType };
    }
  } else {
    // Create new vote
    const newVote = new this({ user: userId, post: postId, vote_type: voteType });
    await newVote.save();
    return { action: 'added', voteType };
  }
};

// Static method to update vote for a comment
voteSchema.statics.updateCommentVote = async function(userId, commentId, voteType) {
  const existingVote = await this.findOne({ user: userId, comment: commentId });
  
  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Remove vote
      await existingVote.remove();
      return { action: 'removed', voteType: null };
    } else {
      // Change vote
      existingVote.vote_type = voteType;
      await existingVote.save();
      return { action: 'changed', voteType };
    }
  } else {
    // Create new vote
    const newVote = new this({ user: userId, comment: commentId, vote_type: voteType });
    await newVote.save();
    return { action: 'added', voteType };
  }
};

const Vote = mongoose.model('Vote', voteSchema);

export default Vote;