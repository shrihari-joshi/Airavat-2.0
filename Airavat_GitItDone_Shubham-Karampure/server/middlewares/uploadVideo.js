// middlewares/uploadVideo.js
const multer = require('multer');
const path = require('path');

// Set video storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/videos');  // Folder to store videos
    },
    filename: (req, file, cb) => {
        // Use original filename with a timestamp to avoid name collisions
        cb(null, `${file.originalname}`);
    }
});

const videoFilter = (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mkv', 'video/mov']; // Allowed video formats
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid video format'), false);
    }
};

// Set up the Multer upload with limits and file type filter
const upload = multer({
    storage: storage,
    fileFilter: videoFilter,
    limits: { fileSize: 50 * 1024 * 1024 },  // 50 MB max file size
});

module.exports = upload;
