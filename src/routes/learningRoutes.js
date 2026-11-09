const express = require('express');
const router = express.Router();
const learningController = require('../controllers/LearningController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/modules', optionalAuth, learningController.getModules);
router.get('/modules/:slug', optionalAuth, learningController.getModuleBySlug);
router.post('/lesson/complete', protect, learningController.completeLesson);
router.post('/quiz/submit', protect, learningController.submitQuiz);

module.exports = router;
