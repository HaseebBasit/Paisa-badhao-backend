const portfolioService = require('../services/PortfolioService');

class PortfolioController {
  async getPortfolio(req, res, next) {
    try {
      const data = await portfolioService.getPortfolio(req.user._id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWatchlist(req, res, next) {
    try {
      const watchlist = await portfolioService.getWatchlist(req.user._id);
      res.status(200).json({
        success: true,
        data: watchlist,
      });
    } catch (error) {
      next(error);
    }
  }

  async addToWatchlist(req, res, next) {
    try {
      const { symbol } = req.body;
      if (!symbol) {
        return res.status(400).json({
          success: false,
          message: 'Symbol is required.',
        });
      }
      const watchlist = await portfolioService.addToWatchlist(req.user._id, symbol);
      res.status(200).json({
        success: true,
        message: `${symbol.toUpperCase()} added to watchlist.`,
        data: watchlist,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFromWatchlist(req, res, next) {
    try {
      const { symbol } = req.params;
      const watchlist = await portfolioService.removeFromWatchlist(req.user._id, symbol);
      res.status(200).json({
        success: true,
        message: `${symbol.toUpperCase()} removed from watchlist.`,
        data: watchlist,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PortfolioController();
