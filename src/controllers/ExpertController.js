const expertService = require('../services/ExpertService');

class ExpertController {
  async getExperts(req, res, next) {
    try {
      const { search, specialty } = req.query;
      const experts = await expertService.getExperts({ search, specialty });
      res.status(200).json({
        success: true,
        data: experts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpertById(req, res, next) {
    try {
      const expert = await expertService.getExpertById(req.params.id);
      res.status(200).json({
        success: true,
        data: expert,
      });
    } catch (error) {
      next(error);
    }
  }

  async bookSession(req, res, next) {
    try {
      const { expertId, date, timeSlot, topic, notes } = req.body;
      if (!expertId || !date || !timeSlot) {
        return res.status(400).json({
          success: false,
          message: 'Expert ID, date, and time slot are required.',
        });
      }

      const booking = await expertService.bookSession({
        userId: req.user._id,
        expertId,
        date,
        timeSlot,
        topic,
        notes,
      });

      res.status(201).json({
        success: true,
        message: 'Consultation session booked successfully!',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyBookings(req, res, next) {
    try {
      const bookings = await expertService.getUserBookings(req.user._id);
      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExpertController();
