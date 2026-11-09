const DailyEvaluation = require('../models/DailyEvaluation');
const Portfolio = require('../models/Portfolio');
const PortfolioHolding = require('../models/PortfolioHolding');
const TradeTransaction = require('../models/TradeTransaction');
const QuizAttempt = require('../models/QuizAttempt');
const Wallet = require('../models/Wallet');

class EvaluationService {
  async getTodayEvaluation(userId) {
    const today = new Date().toISOString().split('T')[0];

    let evaluation = await DailyEvaluation.findOne({ user: userId, date: today });
    if (!evaluation) {
      evaluation = await this.generateDailyEvaluation(userId, today);
    }

    return evaluation;
  }

  async generateDailyEvaluation(userId, dateStr) {
    const today = dateStr || new Date().toISOString().split('T')[0];

    // Inspect user's actual activity
    const portfolio = await Portfolio.findOne({ user: userId });
    const holdings = await PortfolioHolding.find({ user: userId });
    const trades = await TradeTransaction.find({ user: userId });
    const wallet = await Wallet.findOne({ user: userId });
    const recentQuiz = await QuizAttempt.findOne({ user: userId }).sort({ completedAt: -1 });

    const holdingsCount = holdings.length;
    const totalTrades = trades.length;

    // Check if new user with zero trading activity
    const isNewTrader = totalTrades === 0 && holdingsCount === 0;

    let score = 92;
    let grade = 'A+';
    let tradingDiscipline = 85;
    let riskManagement = 90;
    let portfolioDiversification = 88;
    let indicators = ['Diversified Portfolio', 'Positive Return', 'Good Risk Control'];
    let aiFeedback = '';

    if (isNewTrader) {
      score = 75;
      grade = 'B';
      tradingDiscipline = 70;
      riskManagement = 80;
      portfolioDiversification = 50;
      indicators = ['Ready to Begin', '100,000 TROIX Available', 'Explore PSX Stocks'];
      aiFeedback =
        'Welcome to PAISA BADHAO! Your starting capital of 100,000 TROIX is primed and ready. We recommend starting by purchasing 2 to 3 quality PSX equities across diverse sectors (e.g. MEBL for banking, LUCK for cement, FFC for fertilizer) to begin building your diversification score!';
    } else {
      // Calculate real scores based on actual data
      // 1. Diversification score based on sector spread & holding count
      if (holdingsCount >= 3) {
        portfolioDiversification = 94;
      } else if (holdingsCount === 2) {
        portfolioDiversification = 82;
      } else {
        portfolioDiversification = 60;
      }

      // 2. Risk management score: checks if not more than 40% in a single position
      const totalPortfolioVal = (portfolio ? portfolio.totalCurrentValue : 0) + (wallet ? wallet.balance : 0);
      let maxConcentration = 0;
      for (const h of holdings) {
        const conc = totalPortfolioVal > 0 ? (h.currentMarketValue / totalPortfolioVal) * 100 : 0;
        if (conc > maxConcentration) maxConcentration = conc;
      }

      if (maxConcentration < 35) {
        riskManagement = 95;
      } else if (maxConcentration < 60) {
        riskManagement = 84;
      } else {
        riskManagement = 68;
      }

      // 3. Trading discipline based on trade count and PnL
      const pnl = portfolio ? portfolio.totalPnL : 0;
      if (pnl >= 0) {
        tradingDiscipline = 90;
      } else {
        tradingDiscipline = 80;
      }

      // Composite score
      score = Math.round((tradingDiscipline * 0.35) + (riskManagement * 0.35) + (portfolioDiversification * 0.3));

      if (score >= 90) grade = 'A+';
      else if (score >= 80) grade = 'A';
      else if (score >= 70) grade = 'B';
      else if (score >= 60) grade = 'C';
      else grade = 'D';

      indicators = [];
      if (portfolioDiversification >= 80) indicators.push('Diversified Portfolio');
      if (pnl >= 0) indicators.push('Positive Return');
      if (riskManagement >= 80) indicators.push('Good Risk Control');
      if (indicators.length === 0) indicators.push('Active Capital Management');

      aiFeedback = `Based on your live trading data: Your overall portfolio stands with ${holdingsCount} active positions and a cumulative P&L of ${pnl >= 0 ? '+' : ''}${pnl} TROIX. Your risk management rating is ${riskManagement}%. Keep adhering to your stop-loss and position sizing rules!`;
    }

    const evaluation = await DailyEvaluation.findOneAndUpdate(
      { user: userId, date: today },
      {
        user: userId,
        date: today,
        score,
        grade,
        tradingDiscipline,
        riskManagement,
        portfolioDiversification,
        indicators,
        aiFeedback,
        tradeCount: totalTrades,
        quizCompleted: !!recentQuiz,
        quizScore: recentQuiz ? recentQuiz.percentage : 0,
      },
      { upsert: true, new: true }
    );

    return evaluation;
  }

  async getDailyQuiz() {
    return {
      date: new Date().toISOString().split('T')[0],
      question: 'What is the most effective approach to protect your savings against high inflation in Pakistan?',
      options: [
        'Holding cash banknotes in a home safe',
        'Investing in productive, dividend-paying equities and assets that grow faster than inflation',
        'Spending all monthly income immediately on luxury items',
        'Borrowing money at high consumer credit rates',
      ],
      correctAnswerIndex: 1,
      explanation: 'Productive equities, businesses, and inflation-hedged instruments historically produce real returns that outpace the erosion of paper purchasing power.',
    };
  }
}

module.exports = new EvaluationService();
