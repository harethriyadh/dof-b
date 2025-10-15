const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  getUsersByDepartment,
  getAllDepartments,
  getUsersWithFilters,
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateRegistration,
  validateLogin,
  handleValidationErrors,
} = require('../middleware/validation');

// Public routes
router.post('/register', validateRegistration, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

// Department-related routes (protected)
router.get('/departments', authenticateToken, getAllDepartments);
router.get('/departments/:department/users', authenticateToken, getUsersByDepartment);
router.get('/users', authenticateToken, getUsersWithFilters);

module.exports = router;
    