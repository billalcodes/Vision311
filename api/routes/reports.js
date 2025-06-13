const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Report = require('../models/Report');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Helper function to validate report data
const validateReportData = (data) => {
  const { title, description, issueType, location } = data;

  // Allow either title or issueType
  if (!title && !issueType) {
    return { isValid: false, message: 'Title or issue type is required' };
  }

  if (!description) {
    return { isValid: false, message: 'Description is required' };
  }

  if (!location) {
    return { isValid: false, message: 'Location is required' };
  }

  return { isValid: true };
};

// Helper function to validate image path
const validateImagePath = (imagePath) => {
  // If no image path provided, it's valid
  if (!imagePath) {
    console.log('No image path provided');
    return true;
  }

  console.log('Validating image path:', imagePath);

  // If it's a URL, extract the path portion if it points to our server
  if (imagePath.startsWith('http')) {
    if (imagePath.includes('/uploads/') || imagePath.includes('/api/uploads/')) {
      console.log('Valid server URL path detected');
      return true;
    } else {
      console.log('External URL detected');
      return true; // External URL, consider it valid
    }
  }

  // Reject file:// URIs - these should have been uploaded already
  if (imagePath.startsWith('file://')) {
    console.log('file:// URI detected - this should have been uploaded first');
    return false;
  }

  // If it's a server path, check if file exists
  if (imagePath.startsWith('/uploads/') || imagePath.startsWith('/api/uploads/')) {
    console.log('Server path detected:', imagePath);
    return true; // Trust that the server path is valid
  }

  // Any other format is invalid
  console.log('Invalid image path format');
  return false;
};

// @route   POST /api/reports
// @desc    Create a new report
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating report with data:', req.body);

    const {
      title,
      description,
      aiDescription,
      issueType,
      location,
      image,
      urgency,
      confidenceScore,
      authority
    } = req.body;

    // Validate report data
    const validation = validateReportData({
      title,
      description,
      issueType,
      location
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Process image path - Use the path returned from the upload endpoint
    let imagePath = null;

    if (image) {
      console.log('Processing image path:', image);

      if (image.startsWith('http')) {
        // Handle full URLs from your server
        if (image.includes('/api/uploads/')) {
          imagePath = '/api/uploads/' + image.split('/api/uploads/')[1];
        } else if (image.includes('/uploads/')) {
          imagePath = '/uploads/' + image.split('/uploads/')[1];
        } else {
          // External URL
          imagePath = image;
        }
      } else if (image.startsWith('/api/uploads/') || image.startsWith('/uploads/')) {
        // Already a server path
        imagePath = image;
      } else if (image.startsWith('file://')) {
        // This should not happen - client should upload first
        console.warn('Received file:// URI - this should have been uploaded first:', image);
        return res.status(400).json({
          success: false,
          message: 'Local file paths cannot be saved directly. Please upload the image first.'
        });
      } else {
        // Any other format
        imagePath = image;
      }

      console.log('Final image path to be saved:', imagePath);
    }

    // Create and save the report
    const newReport = new Report({
      userId: req.user.id,
      title: title || `${issueType} Report`,
      description,
      aiDescription,
      issueType,
      location,
      image: imagePath,
      urgency: urgency || 'medium',
      confidenceScore: confidenceScore || 0,
      authority: authority || 'City Maintenance',
      updates: [
        { date: new Date(), text: "Report submitted" }
      ]
    });

    await newReport.save();
    console.log('Report saved successfully, id:', newReport._id);

    // Populate user information for the response
    const populatedReport = await Report.findById(newReport._id)
      .populate('userId', 'name avatar');

    res.status(201).json({
      success: true,
      report: populatedReport
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/reports
// @desc    Get all reports for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name avatar');

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/:id
// @desc    Get report by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('userId', 'name avatar');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Make sure the user owns the report
    if (report.userId._id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/community/feed
// @desc    Get community feed reports (all reports)
// @access  Private
router.get('/community/feed', auth, async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('userId', 'name avatar');

    res.json(reports);
  } catch (error) {
    console.error('Get community feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reports/:id
// @desc    Update report status or add update
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, updateText } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Make sure the user owns the report
    if (report.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update status if provided
    if (status) {
      report.status = status;
      report.updates.push({
        date: new Date(),
        text: `Status changed to ${status}`
      });
    }

    // Add update if provided
    if (updateText) {
      report.updates.push({
        date: new Date(),
        text: updateText
      });
    }

    await report.save();

    // Populate user information for the response
    const populatedReport = await Report.findById(report._id)
      .populate('userId', 'name avatar');

    res.json({
      success: true,
      report: populatedReport
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router