// models/Video.js
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    video_url: { type: String, required: true },  // Path to the saved video file
    email: { type: String, required: true },  // The email of the user uploading the video
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Video', videoSchema);
