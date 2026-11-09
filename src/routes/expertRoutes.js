const express = require('express');
const router = express.Router();
const expertController = require('../controllers/ExpertController');
const { protect } = require('../middleware/auth');

router.get('/', expertController.getExperts);
router.get('/:id', expertController.getExpertById);
router.post('/book', protect, expertController.bookSession);
router.get('/user/bookings', protect, expertController.getMyBookings);

module.exports = router;
