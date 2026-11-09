const mongoose = require('mongoose');

const inflationCalculationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Inflation Simulation',
    },
    initialAmount: {
      type: Number,
      required: true,
    },
    inflationRate: {
      type: Number,
      required: true,
    },
    years: {
      type: Number,
      required: true,
    },
    futureValueNeeded: {
      type: Number,
      required: true,
    },
    purchasingPowerLossPercent: {
      type: Number,
      required: true,
    },
    yearByYear: [
      {
        year: Number,
        cashPurchasingPower: Number,
        bankSavingsValue: Number,
        stockMarketValue: Number,
        inflationAdjustedNeed: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

inflationCalculationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('InflationCalculation', inflationCalculationSchema);
