const express = require('express');
const router = express.Router();
const marketController = require('../controllers/MarketController');

router.get('/stocks', marketController.getAllStocks);
router.get('/stocks/:symbol', marketController.getStock);
router.get('/history/:symbol', marketController.getHistory);
router.get('/tickers', marketController.getTickers);

module.exports = router;
