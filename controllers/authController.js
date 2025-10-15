const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// Register a new user
const register = async (req, res) => {
  try {
    const { username, password, full_name, phone, college, department, administrative_position, degree, gender, role, leave_balances } = req.body;

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
      college,
      department,
      administrative_position,
      degree,
      gender: gender.toLowerCase(),
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
    // Return complete user schema with all fields
    const user = {
      user_id: req.user.user_id,
      username: req.user.username,
      full_name: req.user.full_name,
      phone: req.user.phone,
      college: req.user.college,
      department: req.user.department,
      administrative_position: req.user.administrative_position,
      degree: req.user.degree,
      gender: req.user.gender,
      role: req.user.role,
      leave_balances: req.user.leave_balances || [],
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user,
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
    const { full_name, phone, college, department, administrative_position, degree, gender, role, leave_balances } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (typeof full_name !== 'undefined') updateData.full_name = full_name;
    if (typeof phone !== 'undefined') updateData.phone = phone;
    if (typeof college !== 'undefined') updateData.college = college;
    if (typeof department !== 'undefined') updateData.department = department;
    if (typeof administrative_position !== 'undefined') updateData.administrative_position = administrative_position;
    if (typeof degree !== 'undefined') updateData.degree = degree;
    if (typeof gender !== 'undefined') updateData.gender = gender.toLowerCase();
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

// Get users by department
const getUsersByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    
    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Department parameter is required',
      });
    }

    // Find users by department (case-insensitive)
    const users = await User.find({ 
      department: { $regex: new RegExp(`^${department}$`, 'i') }
    }).select('-password'); // Exclude password field

    res.status(200).json({
      success: true,
      message: `Users from ${department} department retrieved successfully`,
      data: {
        department: department,
        count: users.length,
        users: users,
      },
    });
  } catch (error) {
    console.error('Get users by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users by department',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get all departments
const getAllDepartments = async (req, res) => {
  try {
    // Get unique departments from all users
    const departments = await User.distinct('department');
    
    // Get count of users per department
    const departmentCounts = await Promise.all(
      departments.map(async (dept) => {
        const count = await User.countDocuments({ department: dept });
        return {
          department: dept,
          user_count: count
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'All departments retrieved successfully',
      data: {
        total_departments: departments.length,
        departments: departmentCounts,
      },
    });
  } catch (error) {
    console.error('Get all departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve departments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get users with filters (department, role, college, etc.)
const getUsersWithFilters = async (req, res) => {
  try {
    const { department, role, college, gender, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filters = {};
    if (department) filters.department = { $regex: new RegExp(`^${department}$`, 'i') };
    if (role) filters.role = role.toLowerCase();
    if (college) filters.college = { $regex: new RegExp(`^${college}$`, 'i') };
    if (gender) filters.gender = gender.toLowerCase();

    // Calculate pagination
    const skip = (page - 1) * limit;
    const limitNum = parseInt(limit);

    // Get users with filters and pagination
    const users = await User.find(filters)
      .select('-password')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filters);
    const totalPages = Math.ceil(totalUsers / limitNum);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: users,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_users: totalUsers,
          users_per_page: limitNum,
          has_next_page: page < totalPages,
          has_prev_page: page > 1,
        },
        filters_applied: filters,
      },
    });
  } catch (error) {
    console.error('Get users with filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getUsersByDepartment,
  getAllDepartments,
  getUsersWithFilters,
};
