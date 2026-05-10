const User = require('../models/User');
const Report = require('../models/Report');
const { clearStatsCache } = require('./reportController');

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role (admin only)
// @route   PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign report to authority
// @route   PUT /api/admin/reports/:id/assign
const assignReport = async (req, res) => {
  try {
    const { authorityId } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { assignedTo: authorityId, status: 'under_review' },
      { new: true }
    ).populate('reporter', 'name email').populate('assignedTo', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Add to status history
    report.statusHistory.push({
      status: 'under_review',
      changedBy: req.user._id,
      changedAt: new Date(),
      note: 'Report assigned to authority'
    });
    await report.save();

    // Invalidate stats cache
    if (clearStatsCache) clearStatsCache();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('reportUpdated', report);
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, updateUserRole, assignReport, deleteUser };
