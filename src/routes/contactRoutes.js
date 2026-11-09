const express = require('express');
const router = express.Router();
const contactController = require('../controllers/ContactController');

router.post('/', contactController.submit);

module.exports = router;
