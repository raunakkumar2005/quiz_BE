import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  exam: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  is_public: {
    type: Boolean,
    default: true
  },
  member_count: {
    type: Number,
    default: 1
  },
  rules: [{
    type: String,
    maxlength: 200
  }],
  settings: {
    allow_anonymous_posts: {
      type: Boolean,
      default: false
    },
    require_approval: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for efficient lookups
communitySchema.index({ name: 1 });
communitySchema.index({ exam: 1 });
communitySchema.index({ creator: 1 });

// Virtual for community URL slug
communitySchema.virtual('slug').get(function() {
  return this.name.toLowerCase().replace(/\s+/g, '-');
});

// Instance method to check if user is moderator
communitySchema.methods.isModerator = function(userId) {
  return this.moderators.includes(userId) || this.creator.equals(userId);
};

// Instance method to check if user is member
communitySchema.methods.isMember = function(userId) {
  return this.members.includes(userId) || this.isModerator(userId);
};

// Static method to find by name (case insensitive)
communitySchema.statics.findByName = function(name) {
  return this.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
};

const Community = mongoose.model('Community', communitySchema);

export default Community;