const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, assignReport, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/reports/:id/assign', assignReport);
router.delete('/users/:id', deleteUser);

module.exports = router;
