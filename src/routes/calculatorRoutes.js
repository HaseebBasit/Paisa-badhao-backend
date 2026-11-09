const express = require('express');
const router = express.Router();
const calculatorController = require('../controllers/CalculatorController');
const { protect } = require('../middleware/auth');

router.post('/compute', calculatorController.calculate);
router.post('/save', protect, calculatorController.save);
router.get('/history', protect, calculatorController.getHistory);
router.delete('/:id', protect, calculatorController.deleteOne);

module.exports = router;
