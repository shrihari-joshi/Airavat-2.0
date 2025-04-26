// controllers/videoController.js
const Video = require('../models/Video');
const path = require('path');

class VideoController {
    async uploadVideo(req, res) {
        try {
            const { title, description, email } = req.body;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ message: 'No video file uploaded' });
            }

            // Save video data in the database
            const videoUrl = path.join('uploads/videos', file.filename).replace(/\\/g, '/');

            const newVideo = new Video({
                title,
                description,
                video_url: videoUrl,
                email,
            });

            const savedVideo = await newVideo.save();

            return res.status(201).json({
                message: 'Video uploaded successfully',
                video: savedVideo
            });
        } catch (err) {
            console.error('Error uploading video:', err);
            return res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }

    // To fetch videos for a specific user
    async getVideosByUser(req, res) {
        try {
            const { email } = req.params;
            const videos = await Video.find({ email });
            return res.status(200).json({ videos });
        } catch (err) {
            console.error('Error fetching videos:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new VideoController();
