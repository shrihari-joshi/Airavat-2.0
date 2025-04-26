// routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadVideo');
const videoController = require('../controllers/videoController');

// Route to upload a video
router.post('/upload', upload.single('video'), videoController.uploadVideo);

// Route to get all videos by a specific user
router.get('/videos/:email', videoController.getVideosByUser);

module.exports = router;