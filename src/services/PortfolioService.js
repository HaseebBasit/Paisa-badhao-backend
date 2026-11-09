const Portfolio = require('../models/Portfolio');
const PortfolioHolding = require('../models/PortfolioHolding');
const Watchlist = require('../models/Watchlist');
const Stock = require('../models/Stock');

class PortfolioService {
  async getPortfolio(userId) {
    let portfolio = await Portfolio.findOne({ user: userId });
    if (!portfolio) {
      portfolio = await Portfolio.create({
        user: userId,
        totalInvested: 0,
        totalCurrentValue: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
      });
    }

    const holdings = await PortfolioHolding.find({ user: userId });

    // Update holdings with live market prices from Stock model
    let totalInvested = 0;
    let totalCurrentValue = 0;

    const enrichedHoldings = [];
    for (const h of holdings) {
      const stock = await Stock.findOne({ symbol: h.symbol });
      const currentPrice = stock ? stock.currentPrice : h.currentPrice;
      const currentMarketValue = Number((h.quantity * currentPrice).toFixed(2));
      const unrealizedPnL = Number((currentMarketValue - h.totalCost).toFixed(2));
      const unrealizedPnLPercent = h.totalCost > 0 ? Number(((unrealizedPnL / h.totalCost) * 100).toFixed(2)) : 0;

      totalInvested += h.totalCost;
      totalCurrentValue += currentMarketValue;

      enrichedHoldings.push({
        _id: h._id,
        symbol: h.symbol,
        name: stock ? stock.name : h.symbol,
        quantity: h.quantity,
        averageBuyPrice: h.averageBuyPrice,
        totalCost: h.totalCost,
        currentPrice,
        currentMarketValue,
        unrealizedPnL,
        unrealizedPnLPercent,
      });
    }

    totalInvested = Number(totalInvested.toFixed(2));
    totalCurrentValue = Number(totalCurrentValue.toFixed(2));
    const totalPnL = Number((totalCurrentValue - totalInvested).toFixed(2));
    const totalPnLPercent = totalInvested > 0 ? Number(((totalPnL / totalInvested) * 100).toFixed(2)) : 0;

    portfolio.totalInvested = totalInvested;
    portfolio.totalCurrentValue = totalCurrentValue;
    portfolio.totalPnL = totalPnL;
    portfolio.totalPnLPercent = totalPnLPercent;
    await portfolio.save();

    return {
      summary: {
        totalInvested,
        totalCurrentValue,
        totalPnL,
        totalPnLPercent,
        holdingsCount: enrichedHoldings.length,
      },
      holdings: enrichedHoldings,
    };
  }

  async getWatchlist(userId) {
    let watchlist = await Watchlist.findOne({ user: userId });
    if (!watchlist) {
      watchlist = await Watchlist.create({
        user: userId,
        symbols: ['MEBL', 'LUCK', 'FFC', 'SAZEW', 'PSO'],
      });
    }

    // Enrich watchlist with stock details
    const stocks = await Stock.find({ symbol: { $in: watchlist.symbols } });
    return stocks;
  }

  async addToWatchlist(userId, symbol) {
    const sym = symbol.toUpperCase();
    let watchlist = await Watchlist.findOne({ user: userId });
    if (!watchlist) {
      watchlist = new Watchlist({ user: userId, symbols: [] });
    }

    if (!watchlist.symbols.includes(sym)) {
      watchlist.symbols.push(sym);
      await watchlist.save();
    }

    return watchlist;
  }

  async removeFromWatchlist(userId, symbol) {
    const sym = symbol.toUpperCase();
    const watchlist = await Watchlist.findOne({ user: userId });
    if (watchlist) {
      watchlist.symbols = watchlist.symbols.filter((s) => s !== sym);
      await watchlist.save();
    }
    return watchlist;
  }
}

module.exports = new PortfolioService();
