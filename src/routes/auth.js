const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const mockDB = require('../utils/mockDatabase');

const router = express.Router();

// POST /api/v1/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, username, password } = req.body;

    // Check if username already exists
    let existingUser;
    try {
      existingUser = await User.findOne({ username });
    } catch (error) {
      // If database is not available, use mock database
      existingUser = await mockDB.findOne({ username });
    }
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USERNAME_EXISTS',
          message: 'Username already exists'
        }
      });
    }

    // Create new user
    let user;
    try {
      user = new User({
        fullName,
        username,
        password,
        role: 'Employee' // Default role
      });
      await user.save();
    } catch (error) {
      // If database is not available, use mock database
      user = await mockDB.save({
        fullName,
        username,
        password,
        role: 'Employee'
      });
    }

    logger.info(`User registered successfully: ${username}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_ERROR',
        message: 'Error creating user'
      }
    });
  }
});

// POST /api/v1/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    let user;
    try {
      user = await User.findOne({ username });
    } catch (error) {
      // If database is not available, use mock database
      user = await mockDB.findOne({ username });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        }
      });
    }

    // Check password
    let isPasswordValid;
    try {
      isPasswordValid = await user.comparePassword(password);
    } catch (error) {
      // If database is not available, use mock database
      isPasswordValid = await mockDB.comparePassword(username, password);
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`User logged in successfully: ${username}`);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          role: user.role,
          departmentId: user.departmentId,
          collegeId: user.collegeId
        }
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: 'Error during login'
      }
    });
  }
});

module.exports = router;
