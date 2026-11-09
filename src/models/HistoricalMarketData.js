const mongoose = require('mongoose');

const historicalMarketDataSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    open: {
      type: Number,
      required: true,
    },
    high: {
      type: Number,
      required: true,
    },
    low: {
      type: Number,
      required: true,
    },
    close: {
      type: Number,
      required: true,
    },
    volume: {
      type: Number,
      default: null, // As specified in prompt: FFC missing volume must remain null
    },
    timestamp: {
      type: Number,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

historicalMarketDataSchema.index({ symbol: 1, date: 1 }, { unique: true });
historicalMarketDataSchema.index({ symbol: 1, timestamp: 1 });

module.exports = mongoose.model('HistoricalMarketData', historicalMarketDataSchema);
