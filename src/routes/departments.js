const express = require('express');

const { protect, authorize } = require('../middleware/auth');
const { validate, departmentSchemas } = require('../middleware/validate');
const Department = require('../models/Department');
const User = require('../models/User');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get all departments (Admin/SuperAdmin only)
// @route   GET /api/departments
// @access  Private (Admin/SuperAdmin)
router.get('/', authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    // Execute query
    const departments = await Department.find(filter)
      .populate('headOfDepartment', 'fullName employeeNumber email')
      .populate('manager', 'fullName employeeNumber email')
      .populate('parentDepartment', 'name nameAr')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Department.countDocuments(filter);

    res.json({
      success: true,
      data: {
        departments,
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

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('headOfDepartment', 'fullName employeeNumber email')
      .populate('manager', 'fullName employeeNumber email')
      .populate('parentDepartment', 'name nameAr')
      .populate('childDepartments', 'name nameAr');

    if (!department) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DEPARTMENT_NOT_FOUND',
          message: 'Department not found'
        }
      });
    }

    // Check access permissions for Head of Department
    if (req.user.role === 'head_of_department' && department.name !== req.user.department) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only access your own department'
        }
      });
    }

    res.json({
      success: true,
      data: {
        department
      }
    });
  } catch (error) {
    logger.error('Get department error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_DEPARTMENT_ERROR',
        message: 'Error fetching department'
      }
    });
  }
});

// @desc    Create department (Admin/SuperAdmin only)
// @route   POST /api/departments
// @access  Private (Admin/SuperAdmin)
router.post('/', authorize('admin', 'superadmin'), validate(departmentSchemas.createDepartment), async (req, res) => {
  try {
    const {
      name,
      nameAr,
      description,
      headOfDepartment,
      manager
    } = req.body;

    // Check if department already exists
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DEPARTMENT_EXISTS',
          message: 'Department with this name already exists'
        }
      });
    }

    // Validate head of department if provided
    if (headOfDepartment) {
      const headUser = await User.findById(headOfDepartment);
      if (!headUser || headUser.role !== 'head_of_department') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_HEAD_OF_DEPARTMENT',
            message: 'Invalid head of department. User must have head_of_department role.'
          }
        });
      }
    }

    // Validate manager if provided
    if (manager) {
      const managerUser = await User.findById(manager);
      if (!managerUser || managerUser.role !== 'manager') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MANAGER',
            message: 'Invalid manager. User must have manager role.'
          }
        });
      }
    }

    // Create department
    const department = new Department({
      name,
      nameAr,
      description,
      headOfDepartment,
      manager
    });

    await department.save();

    // Populate related data
    await department.populate([
      { path: 'headOfDepartment', select: 'fullName employeeNumber email' },
      { path: 'manager', select: 'fullName employeeNumber email' }
    ]);

    logger.info(`Department ${department.name} created by ${req.user.username}`);

    res.status(201).json({
      success: true,
      data: {
        department
      },
      message: 'Department created successfully'
    });
  } catch (error) {
    logger.error('Create department error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_DEPARTMENT_ERROR',
        message: 'Error creating department'
      }
    });
  }
});

// @desc    Update department (Admin/SuperAdmin only)
// @route   PUT /api/departments/:id
// @access  Private (Admin/SuperAdmin)
router.put('/:id', authorize('admin', 'superadmin'), validate(departmentSchemas.updateDepartment), async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DEPARTMENT_NOT_FOUND',
          message: 'Department not found'
        }
      });
    }

    // Check if name is being changed and if it conflicts
    if (req.body.name && req.body.name !== department.name) {
      const existingDepartment = await Department.findOne({ name: req.body.name });
      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'DEPARTMENT_EXISTS',
            message: 'Department with this name already exists'
          }
        });
      }
    }

    // Validate head of department if provided
    if (req.body.headOfDepartment) {
      const headUser = await User.findById(req.body.headOfDepartment);
      if (!headUser || headUser.role !== 'head_of_department') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_HEAD_OF_DEPARTMENT',
            message: 'Invalid head of department. User must have head_of_department role.'
          }
        });
      }
    }

    // Validate manager if provided
    if (req.body.manager) {
      const managerUser = await User.findById(req.body.manager);
      if (!managerUser || managerUser.role !== 'manager') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MANAGER',
            message: 'Invalid manager. User must have manager role.'
          }
        });
      }
    }

    // Update department
    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'headOfDepartment', select: 'fullName employeeNumber email' },
      { path: 'manager', select: 'fullName employeeNumber email' },
      { path: 'parentDepartment', select: 'name nameAr' }
    ]);

    logger.info(`Department ${updatedDepartment.name} updated by ${req.user.username}`);

    res.json({
      success: true,
      data: {
        department: updatedDepartment
      },
      message: 'Department updated successfully'
    });
  } catch (error) {
    logger.error('Update department error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_DEPARTMENT_ERROR',
        message: 'Error updating department'
      }
    });
  }
});

// @desc    Deactivate department (Admin/SuperAdmin only)
// @route   DELETE /api/departments/:id
// @access  Private (Admin/SuperAdmin)
router.delete('/:id', authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DEPARTMENT_NOT_FOUND',
          message: 'Department not found'
        }
      });
    }

    // Check if department has active users
    const activeUsers = await User.countDocuments({
      department: department.name,
      isActive: true
    });

    if (activeUsers > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DEPARTMENT_HAS_USERS',
          message: `Cannot deactivate department. It has ${activeUsers} active users.`
        }
      });
    }

    // Deactivate department
    department.isActive = false;
    await department.save();

    logger.info(`Department ${department.name} deactivated by ${req.user.username}`);

    res.json({
      success: true,
      message: 'Department deactivated successfully'
    });
  } catch (error) {
    logger.error('Deactivate department error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DEACTIVATE_DEPARTMENT_ERROR',
        message: 'Error deactivating department'
      }
    });
  }
});

// @desc    Get department employees
// @route   GET /api/departments/:id/employees
// @access  Private
router.get('/:id/employees', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DEPARTMENT_NOT_FOUND',
          message: 'Department not found'
        }
      });
    }

    // Check access permissions for Head of Department
    if (req.user.role === 'head_of_department' && department.name !== req.user.department) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only access your own department'
        }
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get department employees
    const employees = await User.find({
      department: department.name,
      isActive: true
    })
      .select('-password')
      .populate('managerId', 'fullName employeeNumber')
      .sort({ fullName: 1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({
      department: department.name,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        employees,
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
    logger.error('Get department employees error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_DEPARTMENT_EMPLOYEES_ERROR',
        message: 'Error fetching department employees'
      }
    });
  }
});

// @desc    Get department requests (Head of Department only)
// @route   GET /api/departments/:id/requests
// @access  Private (Head of Department)
router.get('/:id/requests', authorize('head_of_department'), async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DEPARTMENT_NOT_FOUND',
          message: 'Department not found'
        }
      });
    }

    // Check if Head of Department can access this department
    if (department.name !== req.user.department) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only access your own department'
        }
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get department users
    const departmentUsers = await User.find({
      department: department.name,
      isActive: true
    }).select('_id');

    // Get leave requests for department users
    const LeaveRequest = require('../models/LeaveRequest');
    const leaveRequests = await LeaveRequest.find({
      userId: { $in: departmentUsers.map(u => u._id) }
    })
      .populate('userId', 'fullName employeeNumber department')
      .populate('leaveTypeId', 'name nameAr color')
      .populate('processedBy', 'fullName employeeNumber')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LeaveRequest.countDocuments({
      userId: { $in: departmentUsers.map(u => u._id) }
    });

    res.json({
      success: true,
      data: {
        leaveRequests,
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
    logger.error('Get department requests error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_DEPARTMENT_REQUESTS_ERROR',
        message: 'Error fetching department requests'
      }
    });
  }
});

// @desc    Get department reports (Head of Department only)
// @route   GET /api/departments/:id/reports
// @access  Private (Head of Department)
router.get('/:id/reports', authorize('head_of_department'), async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DEPARTMENT_NOT_FOUND',
          message: 'Department not found'
        }
      });
    }

    // Check if Head of Department can access this department
    if (department.name !== req.user.department) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only access your own department'
        }
      });
    }

    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Get department statistics
    const LeaveRequest = require('../models/LeaveRequest');
    const UserLeaveBalance = require('../models/UserLeaveBalance');

    // Get department users
    const departmentUsers = await User.find({
      department: department.name,
      isActive: true
    }).select('_id');

    // Get leave request statistics
    const requestStats = await LeaveRequest.getDepartmentStatistics(department.name, year);

    // Get leave balance statistics
    const balanceStats = await UserLeaveBalance.getDepartmentBalances(department.name, year);

    // Get employee count by role
    const employeeStats = await User.aggregate([
      {
        $match: {
          department: department.name,
          isActive: true
        }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        department: department.getSummary(),
        statistics: {
          requestStats,
          balanceStats,
          employeeStats,
          year
        }
      }
    });
  } catch (error) {
    logger.error('Get department reports error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_DEPARTMENT_REPORTS_ERROR',
        message: 'Error fetching department reports'
      }
    });
  }
});

// @desc    Get department hierarchy
// @route   GET /api/departments/hierarchy
// @access  Private (Admin/SuperAdmin)
router.get('/hierarchy', authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const hierarchy = await Department.getHierarchyTree();

    res.json({
      success: true,
      data: {
        hierarchy
      }
    });
  } catch (error) {
    logger.error('Get department hierarchy error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_DEPARTMENT_HIERARCHY_ERROR',
        message: 'Error fetching department hierarchy'
      }
    });
  }
});

// @desc    Get department statistics
// @route   GET /api/departments/statistics
// @access  Private (Admin/SuperAdmin)
router.get('/statistics', authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const statistics = await Department.getStatistics();

    res.json({
      success: true,
      data: {
        statistics: statistics[0] || {}
      }
    });
  } catch (error) {
    logger.error('Get department statistics error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_DEPARTMENT_STATISTICS_ERROR',
        message: 'Error fetching department statistics'
      }
    });
  }
});

module.exports = router;
