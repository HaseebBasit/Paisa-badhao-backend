const express = require('express');
const router = express.Router();
const aiController = require('../controllers/AIController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/chat', optionalAuth, aiController.sendMessage);
router.get('/conversations', protect, aiController.getConversations);
router.get('/conversations/:id/messages', protect, aiController.getMessages);
router.delete('/conversations/:id', protect, aiController.deleteConversation);

module.exports = router;
