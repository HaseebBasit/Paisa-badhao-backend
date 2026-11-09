const mongoose = require('mongoose');

const expertBookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expert',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'],
      default: 'CONFIRMED',
    },
    topic: {
      type: String,
      default: 'General Portfolio Review & PSX Strategy',
    },
    notes: {
      type: String,
      default: '',
    },
    feePaid: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'PKR',
    },
  },
  {
    timestamps: true,
  }
);

expertBookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ExpertBooking', expertBookingSchema);
