// routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadImage');
const imageController = require('../controllers/imageController');

// Route to upload a new image
router.post('/upload', upload.single('image'), imageController.uploadImage);

// Route to get all images for a specific username
router.get('/:username', imageController.getImagesByUsername);

// Route to get a specific image by ID
// router.get('/:id', imageController.getImageById);

module.exports = router;