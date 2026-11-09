const tradingService = require('../services/TradingService');

class TradingController {
  async buy(req, res, next) {
    try {
      const { symbol, quantity } = req.body;
      if (!symbol || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Stock symbol and quantity are required.',
        });
      }

      const result = await tradingService.executeBuy({
        userId: req.user._id,
        symbol,
        quantity,
      });

      res.status(200).json({
        success: true,
        message: `Successfully purchased ${quantity} shares of ${symbol.toUpperCase()}.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async sell(req, res, next) {
    try {
      const { symbol, quantity } = req.body;
      if (!symbol || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Stock symbol and quantity are required.',
        });
      }

      const result = await tradingService.executeSell({
        userId: req.user._id,
        symbol,
        quantity,
      });

      res.status(200).json({
        success: true,
        message: `Successfully sold ${quantity} shares of ${symbol.toUpperCase()}.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const orders = await tradingService.getUserOrders(req.user._id, limit);
      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrades(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const trades = await tradingService.getUserTrades(req.user._id, limit);
      res.status(200).json({
        success: true,
        data: trades,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TradingController();
