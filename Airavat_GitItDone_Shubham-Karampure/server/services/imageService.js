// services/imageService.js
const Image = require('../models/Image');
const path = require('path');
const fs = require('fs');

class ImageService {
    async saveImageData(imageData, file) {
        try {
            // Create relative path for storage in DB
            const imageUrl = path.join('uploads/images', file.filename).replace(/\\/g, '/');
            
            console.log(imageData)
            console.log(imageUrl);
            // Create new image document
            const newImage = new Image({
                text: imageData.text || '',
                image_url: imageUrl,
                image_name: file.originalname,
                metadata: imageData.metadata || [],
                email: imageData.email
            });

            // Save to database
            const savedImage = await newImage.save();
            return savedImage;
        } catch (error) {
            // If there's an error, remove the uploaded file
            if (file && file.path) {
                fs.unlink(file.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            }
            throw error;
        }
    }

    async getAllImagesByUsername(email) {
        console.log('Fetching images for user:', username);
        return await Image.find({ email });
    }

    async getImageById(id) {
        return await Image.findById(id);
    }
}

module.exports = new ImageService();