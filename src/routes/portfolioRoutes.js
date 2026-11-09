const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/PortfolioController');
const { protect } = require('../middleware/auth');

router.get('/', protect, portfolioController.getPortfolio);
router.get('/watchlist', protect, portfolioController.getWatchlist);
router.post('/watchlist', protect, portfolioController.addToWatchlist);
router.delete('/watchlist/:symbol', protect, portfolioController.removeFromWatchlist);

module.exports = router;
