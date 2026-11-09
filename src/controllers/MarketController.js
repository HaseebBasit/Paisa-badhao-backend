const marketDataService = require('../services/MarketDataService');

class MarketController {
  async getAllStocks(req, res, next) {
    try {
      const stocks = await marketDataService.getAllStocks();
      res.status(200).json({
        success: true,
        data: stocks,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStock(req, res, next) {
    try {
      const stock = await marketDataService.getStockBySymbol(req.params.symbol);
      if (!stock) {
        return res.status(404).json({
          success: false,
          message: `Stock symbol ${req.params.symbol} not found.`,
        });
      }
      res.status(200).json({
        success: true,
        data: stock,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const { symbol } = req.params;
      const limit = parseInt(req.query.limit, 10) || 200;
      const upToDate = req.query.upToDate || null;
      const candles = await marketDataService.getHistoricalCandles(symbol, limit, upToDate);
      res.status(200).json({
        success: true,
        symbol: symbol.toUpperCase(),
        count: candles.length,
        datasetType: 'HISTORICAL SIMULATION (PSX August 2026 Dataset)',
        data: candles,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTickers(req, res, next) {
    try {
      const tickers = await marketDataService.getTickers();
      res.status(200).json({
        success: true,
        data: tickers,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MarketController();
