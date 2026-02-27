import mongoose from 'mongoose';
import { DIFFICULTY, SOURCE } from '../utils/constants.js';

const questionSchema = new mongoose.Schema({
  exam: {
    type: String,
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    index: true
  },
  topic: {
    type: String,
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: Object.values(DIFFICULTY),
    default: DIFFICULTY.MEDIUM,
    index: true
  },
  question_text: {
    type: String,
    required: true
  },
  option_a: {
    type: String,
    required: true
  },
  option_b: {
    type: String,
    required: true
  },
  option_c: {
    type: String,
    required: true
  },
  option_d: {
    type: String,
    required: true
  },
  correct_option: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: true
  },
  explanation: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    enum: Object.values(SOURCE),
    default: SOURCE.AI
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound indexes for efficient queries
questionSchema.index({ exam: 1, subject: 1, topic: 1 });
questionSchema.index({ exam: 1, subject: 1, topic: 1, difficulty: 1 });

const Question = mongoose.model('Question', questionSchema);

export default Question;
