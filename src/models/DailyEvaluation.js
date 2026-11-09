const mongoose = require('mongoose');

const dailyEvaluationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'B', 'C', 'D'],
      default: 'A+',
    },
    tradingDiscipline: {
      type: Number,
      default: 85,
    },
    riskManagement: {
      type: Number,
      default: 90,
    },
    portfolioDiversification: {
      type: Number,
      default: 88,
    },
    indicators: {
      type: [String],
      default: ['Diversified Portfolio', 'Positive Return', 'Good Risk Control'],
    },
    aiFeedback: {
      type: String,
      default: '',
    },
    quizCompleted: {
      type: Boolean,
      default: false,
    },
    quizScore: {
      type: Number,
      default: 0,
    },
    tradeCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

dailyEvaluationSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyEvaluation', dailyEvaluationSchema);
