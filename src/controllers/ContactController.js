const contactService = require('../services/ContactService');

class ContactController {
  async submit(req, res, next) {
    try {
      const { name, email, message } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const submission = await contactService.submitContactForm({
        name,
        email,
        message,
        ipAddress,
      });

      res.status(201).json({
        success: true,
        message: 'Thank you for reaching out to PAISA BADHAO! Your message has been received.',
        data: submission,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ContactController();
