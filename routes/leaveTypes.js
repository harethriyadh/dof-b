const express = require('express');
const router = express.Router();
const {
  getAllLeaveTypes,
  getLeaveTypeById,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
} = require('../controllers/leaveTypeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public routes
router.get('/', getAllLeaveTypes);
router.get('/:id', getLeaveTypeById);

// Protected routes (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), createLeaveType);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateLeaveType);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteLeaveType);

module.exports = router;
