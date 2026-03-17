import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  post_type: {
    type: String,
    enum: ['discussion', 'question', 'announcement', 'resource'],
    default: 'discussion'
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
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
  comment_count: {
    type: Number,
    default: 0
  },
  is_anonymous: {
    type: Boolean,
    default: false
  },
  is_pinned: {
    type: Boolean,
    default: false
  },
  is_locked: {
    type: Boolean,
    default: false
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document']
    },
    url: String,
    filename: String,
    size: Number
  }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for efficient queries
postSchema.index({ community: 1, created_at: -1 });
postSchema.index({ author: 1, created_at: -1 });
postSchema.index({ vote_score: -1, created_at: -1 });
postSchema.index({ community: 1, vote_score: -1 });
postSchema.index({ post_type: 1 });

// Virtual for net score
postSchema.virtual('net_score').get(function() {
  return this.upvotes - this.downvotes;
});

// Instance method to update vote score
postSchema.methods.updateVoteScore = function() {
  this.vote_score = this.upvotes - this.downvotes;
  return this.save();
};

// Static method to get trending posts
postSchema.statics.getTrending = function(communityId, limit = 20) {
  return this.find({ community: communityId, is_locked: false })
    .sort({ vote_score: -1, created_at: -1 })
    .limit(limit)
    .populate('author', 'name email')
    .populate('community', 'name');
};

// Static method to get recent posts
postSchema.statics.getRecent = function(communityId, limit = 20) {
  return this.find({ community: communityId, is_locked: false })
    .sort({ created_at: -1 })
    .limit(limit)
    .populate('author', 'name email')
    .populate('community', 'name');
};

const Post = mongoose.model('Post', postSchema);

export default Post;