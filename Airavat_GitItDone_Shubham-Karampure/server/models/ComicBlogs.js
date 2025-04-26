const chapterSchema = require('./Chapter');
const mongoose = require('mongoose');

const comicBlogSchema = new mongoose.Schema({
    title : {
        type : String
    },
    email : {
        type : String
    },
    chapters: [chapterSchema],
});

module.exports = mongoose.model('ComicBlog', comicBlogSchema);
