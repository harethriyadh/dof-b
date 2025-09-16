const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// Register a new user
const register = async (req, res) => {
  try {
    const { username, password, full_name, phone, specialist, college, department, role, leave_balances } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists',
      });
    }

    // Create new user
    const user = new User({
      username,
      password,
      full_name,
      phone,
      specialist,
      college,
      department,
      role: (role || 'employee').toLowerCase(),
      leave_balances,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const profile = {
      name: req.user.full_name,
      phone: req.user.phone || null,
      specialist: req.user.specialist || null,
      department: req.user.department || null,
      college: req.user.college || null,
    };

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        profile,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { full_name, phone, specialist, college, department, role, leave_balances } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (typeof full_name !== 'undefined') updateData.full_name = full_name;
    if (typeof phone !== 'undefined') updateData.phone = phone;
    if (typeof specialist !== 'undefined') updateData.specialist = specialist;
    if (typeof college !== 'undefined') updateData.college = college;
    if (typeof department !== 'undefined') updateData.department = department;
    if (typeof role !== 'undefined') updateData.role = role.toLowerCase();
    if (typeof leave_balances !== 'undefined') updateData.leave_balances = leave_balances;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
