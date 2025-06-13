const mongoose = require('mongoose');

// Define update schema for nested updates array
const UpdateSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  text: {
    type: String,
    required: true
  }
});

// Define the Report schema
const ReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  aiDescription: {
    type: String,
    default: ''
  },
  issueType: {
    type: String,
    default: 'Other'
  },
  location: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  confidenceScore: {
    type: Number,
    default: 0
  },
  authority: {
    type: String,
    default: 'City Maintenance'
  },
  category: {
    type: String,
    default: null
  },
  upvotes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  updates: [UpdateSchema],
  // Additional fields can be added as needed
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Report', ReportSchema);