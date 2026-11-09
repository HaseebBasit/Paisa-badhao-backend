const Expert = require('../models/Expert');
const ExpertBooking = require('../models/ExpertBooking');

class ExpertService {
  async getExperts({ search, specialty }) {
    const query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { specialties: { $regex: search, $options: 'i' } },
      ];
    }

    if (specialty && specialty !== 'All') {
      query.specialties = { $regex: specialty, $options: 'i' };
    }

    return await Expert.find(query).sort({ rating: -1 });
  }

  async getExpertById(id) {
    const expert = await Expert.findById(id);
    if (!expert) {
      const err = new Error('Expert mentor not found.');
      err.statusCode = 404;
      throw err;
    }
    return expert;
  }

  async bookSession({ userId, expertId, date, timeSlot, topic, notes }) {
    const expert = await Expert.findById(expertId);
    if (!expert) {
      const err = new Error('Expert mentor not found.');
      err.statusCode = 404;
      throw err;
    }

    const booking = await ExpertBooking.create({
      user: userId,
      expert: expert._id,
      date,
      timeSlot,
      topic: topic || 'General PSX Portfolio Consultation',
      notes: notes || '',
      feePaid: expert.feePerSession,
      currency: expert.feeCurrency || 'PKR',
      status: 'CONFIRMED',
    });

    return await booking.populate('expert');
  }

  async getUserBookings(userId) {
    return await ExpertBooking.find({ user: userId })
      .populate('expert')
      .sort({ createdAt: -1 });
  }
}

module.exports = new ExpertService();
