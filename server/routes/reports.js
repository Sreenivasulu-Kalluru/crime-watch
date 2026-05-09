const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  deleteReport,
  getNearbyReports,
  getReportStats
} = require('../controllers/reportController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public/Semi-private routes
router.get('/', optionalAuth, getReports);
router.get('/stats', optionalAuth, getReportStats);
router.get('/nearby', optionalAuth, getNearbyReports);
router.get('/:id', optionalAuth, getReportById);

// Protected routes
router.post('/', optionalAuth, upload.array('media', 5), createReport);
router.put('/:id/status', protect, authorize('authority', 'admin'), updateReportStatus);
router.delete('/:id', protect, authorize('admin'), deleteReport);

module.exports = router;
