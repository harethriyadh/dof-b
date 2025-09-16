const express = require('express');
const router = express.Router();
const {
  getAllLeaveConsumptionRecords,
  getLeaveConsumptionRecordById,
  createLeaveConsumptionRecord,
  updateLeaveConsumptionRecord,
  deleteLeaveConsumptionRecord,
} = require('../controllers/leaveConsumptionController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Protected routes
router.get('/', authenticateToken, getAllLeaveConsumptionRecords);
router.get('/:id', authenticateToken, getLeaveConsumptionRecordById);
router.post('/', authenticateToken, authorizeRoles('admin', 'manager'), createLeaveConsumptionRecord);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'manager'), updateLeaveConsumptionRecord);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'manager'), deleteLeaveConsumptionRecord);

module.exports = router;
