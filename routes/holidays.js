const express = require('express');
const router = express.Router();
const {
  getAllHolidays,
  getHolidayById,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} = require('../controllers/holidayController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public routes
router.get('/', getAllHolidays);
router.get('/:id', getHolidayById);

// Protected routes (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), createHoliday);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateHoliday);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteHoliday);

module.exports = router;
