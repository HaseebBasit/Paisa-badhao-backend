const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    totalInvested: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCurrentValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPnL: {
      type: Number,
      default: 0,
    },
    totalPnLPercent: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
