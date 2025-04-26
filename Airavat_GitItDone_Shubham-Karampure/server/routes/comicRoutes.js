const express = require('express');
const comicRoutes = express.Router();

const { createComicBlog, getComicBlog, getUserComicBlogs, getAllBlogs } = require('../controllers/comicBlogController');

comicRoutes.post('/create-comic-blog', createComicBlog);
comicRoutes.post('/get-comic-blog', getComicBlog); // using title
comicRoutes.post('/get-user-comic-blogs', getUserComicBlogs); // using email for fetching p
comicRoutes.post('/get-all-blogs', getAllBlogs);


module.exports = comicRoutes;