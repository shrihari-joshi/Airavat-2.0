// chapterSchema.js
const mongoose = require('mongoose');

const chatBubbleSchema = new mongoose.Schema({
    character: { type: String, required: true },
    dialogue: { type: String, required: true },
});

const chapterSchema = new mongoose.Schema({
    chapter_number: { type: Number, required: true },
    chapter_title: { type: String, required: true },
    chat_bubbles: [chatBubbleSchema],
    conclusion: { type: String, required: true },
    image_context: { type: String, required: true },
    narration_box: { type: String, required: true },
    image_url: { type: String, required: true },
}, { _id: false }); // _id false if you don’t want nested _id for each subdoc

module.exports = chapterSchema;
