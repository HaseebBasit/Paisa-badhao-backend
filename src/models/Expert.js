const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      default: '8+ Years',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewsCount: {
      type: Number,
      default: 250,
    },
    feePerSession: {
      type: Number,
      required: true,
      default: 5000,
    },
    feeCurrency: {
      type: String,
      default: 'PKR',
    },
    specialties: {
      type: [String],
      default: ['Equity Research', 'Risk Hedging', 'PSX Portfolio Design'],
    },
    bio: {
      type: String,
      default: 'Experienced financial markets consultant focusing on equity analysis, risk diversification, and long-term capital preservation.',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    availableDays: {
      type: [String],
      default: ['Monday', 'Wednesday', 'Friday'],
    },
    availableTimeSlots: {
      type: [String],
      default: ['04:00 PM - 05:00 PM', '06:00 PM - 07:00 PM', '08:00 PM - 09:00 PM'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Expert', expertSchema);
