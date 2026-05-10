const Report = require('../models/Report');
const Notification = require('../models/Notification');

// @desc    Create a new crime report
// @route   POST /api/reports
const createReport = async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, address, severity, isAnonymous } = req.body;

    const reportData = {
      title,
      description,
      category,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address: address || ''
      },
      severity: severity || 'medium',
      isAnonymous: isAnonymous === 'true' || isAnonymous === true
    };

    // Attach reporter if authenticated and not anonymous
    if (req.user) {
      reportData.reporter = req.user._id;
    }

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      reportData.media = req.files.map(file => file.filename);
    }

    // Add initial status to history
    reportData.statusHistory = [{
      status: 'pending',
      changedBy: req.user ? req.user._id : null,
      changedAt: new Date(),
      note: 'Report submitted'
    }];

    const report = await Report.create(reportData);
    const populatedReport = await Report.findById(report._id).populate('reporter', 'name email avatar');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      // Send to admin and authority rooms
      io.to('admin').emit('newReport', populatedReport);
      io.to('authority').emit('newReport', populatedReport);
      
      // Also send to the reporter specifically
      if (req.user) {
        io.to(req.user._id.toString()).emit('newReport', populatedReport);
      }
    }

    res.status(201).json(populatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reports with filters
// @route   GET /api/reports
const getReports = async (req, res) => {
  try {
    const { category, status, severity, reporter, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (reporter) query.reporter = reporter;

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('reporter', 'name email avatar')
      .populate('assignedTo', 'name email')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Mask sensitive data for public/citizens
    const isElevatedUser = req.user && (req.user.role === 'admin' || req.user.role === 'authority');
    
    const sanitizedReports = reports.map(report => {
      const r = report.toObject();
      if (!isElevatedUser && r.reporter) {
        const isOwnReport = req.user && req.user._id.toString() === r.reporter._id.toString();
        if (!isOwnReport || r.isAnonymous) {
          r.reporter = { name: 'Anonymous Citizen' };
        }
      }
      return r;
    });

    res.json({
      reports: sanitizedReports,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single report by ID
// @route   GET /api/reports/:id
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'name email avatar')
      .populate('assignedTo', 'name email')
      .populate('statusHistory.changedBy', 'name');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const isElevatedUser = req.user && (req.user.role === 'admin' || req.user.role === 'authority');
    const r = report.toObject();
    
    if (!isElevatedUser && r.reporter) {
      const isOwnReport = req.user && req.user._id.toString() === r.reporter._id.toString();
      if (!isOwnReport || r.isAnonymous) {
        r.reporter = { name: 'Anonymous Citizen' };
      }
    }

    res.json(r);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update report status
// @route   PUT /api/reports/:id/status
const updateReportStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    report.statusHistory.push({
      status,
      changedBy: req.user._id,
      changedAt: new Date(),
      note: note || `Status updated to ${status}`
    });

    await report.save();

    const updatedReport = await Report.findById(report._id)
      .populate('reporter', 'name email avatar')
      .populate('assignedTo', 'name email')
      .populate('statusHistory.changedBy', 'name');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      // Send to admin and authority
      io.to('admin').emit('reportUpdated', updatedReport);
      io.to('authority').emit('reportUpdated', updatedReport);

      // Send to the specific reporter
      if (report.reporter) {
        io.to(report.reporter.toString()).emit('reportUpdated', updatedReport);

        // Notify reporter if not anonymous
        if (!report.isAnonymous) {
          const notification = await Notification.create({
            recipient: report.reporter,
            type: 'status_update',
            title: 'Report Status Updated',
            message: `Your report "${report.title}" has been updated to "${status}"`,
            relatedReport: report._id
          });
          io.to(report.reporter.toString()).emit('notification', notification);
        }
      }
    }

    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a report
// @route   DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await Report.findByIdAndDelete(req.params.id);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('reportDeleted', req.params.id);
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reports near a location
// @route   GET /api/reports/nearby
const getNearbyReports = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query; // radius in meters

    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    };

    const reports = await Report.find(query).populate('reporter', 'name avatar');

    const isElevatedUser = req.user && (req.user.role === 'admin' || req.user.role === 'authority');
    
    const sanitizedReports = reports.map(report => {
      const r = report.toObject();
      if (!isElevatedUser && r.reporter) {
        const isOwnReport = req.user && req.user._id.toString() === r.reporter._id.toString();
        if (!isOwnReport || r.isAnonymous) {
          r.reporter = { name: 'Anonymous Citizen' };
        }
      }
      return r;
    });

    res.json(sanitizedReports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get report statistics
// @route   GET /api/reports/stats
const getReportStats = async (req, res) => {
  try {
    const filter = {};
    const totalReports = await Report.countDocuments(filter);
    const pendingReports = await Report.countDocuments({ ...filter, status: 'pending' });
    const investigatingReports = await Report.countDocuments({ ...filter, status: 'investigating' });
    const resolvedReports = await Report.countDocuments({ ...filter, status: 'resolved' });

    const categoryStats = await Report.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const severityStats = await Report.aggregate([
      { $match: filter },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    const recentReports = await Report.find(filter)
      .sort('-createdAt')
      .limit(5)
      .populate('reporter', 'name avatar');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Report.aggregate([
      { $match: { ...filter, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const statsData = {
      totalReports,
      pendingReports,
      investigatingReports,
      resolvedReports,
      categoryStats,
      severityStats,
      recentReports,
      dailyStats
    };

    const isElevatedUser = req.user && (req.user.role === 'admin' || req.user.role === 'authority');
    const sanitizedRecentReports = statsData.recentReports.map(report => {
      const r = report.toObject ? report.toObject() : JSON.parse(JSON.stringify(report));
      if (!isElevatedUser && r.reporter) {
        const isOwnReport = req.user && req.user._id && r.reporter._id && req.user._id.toString() === r.reporter._id.toString();
        if (!isOwnReport || r.isAnonymous) {
          r.reporter = { name: 'Anonymous Citizen' };
        }
      }
      return r;
    });

    res.json({
      ...statsData,
      recentReports: sanitizedRecentReports
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  deleteReport,
  getNearbyReports,
  getReportStats
};
