const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/EvaluationController');
const { protect } = require('../middleware/auth');

router.get('/today', protect, evaluationController.getToday);
router.get('/quiz', evaluationController.getDailyQuiz);

module.exports = router;
