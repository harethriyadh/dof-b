const express = require('express');
const router = express.Router();
const {
  getAllNotifications,
  getNotificationById,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  updateNotification,
  deleteNotification,
} = require('../controllers/notificationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Protected routes
router.get('/user/:user_id', authenticateToken, getAllNotifications);
router.get('/:id', authenticateToken, getNotificationById);
router.post('/', authenticateToken, authorizeRoles('admin', 'manager'), createNotification);
router.patch('/:id/read', authenticateToken, markNotificationAsRead);
router.patch('/user/:user_id/read-all', authenticateToken, markAllNotificationsAsRead);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'manager'), updateNotification);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'manager'), deleteNotification);

module.exports = router;
