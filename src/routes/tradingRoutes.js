const express = require('express');
const router = express.Router();
const tradingController = require('../controllers/TradingController');
const { protect } = require('../middleware/auth');

router.post('/buy', protect, tradingController.buy);
router.post('/sell', protect, tradingController.sell);
router.get('/orders', protect, tradingController.getOrders);
router.get('/trades', protect, tradingController.getTrades);

module.exports = router;
