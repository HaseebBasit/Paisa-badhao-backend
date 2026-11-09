const walletService = require('../services/WalletService');

class WalletController {
  async getWallet(req, res, next) {
    try {
      const wallet = await walletService.getWallet(req.user._id);
      res.status(200).json({
        success: true,
        data: wallet,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const transactions = await walletService.getTransactions(req.user._id, limit);
      res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WalletController();
