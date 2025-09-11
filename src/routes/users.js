const express = require('express');

const { protect, authorize, canManageUser } = require('../middleware/auth');
const { validate, userSchemas } = require('../middleware/validate');
const User = require('../models/User');
const UserLeaveBalance = require('../models/UserLeaveBalance');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get all users (Admin/SuperAdmin only)
// @route   GET /api/users
// @access  Private (Admin/SuperAdmin)
router.get('/', authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { fullName: { $regex: req.query.search, $options: 'i' } },
        { username: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { employeeNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Execute query
    const users = await User.find(filter)
      .select('-password')
      .populate('managerId', 'fullName employeeNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_USERS_ERROR',
        message: 'Error fetching users'
      }
    });
  }
});

// @desc    Get department users (Head of Department only)
// @route   GET /api/users/department
// @access  Private (Head of Department)
router.get('/department', authorize('head_of_department'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object - only users from Head of Department's department
    const filter = { department: req.user.department };
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { fullName: { $regex: req.query.search, $options: 'i' } },
        { username: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { employeeNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Execute query
    const users = await User.find(filter)
      .select('-password')
      .populate('managerId', 'fullName employeeNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get department users error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_DEPARTMENT_USERS_ERROR',
        message: 'Error fetching department users'
      }
    });
  }
});

// @desc    Get team members (Manager only)
// @route   GET /api/users/team
// @access  Private (Manager)
router.get('/team', authorize('manager'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object - only users managed by the current manager
    const filter = { managerId: req.user._id };
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { fullName: { $regex: req.query.search, $options: 'i' } },
        { username: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { employeeNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Execute query
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get team users error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_TEAM_USERS_ERROR',
        message: 'Error fetching team users'
      }
    });
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('managerId', 'fullName employeeNumber email')
      .populate('leaveBalance');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Check access permissions
    if (req.user.role === 'employee' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only view your own profile'
        }
      });
    }

    if (req.user.role === 'head_of_department' && user.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only view users in your department'
        }
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_USER_ERROR',
        message: 'Error fetching user'
      }
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password');

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_USER_ERROR',
        message: 'Error fetching user'
      }
    });
  }
});

// @desc    Update user (Admin/SuperAdmin only)
// @route   PUT /api/users/:id
// @access  Private (Admin/SuperAdmin)
router.put('/:id', authorize('admin', 'superadmin'), validate(userSchemas.updateUser), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    logger.info(`User ${updatedUser.username} updated by ${req.user.username}`);

    res.json({
      success: true,
      data: {
        user: updatedUser
      },
      message: 'User updated successfully'
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_USER_ERROR',
        message: 'Error updating user'
      }
    });
  }
});

// @desc    Update department user (Head of Department only)
// @route   PUT /api/users/:id/department
// @access  Private (Head of Department)
router.put('/:id/department', authorize('head_of_department'), canManageUser, validate(userSchemas.updateUser), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Head of Department can only update certain fields
    const allowedFields = ['fullName', 'email', 'phone'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    logger.info(`Department user ${updatedUser.username} updated by ${req.user.username}`);

    res.json({
      success: true,
      data: {
        user: updatedUser
      },
      message: 'User updated successfully'
    });
  } catch (error) {
    logger.error('Update department user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_DEPARTMENT_USER_ERROR',
        message: 'Error updating department user'
      }
    });
  }
});

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
router.put('/me', validate(userSchemas.updateProfile), async (req, res) => {
  try {
    // Users can only update certain fields
    const allowedFields = ['fullName', 'email', 'phone'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    logger.info(`Profile updated for user ${updatedUser.username}`);

    res.json({
      success: true,
      data: {
        user: updatedUser
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_PROFILE_ERROR',
        message: 'Error updating profile'
      }
    });
  }
});

// @desc    Deactivate user (Admin/SuperAdmin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin/SuperAdmin)
router.delete('/:id', authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Prevent deactivating own account
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_DEACTIVATE_SELF',
          message: 'You cannot deactivate your own account'
        }
      });
    }

    // Deactivate user
    user.isActive = false;
    await user.save();

    logger.info(`User ${user.username} deactivated by ${req.user.username}`);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    logger.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DEACTIVATE_USER_ERROR',
        message: 'Error deactivating user'
      }
    });
  }
});

// @desc    Get user leave balance
// @route   GET /api/users/:id/leave-balance
// @access  Private
router.get('/:id/leave-balance', async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    // Check access permissions
    if (req.user.role === 'employee' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only view your own leave balance'
        }
      });
    }

    if (req.user.role === 'head_of_department') {
      const targetUser = await User.findById(req.params.id);
      if (!targetUser || targetUser.department !== req.user.department) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'You can only view leave balance for users in your department'
          }
        });
      }
    }

    const leaveBalance = await UserLeaveBalance.findOrCreateBalance(req.params.id, year);

    res.json({
      success: true,
      data: {
        leaveBalance: leaveBalance.getBalanceSummary()
      }
    });
  } catch (error) {
    logger.error('Get leave balance error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_LEAVE_BALANCE_ERROR',
        message: 'Error fetching leave balance'
      }
    });
  }
});

// @desc    Update user leave balance (Admin/SuperAdmin only)
// @route   PUT /api/users/:id/leave-balance
// @access  Private (Admin/SuperAdmin)
router.put('/:id/leave-balance', authorize('admin', 'superadmin'), validate(userSchemas.updateLeaveBalance), async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const leaveBalance = await UserLeaveBalance.findOrCreateBalance(req.params.id, year);

    // Update leave balance
    Object.keys(req.body).forEach(field => {
      if (leaveBalance[field] !== undefined) {
        leaveBalance[field] = req.body[field];
      }
    });

    await leaveBalance.save();

    logger.info(`Leave balance updated for user ${req.params.id} by ${req.user.username}`);

    res.json({
      success: true,
      data: {
        leaveBalance: leaveBalance.getBalanceSummary()
      },
      message: 'Leave balance updated successfully'
    });
  } catch (error) {
    logger.error('Update leave balance error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_LEAVE_BALANCE_ERROR',
        message: 'Error updating leave balance'
      }
    });
  }
});

// @desc    Update department user leave balance (Head of Department only)
// @route   PUT /api/users/:id/leave-balance/department
// @access  Private (Head of Department)
router.put('/:id/leave-balance/department', authorize('head_of_department'), canManageUser, validate(userSchemas.updateLeaveBalance), async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const leaveBalance = await UserLeaveBalance.findOrCreateBalance(req.params.id, year);

    // Update leave balance
    Object.keys(req.body).forEach(field => {
      if (leaveBalance[field] !== undefined) {
        leaveBalance[field] = req.body[field];
      }
    });

    await leaveBalance.save();

    logger.info(`Department leave balance updated for user ${req.params.id} by ${req.user.username}`);

    res.json({
      success: true,
      data: {
        leaveBalance: leaveBalance.getBalanceSummary()
      },
      message: 'Leave balance updated successfully'
    });
  } catch (error) {
    logger.error('Update department leave balance error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_DEPARTMENT_LEAVE_BALANCE_ERROR',
        message: 'Error updating leave balance'
      }
    });
  }
});

// @desc    Get all departments
// @route   GET /api/users/departments
// @access  Private (Admin/SuperAdmin)
router.get('/departments', authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const departments = await User.distinct('department');
    
    res.json({
      success: true,
      data: {
        departments: departments.sort()
      }
    });
  } catch (error) {
    logger.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_DEPARTMENTS_ERROR',
        message: 'Error fetching departments'
      }
    });
  }
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Private (Manager, Admin, SuperAdmin)
router.get('/search', authorize('manager', 'admin', 'superadmin'), async (req, res) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SEARCH_QUERY_REQUIRED',
          message: 'Search query is required'
        }
      });
    }

    // Build filters based on user role
    const filters = {};
    if (req.user.role === 'head_of_department') {
      filters.department = req.user.department;
    } else if (req.user.role === 'manager') {
      filters.managerId = req.user._id;
    }

    const users = await User.search(q, filters)
      .select('-password')
      .limit(limit);

    res.json({
      success: true,
      data: {
        users
      }
    });
  } catch (error) {
    logger.error('Search users error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_USERS_ERROR',
        message: 'Error searching users'
      }
    });
  }
});

module.exports = router;
