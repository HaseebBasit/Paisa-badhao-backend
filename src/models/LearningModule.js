const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  keyTakeaways: [String],
  order: { type: Number, required: true },
});

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
  explanation: { type: String, default: '' },
});

const learningModuleSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    icon: {
      type: String,
      default: 'BookOpen',
    },
    estimatedTime: {
      type: String,
      default: '15 mins',
    },
    order: {
      type: Number,
      default: 0,
    },
    lessons: [lessonSchema],
    quiz: [quizQuestionSchema],
  },
  {
    timestamps: true,
  }
);

learningModuleSchema.index({ order: 1 });

module.exports = mongoose.model('LearningModule', learningModuleSchema);
