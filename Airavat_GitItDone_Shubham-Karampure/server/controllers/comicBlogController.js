// controllers/comicBlogController.js

const ComicBlog = require('../models/ComicBlogs');
const User = require('../models/User')
const Image = require('../models/Image');


class ComicBlogController {
    async createComicBlog(req, res) {
        try {
            const { title, email, description, comicStyle, complexityLevel, image_names } = req.body;

            // Validation
            if (!title) return res.status(400).json({ message: 'Blog title is required' });
            // if (!email) return res.status(400).json({ message: 'email is required' });
            if (!Array.isArray(image_names) || image_names.length === 0) {
                return res.status(400).json({ message: 'At least one image_name is required' });
            }

            console.log("in comic controller")
            // Find images by image_name
            console.log(image_names)


            const baseNames = image_names.map(name => name.split('.')[0]);

            // Build regex patterns to match any image_name that starts with base name + dot
            const regexPatterns = baseNames.map(name => new RegExp(`^${name}\\.`));
            
            const images = await Image.find({
                image_name: { $in: regexPatterns }
            });
            
            // Validate all were found
            if (images.length !== baseNames.length) {
                const foundBaseNames = images.map(img => img.image_name.split('.')[0]);
                const missing = baseNames.filter(name => !foundBaseNames.includes(name));
                
                return res.status(400).json({
                    message: 'Some image_names were not found',
                    missing
                });
            }
            
            console.log(images);
            
            // Create ComicBlog
            const comicBlog = await ComicBlog.create({
                title,
                description,
                email,
                comicStyle,
                complexityLevel,
                images: images.map(img => img._id)
            });
            
            const populatedBlog = await ComicBlog.findById(comicBlog._id).populate('images');
            console.log(populatedBlog)
            res.status(201).json({
                message: 'Comic blog created successfully',
                comicBlog: populatedBlog
            });
        } catch (error) {
            console.error('Error creating comic blog:', error);
            res.status(500).json({
                message: 'Failed to create comic blog',
                error: error.message
            });
        }
    }

    async getComicBlog(req, res) {
        const { email, title } = req.body;
        try {
            const comicBlog = await ComicBlog.findOne({ title });
            console.log(title)
            if (!comicBlog) {
                return res.status(404).json({ message: 'Comic blog not found' });
            }
    
            // Manually populate images in each chapter
            const chaptersWithImages = await Promise.all(
                comicBlog.chapters.map(async (chapter) => {
                    if (!chapter.images || chapter.images.length === 0) return chapter;
    
                    const populatedImages = await Image.find({
                        _id: { $in: chapter.images }
                    });
    
                    return {
                        ...chapter.toObject(),
                        images: populatedImages
                    };
                })
            );
    
            const fullComicBlog = {
                ...comicBlog.toObject(),
                chapters: chaptersWithImages
            };
            console.log(fullComicBlog)
            return res.status(200).json({ comicBlog: fullComicBlog });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    

    async getUserComicBlogs(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ message: 'email is required' });
            }

            const comicBlogs = await ComicBlog.find({ email }).populate('images');

            res.status(200).json({ comicBlogs });
        } catch (error) {
            res.status(500).json({
                message: 'Failed to fetch user comic blogs',
                error: error.message
            });
        }
    }

    async getAllBlogs (req, res) {
        try {
            const blogs = await ComicBlog.find().populate('images');
            console.log(blogs)
            return res.status(200).json({ blogs });
        }
        catch (err) {
            console.log(err.message)
            return res.status(500).json({ message: 'Internal server error' });
        }
    }   

}

module.exports = new ComicBlogController();
