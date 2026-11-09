const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const Portfolio = require('../models/Portfolio');
const Watchlist = require('../models/Watchlist');
const UserSettings = require('../models/UserSettings');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'paisa_badhao_jwt_secret_dev_2026_x89q21f';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

class AuthService {
  async register({ name, email, password }) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      const err = new Error('An account with this email address already exists.');
      err.statusCode = 400;
      throw err;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 1. Create User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // 2. Create Wallet and credit EXACTLY 100,000 TROIX
    const startingBalance = 100000;
    const wallet = await Wallet.create({
      user: user._id,
      balance: startingBalance,
      currency: 'TROIX',
      initialCreditClaimed: true,
    });

    // 3. Create initial WalletTransaction record
    await WalletTransaction.create({
      user: user._id,
      wallet: wallet._id,
      type: 'CREDIT',
      amount: startingBalance,
      balanceAfter: startingBalance,
      currency: 'TROIX',
      referenceType: 'INITIAL_BONUS',
      description: 'PAISA BADHAO Welcome Capital: 100,000 TROIX initial credit',
    });

    // 4. Create empty Portfolio
    await Portfolio.create({
      user: user._id,
      totalInvested: 0,
      totalCurrentValue: 0,
      totalPnL: 0,
      totalPnLPercent: 0,
    });

    // 5. Create default Watchlist
    await Watchlist.create({
      user: user._id,
      symbols: ['MEBL', 'LUCK', 'FFC', 'SAZEW', 'PSO'],
    });

    // 6. Create default UserSettings
    await UserSettings.create({
      user: user._id,
      theme: 'light',
      preferredLanguage: 'en',
    });

    const token = generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      wallet: {
        balance: wallet.balance,
        currency: wallet.currency,
      },
      token,
    };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    // Retrieve existing wallet - NEVER re-credit starting balance on login
    let wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      // Safety edge-case for legacy accounts
      wallet = await Wallet.create({
        user: user._id,
        balance: 100000,
        currency: 'TROIX',
        initialCreditClaimed: true,
      });
    }

    const token = generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      wallet: {
        balance: wallet.balance,
        currency: wallet.currency,
      },
      token,
    };
  }

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    const wallet = await Wallet.findOne({ user: userId });
    const settings = await UserSettings.findOne({ user: userId });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      wallet: wallet
        ? {
            balance: wallet.balance,
            currency: wallet.currency,
          }
        : { balance: 0, currency: 'TROIX' },
      settings: settings || {},
    };
  }
}

module.exports = new AuthService();
