const express = require('express');
const router = express.Router();
const walletController = require('../controllers/WalletController');
const { protect } = require('../middleware/auth');

router.get('/', protect, walletController.getWallet);
router.get('/transactions', protect, walletController.getTransactions);

module.exports = router;
