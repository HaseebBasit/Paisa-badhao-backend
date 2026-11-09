const aiService = require('../services/AIService');

class AIController {
  async sendMessage(req, res, next) {
    try {
      const { message, conversationId } = req.body;
      const userId = req.user ? req.user._id : null;

      if (!message || message.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Message cannot be empty.',
        });
      }

      // If anonymous / guest visitor, generate instant response without forcing registration
      if (!userId) {
        const reply = await aiService.generateFallbackResponse(message, null);
        return res.status(200).json({
          success: true,
          data: {
            conversationId: 'guest-session',
            userMessage: { role: 'user', content: message, timestamp: new Date() },
            assistantMessage: { role: 'assistant', content: reply, timestamp: new Date() },
          },
        });
      }

      const result = await aiService.processMessage({
        userId,
        conversationId,
        message,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getConversations(req, res, next) {
    try {
      const conversations = await aiService.getUserConversations(req.user._id);
      res.status(200).json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const { id } = req.params;
      const messages = await aiService.getConversationMessages(req.user._id, id);
      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteConversation(req, res, next) {
    try {
      const { id } = req.params;
      await aiService.deleteConversation(req.user._id, id);
      res.status(200).json({
        success: true,
        message: 'Conversation deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AIController();
