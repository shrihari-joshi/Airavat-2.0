// routes/comicBlogRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadImage');

const ComicBlogController = require('../controllers/ChapterController');

// // Comic blog routes
router.post('/add-comicblogs', ComicBlogController.createComicBlog);
router.post('/add-comicblogs', ComicBlogController.createComicBlog);
router.post('/get-comicblogs', ComicBlogController.getComicBlogs);
router.post('/comicblogs/chapters', ComicBlogController.getBlogChapters);

module.exports = router;
