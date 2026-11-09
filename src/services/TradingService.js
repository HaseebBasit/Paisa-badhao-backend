const Stock = require('../models/Stock');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const Order = require('../models/Order');
const TradeTransaction = require('../models/TradeTransaction');
const Portfolio = require('../models/Portfolio');
const PortfolioHolding = require('../models/PortfolioHolding');

class TradingService {
  async executeBuy({ userId, symbol, quantity }) {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      const err = new Error('Invalid trade quantity. Must be at least 1.');
      err.statusCode = 400;
      throw err;
    }

    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!stock) {
      const err = new Error(`Stock symbol ${symbol} not found.`);
      err.statusCode = 404;
      throw err;
    }

    if (stock.isIndex) {
      const err = new Error('Index cannot be traded directly. Trade individual constituent equities.');
      err.statusCode = 400;
      throw err;
    }

    const executionPrice = stock.currentPrice;
    if (!executionPrice || executionPrice <= 0) {
      const err = new Error('Unable to determine execution price for stock.');
      err.statusCode = 400;
      throw err;
    }

    const totalCost = Number((qty * executionPrice).toFixed(2));

    // Check Wallet balance
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      const err = new Error('Wallet not found.');
      err.statusCode = 404;
      throw err;
    }

    if (wallet.balance < totalCost) {
      const err = new Error(
        `Insufficient TROIX balance. Order requires ${totalCost.toLocaleString()} TROIX, but available balance is ${wallet.balance.toLocaleString()} TROIX.`
      );
      err.statusCode = 400;
      throw err;
    }

    // 1. Deduct from wallet
    const newBalance = Number((wallet.balance - totalCost).toFixed(2));
    wallet.balance = newBalance;
    await wallet.save();

    // 2. Create WalletTransaction
    await WalletTransaction.create({
      user: userId,
      wallet: wallet._id,
      type: 'DEBIT',
      amount: totalCost,
      balanceAfter: newBalance,
      currency: 'TROIX',
      referenceType: 'STOCK_BUY',
      description: `Bought ${qty} shares of ${stock.symbol} @ ${executionPrice} TROIX`,
    });

    // 3. Create Order
    const order = await Order.create({
      user: userId,
      symbol: stock.symbol,
      type: 'BUY',
      quantity: qty,
      price: executionPrice,
      totalAmount: totalCost,
      status: 'EXECUTED',
      executionTime: new Date(),
    });

    // 4. Create TradeTransaction
    const trade = await TradeTransaction.create({
      user: userId,
      orderId: order._id,
      symbol: stock.symbol,
      type: 'BUY',
      quantity: qty,
      executionPrice,
      totalAmount: totalCost,
      fee: 0,
      timestamp: new Date(),
    });

    // 5. Update PortfolioHolding
    let holding = await PortfolioHolding.findOne({ user: userId, symbol: stock.symbol });
    if (!holding) {
      holding = new PortfolioHolding({
        user: userId,
        symbol: stock.symbol,
        quantity: qty,
        averageBuyPrice: executionPrice,
        totalCost,
        currentPrice: executionPrice,
        currentMarketValue: totalCost,
        unrealizedPnL: 0,
        unrealizedPnLPercent: 0,
      });
    } else {
      const newTotalCost = Number((holding.totalCost + totalCost).toFixed(2));
      const newQty = holding.quantity + qty;
      const newAvgBuyPrice = Number((newTotalCost / newQty).toFixed(2));
      const marketVal = Number((newQty * executionPrice).toFixed(2));
      const pnl = Number((marketVal - newTotalCost).toFixed(2));
      const pnlPercent = Number(((pnl / newTotalCost) * 100).toFixed(2));

      holding.quantity = newQty;
      holding.totalCost = newTotalCost;
      holding.averageBuyPrice = newAvgBuyPrice;
      holding.currentPrice = executionPrice;
      holding.currentMarketValue = marketVal;
      holding.unrealizedPnL = pnl;
      holding.unrealizedPnLPercent = pnlPercent;
    }
    await holding.save();

    // 6. Recalculate Portfolio Overview
    await this.refreshUserPortfolio(userId);

    return {
      order,
      trade,
      holding,
      remainingBalance: wallet.balance,
    };
  }

  async executeSell({ userId, symbol, quantity }) {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      const err = new Error('Invalid trade quantity. Must be at least 1.');
      err.statusCode = 400;
      throw err;
    }

    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!stock) {
      const err = new Error(`Stock symbol ${symbol} not found.`);
      err.statusCode = 404;
      throw err;
    }

    const holding = await PortfolioHolding.findOne({ user: userId, symbol: stock.symbol });
    if (!holding || holding.quantity < qty) {
      const availableQty = holding ? holding.quantity : 0;
      const err = new Error(
        `Insufficient shares to sell. You requested to sell ${qty} shares of ${stock.symbol}, but you only own ${availableQty} shares.`
      );
      err.statusCode = 400;
      throw err;
    }

    const executionPrice = stock.currentPrice;
    const totalRevenue = Number((qty * executionPrice).toFixed(2));
    const costBasis = Number((qty * holding.averageBuyPrice).toFixed(2));
    const realizedPnL = Number((totalRevenue - costBasis).toFixed(2));

    // 1. Credit wallet
    const wallet = await Wallet.findOne({ user: userId });
    const newBalance = Number((wallet.balance + totalRevenue).toFixed(2));
    wallet.balance = newBalance;
    await wallet.save();

    // 2. Create WalletTransaction
    await WalletTransaction.create({
      user: userId,
      wallet: wallet._id,
      type: 'CREDIT',
      amount: totalRevenue,
      balanceAfter: newBalance,
      currency: 'TROIX',
      referenceType: 'STOCK_SELL',
      description: `Sold ${qty} shares of ${stock.symbol} @ ${executionPrice} TROIX (P&L: ${realizedPnL >= 0 ? '+' : ''}${realizedPnL} TROIX)`,
    });

    // 3. Create Order
    const order = await Order.create({
      user: userId,
      symbol: stock.symbol,
      type: 'SELL',
      quantity: qty,
      price: executionPrice,
      totalAmount: totalRevenue,
      status: 'EXECUTED',
      executionTime: new Date(),
    });

    // 4. Create TradeTransaction
    const trade = await TradeTransaction.create({
      user: userId,
      orderId: order._id,
      symbol: stock.symbol,
      type: 'SELL',
      quantity: qty,
      executionPrice,
      totalAmount: totalRevenue,
      fee: 0,
      realizedPnL,
      timestamp: new Date(),
    });

    // 5. Update Holding
    const remainingQty = holding.quantity - qty;
    if (remainingQty === 0) {
      await PortfolioHolding.deleteOne({ _id: holding._id });
    } else {
      const remainingTotalCost = Number((holding.totalCost - costBasis).toFixed(2));
      const marketVal = Number((remainingQty * executionPrice).toFixed(2));
      const pnl = Number((marketVal - remainingTotalCost).toFixed(2));
      const pnlPercent = remainingTotalCost > 0 ? Number(((pnl / remainingTotalCost) * 100).toFixed(2)) : 0;

      holding.quantity = remainingQty;
      holding.totalCost = remainingTotalCost;
      holding.currentPrice = executionPrice;
      holding.currentMarketValue = marketVal;
      holding.unrealizedPnL = pnl;
      holding.unrealizedPnLPercent = pnlPercent;
      await holding.save();
    }

    // 6. Recalculate Portfolio Overview
    await this.refreshUserPortfolio(userId);

    return {
      order,
      trade,
      realizedPnL,
      remainingBalance: wallet.balance,
      remainingQuantity: remainingQty,
    };
  }

  async refreshUserPortfolio(userId) {
    const holdings = await PortfolioHolding.find({ user: userId });
    let totalInvested = 0;
    let totalCurrentValue = 0;

    for (const h of holdings) {
      totalInvested += h.totalCost;
      totalCurrentValue += h.currentMarketValue;
    }

    totalInvested = Number(totalInvested.toFixed(2));
    totalCurrentValue = Number(totalCurrentValue.toFixed(2));
    const totalPnL = Number((totalCurrentValue - totalInvested).toFixed(2));
    const totalPnLPercent = totalInvested > 0 ? Number(((totalPnL / totalInvested) * 100).toFixed(2)) : 0;

    await Portfolio.findOneAndUpdate(
      { user: userId },
      {
        totalInvested,
        totalCurrentValue,
        totalPnL,
        totalPnLPercent,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  async getUserOrders(userId, limit = 50) {
    return await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(limit);
  }

  async getUserTrades(userId, limit = 50) {
    return await TradeTransaction.find({ user: userId }).sort({ timestamp: -1 }).limit(limit);
  }
}

module.exports = new TradingService();
