// models/imageModel.js
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    text: [{
        type: String,
        // required: true
    }],
    image_name: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        required: true
    },
    metadata: [{
        text: {
        type: String
        }
    }],
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Image', imageSchema);