import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  quiz_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
    index: true
  },
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  selected_option: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: true
  },
  is_correct: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index for efficient queries
quizAttemptSchema.index({ quiz_id: 1, question_id: 1 }, { unique: true });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;
