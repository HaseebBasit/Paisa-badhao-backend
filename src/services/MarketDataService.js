const Stock = require('../models/Stock');
const HistoricalMarketData = require('../models/HistoricalMarketData');

class MarketDataService {
  async getAllStocks() {
    return await Stock.find().sort({ isIndex: -1, symbol: 1 });
  }

  async getStockBySymbol(symbol) {
    return await Stock.findOne({ symbol: symbol.toUpperCase() });
  }

  async getHistoricalCandles(symbol, limit = 100, upToDate = null) {
    const query = { symbol: symbol.toUpperCase() };
    if (upToDate) {
      query.date = { $lte: upToDate };
    }
    const candles = await HistoricalMarketData.find(query)
      .sort({ date: 1 })
      .limit(limit);

    // Map into TradingView Lightweight Charts format: { time, open, high, low, close, volume }
    return candles.map((c) => ({
      time: c.date, // 'YYYY-MM-DD'
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
    }));
  }

  async getTickers() {
    const stocks = await Stock.find().sort({ symbol: 1 });

    const formatted = stocks.map((s) => ({
      symbol: s.symbol,
      name: s.name,
      price: s.currentPrice,
      change: s.change,
      changePercent: s.changePercent,
      isPositive: s.change >= 0,
      volume: s.volume,
      isIndex: s.isIndex,
    }));

    return {
      topTicker: formatted,
      bottomTicker: formatted.slice().reverse(), // slightly alternated order for dynamic dual-band visual
    };
  }
}

module.exports = new MarketDataService();
