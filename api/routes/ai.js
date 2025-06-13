const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Set up storage for uploaded images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const fileExtension = path.extname(file.originalname) || '.jpg'; // Default to .jpg if no extension
    cb(null, `image-${uniqueSuffix}${fileExtension}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }

  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Initialize upload with increased file size limit (10MB)
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB
  fileFilter: fileFilter
});

// @route   POST /api/ai/analyze
// @desc    Analyze image and detect issue
// @access  Private
router.post('/analyze', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('AI analysis request received:', req.file);

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded or invalid image format'
      });
    }

    // Get file path
    const imagePath = `/uploads/${req.file.filename}`;
    console.log('Image saved at:', imagePath);

    // In a real app, you would send the image to an AI API
    // For now we'll simulate AI analysis with randomized responses
    const issueTypes = ["Pothole", "Broken Streetlight", "Graffiti", "Illegal Dumping", "Fallen Tree"];
    const detectedIssue = issueTypes[Math.floor(Math.random() * issueTypes.length)];

    // Generate AI description based on issue type
    let aiDescription = "";
    switch(detectedIssue) {
      case "Pothole":
        aiDescription = "Image shows a road defect characterized as a pothole. The depression in the road surface appears to be approximately 30-40cm in diameter with jagged edges. This could pose hazards to vehicles and requires repair.";
        break;
      case "Broken Streetlight":
        aiDescription = "The image shows a non-functioning streetlight. The light fixture appears intact but is not illuminated during what seems to be evening hours. This creates a safety concern for pedestrians and vehicles in the area.";
        break;
      case "Graffiti":
        aiDescription = "Unauthorized marking/painting detected on public property. The graffiti appears to cover approximately 1-2 square meters of surface area with multiple colors used.";
        break;
      case "Illegal Dumping":
        aiDescription = "The image shows improperly disposed waste materials in a public area. This may include household items, construction debris, or general refuse placed outside designated disposal areas.";
        break;
      case "Fallen Tree":
        aiDescription = "A tree has fallen and is obstructing a path/road. The tree appears to be medium-sized and may be blocking vehicle or pedestrian traffic. Immediate removal is recommended to restore normal access.";
        break;
    }

    // Assign appropriate authority
    let authority = "City Maintenance";
    if (detectedIssue === "Illegal Dumping") authority = "Environmental Services";
    if (detectedIssue === "Graffiti") authority = "Parks Department";
    if (detectedIssue === "Broken Streetlight") authority = "Public Works - Electrical";
    if (detectedIssue === "Fallen Tree") authority = "Parks & Recreation Department";

    const confidenceScore = Number((Math.random() * 0.3 + 0.7).toFixed(2));

    console.log('Analysis results:', {
      success: true,
      imagePath,
      issueType: detectedIssue,
      confidenceScore,
      authority
    });

    res.json({
      success: true,
      imagePath: imagePath,
      issueType: detectedIssue,
      aiDescription,
      authority,
      confidenceScore,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;