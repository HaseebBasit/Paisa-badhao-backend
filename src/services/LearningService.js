const LearningModule = require('../models/LearningModule');
const LearningProgress = require('../models/LearningProgress');
const QuizAttempt = require('../models/QuizAttempt');

class LearningService {
  async getAllModules(userId = null) {
    const modules = await LearningModule.find().sort({ order: 1 });

    if (!userId) {
      return modules.map((m) => ({
        ...m.toObject(),
        progress: null,
      }));
    }

    const progressList = await LearningProgress.find({ user: userId });
    const progressMap = {};
    progressList.forEach((p) => {
      progressMap[p.moduleSlug] = p;
    });

    return modules.map((m) => {
      const p = progressMap[m.slug];
      const completedCount = p ? p.completedLessons.length : 0;
      const totalLessons = m.lessons.length;
      const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      return {
        ...m.toObject(),
        progress: {
          completedLessons: p ? p.completedLessons : [],
          isCompleted: p ? p.isCompleted : false,
          quizScore: p ? p.quizScore : null,
          progressPercent: percent,
        },
      };
    });
  }

  async getModuleBySlug(slug, userId = null) {
    const moduleItem = await LearningModule.findOne({ slug });
    if (!moduleItem) {
      const err = new Error(`Learning module ${slug} not found.`);
      err.statusCode = 404;
      throw err;
    }

    let progress = null;
    if (userId) {
      progress = await LearningProgress.findOne({ user: userId, moduleSlug: slug });
    }

    return {
      module: moduleItem,
      progress: progress || { completedLessons: [], isCompleted: false, quizScore: null },
    };
  }

  async markLessonComplete(userId, slug, lessonId) {
    let progress = await LearningProgress.findOne({ user: userId, moduleSlug: slug });
    if (!progress) {
      progress = new LearningProgress({
        user: userId,
        moduleSlug: slug,
        completedLessons: [lessonId],
      });
    } else {
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }
    }

    const moduleItem = await LearningModule.findOne({ slug });
    if (moduleItem && progress.completedLessons.length >= moduleItem.lessons.length) {
      progress.isCompleted = true;
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    return progress;
  }

  async submitQuiz(userId, slug, answers) {
    const moduleItem = await LearningModule.findOne({ slug });
    if (!moduleItem) {
      const err = new Error('Module not found');
      err.statusCode = 404;
      throw err;
    }

    const quiz = moduleItem.quiz;
    let score = 0;
    const evaluatedAnswers = [];

    quiz.forEach((q, index) => {
      const selected = answers[index];
      const isCorrect = selected === q.correctAnswerIndex;
      if (isCorrect) score++;

      evaluatedAnswers.push({
        questionIndex: index,
        selectedOption: selected,
        isCorrect,
        correctOption: q.correctAnswerIndex,
        explanation: q.explanation,
      });
    });

    const percentage = Math.round((score / quiz.length) * 100);

    const attempt = await QuizAttempt.create({
      user: userId,
      moduleSlug: slug,
      score,
      totalQuestions: quiz.length,
      percentage,
      answers: evaluatedAnswers,
    });

    // Update module progress
    let progress = await LearningProgress.findOne({ user: userId, moduleSlug: slug });
    if (!progress) {
      progress = new LearningProgress({
        user: userId,
        moduleSlug: slug,
        completedLessons: [],
      });
    }
    progress.quizScore = percentage;
    if (percentage >= 70) {
      progress.isCompleted = true;
    }
    await progress.save();

    return {
      attempt,
      percentage,
      passed: percentage >= 70,
    };
  }
}

module.exports = new LearningService();
