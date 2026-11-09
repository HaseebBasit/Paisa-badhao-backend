const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');

class WalletService {
  async getWallet(userId) {
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 100000,
        currency: 'TROIX',
        initialCreditClaimed: true,
      });
    }

    return wallet;
  }

  async getTransactions(userId, limit = 50) {
    const transactions = await WalletTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    return transactions;
  }
}

module.exports = new WalletService();
