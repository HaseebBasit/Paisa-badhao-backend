const InflationCalculation = require('../models/InflationCalculation');

class CalculatorService {
  calculate({ initialAmount, inflationRate, years, title = 'Inflation Simulation' }) {
    const pv = parseFloat(initialAmount);
    const r = parseFloat(inflationRate) / 100;
    const n = parseInt(years, 10);

    if (isNaN(pv) || pv <= 0 || isNaN(r) || r < 0 || isNaN(n) || n <= 0) {
      const err = new Error('Please provide valid positive numbers for amount, inflation rate, and years.');
      err.statusCode = 400;
      throw err;
    }

    // Future Value = PV * (1 + r)^n
    const futureValueNeeded = Number((pv * Math.pow(1 + r, n)).toFixed(2));
    const purchasingPowerFactor = 1 / Math.pow(1 + r, n);
    const purchasingPowerLossPercent = Number(((1 - purchasingPowerFactor) * 100).toFixed(2));

    // Comparative growth models:
    // Bank savings assumed at conservative 10% annual
    const bankSavingsRate = 0.10;
    // PSX Stock Market estimated long-term compound historical average ~16%
    const stockMarketRate = 0.16;

    const yearByYear = [];
    for (let yr = 1; yr <= n; yr++) {
      const needed = Number((pv * Math.pow(1 + r, yr)).toFixed(2));
      const cashRealPower = Number((pv / Math.pow(1 + r, yr)).toFixed(2));
      const bankVal = Number((pv * Math.pow(1 + bankSavingsRate, yr)).toFixed(2));
      const stockVal = Number((pv * Math.pow(1 + stockMarketRate, yr)).toFixed(2));

      yearByYear.push({
        year: yr,
        cashPurchasingPower: cashRealPower,
        bankSavingsValue: bankVal,
        stockMarketValue: stockVal,
        inflationAdjustedNeed: needed,
      });
    }

    return {
      title,
      initialAmount: pv,
      inflationRate: Number((r * 100).toFixed(2)),
      years: n,
      futureValueNeeded,
      purchasingPowerLossPercent,
      currentPurchasingPower: pv,
      yearByYear,
    };
  }

  async saveCalculation(userId, data) {
    const calculation = await InflationCalculation.create({
      user: userId,
      title: data.title || 'Inflation Simulation',
      initialAmount: data.initialAmount,
      inflationRate: data.inflationRate,
      years: data.years,
      futureValueNeeded: data.futureValueNeeded,
      purchasingPowerLossPercent: data.purchasingPowerLossPercent,
      yearByYear: data.yearByYear,
    });
    return calculation;
  }

  async getUserCalculations(userId) {
    return await InflationCalculation.find({ user: userId }).sort({ createdAt: -1 });
  }

  async deleteCalculation(userId, id) {
    return await InflationCalculation.findOneAndDelete({ _id: id, user: userId });
  }
}

module.exports = new CalculatorService();
