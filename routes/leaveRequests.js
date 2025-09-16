const express = require('express');
const router = express.Router();
const {
  getAllLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  updateLeaveRequest,
  processLeaveRequest,
  deleteLeaveRequest,
} = require('../controllers/leaveRequestController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Protected routes
router.get('/', authenticateToken, getAllLeaveRequests);
router.get('/:id', authenticateToken, getLeaveRequestById);
router.post('/', authenticateToken, createLeaveRequest);
router.put('/:id', authenticateToken, updateLeaveRequest);
router.patch('/:id/process', authenticateToken, authorizeRoles('admin', 'manager'), processLeaveRequest);
router.delete('/:id', authenticateToken, deleteLeaveRequest);

module.exports = router;
