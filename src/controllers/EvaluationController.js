const evaluationService = require('../services/EvaluationService');

class EvaluationController {
  async getToday(req, res, next) {
    try {
      const evaluation = await evaluationService.getTodayEvaluation(req.user._id);
      res.status(200).json({
        success: true,
        data: evaluation,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDailyQuiz(req, res, next) {
    try {
      const quiz = await evaluationService.getDailyQuiz();
      res.status(200).json({
        success: true,
        data: quiz,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EvaluationController();
