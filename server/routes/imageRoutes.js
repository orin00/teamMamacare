const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// Define the route that handles getting images by email
router.post('/images', imageController.getImagesByEmail);

module.exports = router;
