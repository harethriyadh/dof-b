const express = require('express');
const { protect } = require('../middleware/auth');
const LeaveRequest = require('../models/LeaveRequest');
const UserLeaveBalance = require('../models/UserLeaveBalance');
const User = require('../models/User');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/v1/leaves/requests/{userId}
router.get('/requests/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is requesting their own data or has manager/admin role
    if (req.user._id.toString() !== userId && 
        !['Manager', 'Head of Department', 'Super Admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized to view this user\'s requests'
        }
      });
    }

    const leaveRequests = await LeaveRequest.find({ userId })
      .populate('userId', 'fullName username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        leaveRequests
      }
    });

  } catch (error) {
    logger.error('Get user leave requests error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_USER_REQUESTS_ERROR',
        message: 'Error fetching user leave requests'
      }
    });
  }
});

// GET /api/v1/leaves/pending
router.get('/pending', async (req, res) => {
  try {
    // Check if user has manager role
    if (!['Manager', 'Head of Department', 'Super Admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Only managers can view pending requests'
        }
      });
    }

    let query = { status: 'pending' };

    // If user is Head of Department, filter by their department
    if (req.user.role === 'Head of Department' && req.user.departmentId) {
      query.departmentId = req.user.departmentId;
    }

    const pendingRequests = await LeaveRequest.find(query)
      .populate('userId', 'fullName username departmentId')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        pendingRequests
      }
    });

  } catch (error) {
    logger.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_PENDING_REQUESTS_ERROR',
        message: 'Error fetching pending requests'
      }
    });
  }
});

// POST /api/v1/leaves/requests
router.post('/requests', async (req, res) => {
  try {
    const { 
      userId, 
      leaveTypeId, 
      daysCount, 
      startingDate, 
      endingDate, 
      description 
    } = req.body;

    // Check if user is creating their own request or has admin role
    if (req.user._id.toString() !== userId && 
        !['Super Admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized to create requests for other users'
        }
      });
    }

    // Get user to get departmentId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Check leave balance
    const balance = await UserLeaveBalance.findOne({ 
      userId, 
      leaveTypeId 
    });

    if (!balance || balance.balance < daysCount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_BALANCE',
          message: 'Insufficient leave balance'
        }
      });
    }

    // Create leave request
    const leaveRequest = new LeaveRequest({
      userId,
      leaveTypeId,
      daysCount,
      startingDate,
      endingDate,
      description,
      departmentId: user.departmentId,
      status: 'pending',
      isPaid: true // Default to paid, can be updated based on leave type rules
    });

    await leaveRequest.save();

    logger.info(`Leave request created: ${leaveRequest._id} by user: ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        leaveRequest
      },
      message: 'Leave request created successfully'
    });

  } catch (error) {
    logger.error('Create leave request error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_REQUEST_ERROR',
        message: 'Error creating leave request'
      }
    });
  }
});

// PUT /api/v1/leaves/requests/{requestId}/status
router.put('/requests/:requestId/status', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    // Check if user has manager role
    if (!['Manager', 'Head of Department', 'Super Admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Only managers can approve/reject requests'
        }
      });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Status must be either "approved" or "rejected"'
        }
      });
    }

    const leaveRequest = await LeaveRequest.findById(requestId);
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REQUEST_NOT_FOUND',
          message: 'Leave request not found'
        }
      });
    }

    // Check if user can manage this request
    if (req.user.role === 'Head of Department' && 
        leaveRequest.departmentId !== req.user.departmentId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized to manage requests from other departments'
        }
      });
    }

    // Update status
    leaveRequest.status = status;
    await leaveRequest.save();

    logger.info(`Leave request ${requestId} ${status} by user: ${req.user._id}`);

    res.json({
      success: true,
      data: {
        leaveRequest
      },
      message: `Leave request ${status} successfully`
    });

  } catch (error) {
    logger.error('Update request status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_STATUS_ERROR',
        message: 'Error updating request status'
      }
    });
  }
});

module.exports = router;

