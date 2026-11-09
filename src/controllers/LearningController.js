const learningService = require('../services/LearningService');

class LearningController {
  async getModules(req, res, next) {
    try {
      const userId = req.user ? req.user._id : null;
      const modules = await learningService.getAllModules(userId);
      res.status(200).json({
        success: true,
        data: modules,
      });
    } catch (error) {
      next(error);
    }
  }

  async getModuleBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const userId = req.user ? req.user._id : null;
      const result = await learningService.getModuleBySlug(slug, userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async completeLesson(req, res, next) {
    try {
      const { slug, lessonId } = req.body;
      if (!slug || !lessonId) {
        return res.status(400).json({
          success: false,
          message: 'Module slug and lessonId are required.',
        });
      }
      const progress = await learningService.markLessonComplete(req.user._id, slug, lessonId);
      res.status(200).json({
        success: true,
        message: 'Lesson progress saved.',
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitQuiz(req, res, next) {
    try {
      const { slug, answers } = req.body;
      if (!slug || !Array.isArray(answers)) {
        return res.status(400).json({
          success: false,
          message: 'Module slug and answers array are required.',
        });
      }
      const result = await learningService.submitQuiz(req.user._id, slug, answers);
      res.status(200).json({
        success: true,
        message: result.passed ? 'Congratulations! Quiz passed.' : 'Quiz completed. Keep learning to improve!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LearningController();
