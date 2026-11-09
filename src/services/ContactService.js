const ContactSubmission = require('../models/ContactSubmission');

class ContactService {
  async submitContactForm({ name, email, message, ipAddress = '' }) {
    if (!name || !email || !message) {
      const err = new Error('Name, email, and message are required.');
      err.statusCode = 400;
      throw err;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      const err = new Error('Please enter a valid email address.');
      err.statusCode = 400;
      throw err;
    }

    const submission = await ContactSubmission.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      ipAddress,
    });

    return submission;
  }
}

module.exports = new ContactService();
