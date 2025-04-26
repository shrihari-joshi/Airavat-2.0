// controllers/imageController.js
const imageService = require('../services/imageService');
const Image = require('../models/Image');

class ImageController {
    async uploadImage(req, res) {
        try {
            // Validate request
            if (!req.file) {
                return res.status(400).json({ message: 'No image file provided' });
            }

            if (!req.body.username) {
                return res.status(400).json({ message: 'Username is required' });
            }

            // Process metadata if provided as string
            let metadata = req.body.metadata || [];
            if (typeof metadata === 'string') {
                try {
                    metadata = JSON.parse(metadata);
                } catch (e) {
                    metadata = [{ text: metadata }];
                }
            }

            // Prepare data for service
            const imageData = {
                text: req.body.text || '',
                metadata: metadata,
                username: req.body.username
            };

            // Save image data
            const savedImage = await imageService.saveImageData(imageData, req.file);

            res.status(201).json({
                message: 'Image uploaded successfully',
                image: savedImage
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            res.status(500).json({
                message: 'Failed to upload image',
                error: error.message
            });
        }
    }

    async getImagesByUsername(req, res) {
        const { email } = req.body;
        try {
            console.log('Fetching images for user:', email);
            const images = await Image.find({ email : email });
            res.status(200).json(images);
        } catch (error) {
            console.log(error),
            res.status(500).json({
                message: 'Failed to fetch images',
                error: error.message,
            });
        }
    }

    async getImageById(req, res) {
        try {
            const { id } = req.params;
            const image = await imageService.getImageById(id);

            if (!image) {
                return res.status(404).json({ message: 'Image not found' });
            }

            res.status(200).json(image);
        } catch (error) {
            res.status(500).json({
                message: 'Failed to fetch image',
                error: error.message
            });
        }
    }
}

module.exports = new ImageController();