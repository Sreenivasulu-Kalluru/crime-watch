const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['theft', 'assault', 'vandalism', 'fraud', 'drug_activity', 'suspicious_activity', 'traffic', 'murder', 'kidnapping', 'cybercrime', 'other']
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      default: ''
    }
  },
  media: [{
    type: String // file paths
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'investigating', 'resolved', 'dismissed'],
    default: 'pending'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries
reportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', reportSchema);
