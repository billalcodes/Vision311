const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Create a MongoDB schema for images
const ImageSchema = new mongoose.Schema({
  data: {
    type: Buffer,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  fileName: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Image = mongoose.model('Image', ImageSchema);

// Configure multer to store in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @route   POST /api/uploads
// @desc    Upload an image to MongoDB
// @access  Private
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    console.log('Upload request received, file:', req.file?.originalname);

    if (!req.file) {
      console.error('No file received in upload request');
      return res.status(400).json({
        success: false,
        message: 'No image uploaded or invalid image format'
      });
    }

    console.log('File size:', req.file.size, 'bytes');
    console.log('File mimetype:', req.file.mimetype);

    // Create a new image document
    const newImage = new Image({
      data: req.file.buffer,
      contentType: req.file.mimetype,
      fileName: req.file.originalname,
      uploadedBy: req.user.id
    });

    // Save to MongoDB
    await newImage.save();
    console.log('Image saved to MongoDB with ID:', newImage._id);

    // Return the image ID as the path
    const imagePath = `/api/uploads/${newImage._id}`;
    console.log('Returning image path:', imagePath);

    res.json({
      success: true,
      imagePath: imagePath,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   GET /api/uploads/:id
// @desc    Get an image from MongoDB
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;