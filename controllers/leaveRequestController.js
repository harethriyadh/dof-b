const LeaveRequest = require('../models/LeaveRequest');

// Get all leave requests
const getAllLeaveRequests = async (req, res) => {
  try {
    const { status, user_id, department, spare_employee_id } = req.query;
    let filter = {};
    
    // Log the incoming request for debugging
    console.log('GET /api/leave-requests - Query params:', req.query);
    console.log('GET /api/leave-requests - User:', req.user ? req.user.user_id : 'No user');
    
    // Build filter object
    if (status) {
      // Validate status value
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value',
          error: 'Status must be one of: pending, approved, rejected',
          received: status,
          validValues: ['pending', 'approved', 'rejected']
        });
      }
      filter.status = status;
    }
    
    if (user_id) {
      filter.user_id = user_id;
    }
    
    if (department) {
      filter.department = department;
    }
    
    if (spare_employee_id) {
      filter.spare_employee_id = spare_employee_id;
    }
    
    console.log('GET /api/leave-requests - Filter:', filter);
    
    // Execute query with error handling
    const leaveRequests = await LeaveRequest.find(filter).sort({ request_date: -1 });
    
    console.log(`GET /api/leave-requests - Found ${leaveRequests.length} requests`);
    
    res.status(200).json({
      success: true,
      message: 'Leave requests retrieved successfully',
      data: leaveRequests,
      meta: {
        count: leaveRequests.length,
        filter: filter,
        query: req.query
      }
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    
    // Detailed error information
    const errorDetails = {
      success: false,
      message: 'Failed to retrieve leave requests',
      error: error.message,
      timestamp: new Date().toISOString(),
      query: req.query,
      user: req.user ? req.user.user_id : 'No user',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
    
    // Handle specific error types
    if (error.name === 'CastError') {
      errorDetails.message = 'Invalid query parameter format';
      errorDetails.details = {
        field: error.path,
        value: error.value,
        expectedType: error.kind
      };
      return res.status(400).json(errorDetails);
    }
    
    if (error.name === 'ValidationError') {
      errorDetails.message = 'Query validation failed';
      errorDetails.details = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      return res.status(400).json(errorDetails);
    }
    
    // Database connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      errorDetails.message = 'Database connection error';
      errorDetails.details = {
        type: error.name,
        message: 'Unable to connect to database'
      };
      return res.status(503).json(errorDetails);
    }
    
    // Default error response
    res.status(500).json(errorDetails);
  }
};

// Get leave request by ID
const getLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const leaveRequest = await LeaveRequest.findOne({ request_no: id });
    
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Leave request retrieved successfully',
      data: leaveRequest,
    });
  } catch (error) {
    console.error('Get leave request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leave request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Create new leave request
const createLeaveRequest = async (req, res) => {
  try {
    const {
      employee_name,
      department,
      leave_type,
      start_date,
      end_date,
      reason,
      spare_employee_id
    } = req.body;
    
    // Get user_id from authenticated user's JWT token
    const user_id = req.user.user_id;
    
    // Validate required fields
    if (!employee_name || !department || !leave_type || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['employee_name', 'department', 'leave_type', 'start_date', 'end_date']
      });
    }
    
    // Validate date format
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use ISO format (YYYY-MM-DD)',
        example: '2025-01-23'
      });
    }
    
    const leaveRequest = new LeaveRequest({
      employee_name,
      department,
      leave_type,
      start_date: startDate,
      end_date: endDate,
      reason: reason || '', // Make reason optional, default to empty string
      spare_employee_id: spare_employee_id ?? null,
      user_id,
    });
    
    await leaveRequest.save();
    
    res.status(201).json({
      success: true,
      message: 'Leave request created successfully',
      data: leaveRequest,
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    
    if (error.message === 'End date must be after start date') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create leave request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Update leave request
const updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Convert date strings to Date objects if provided
    if (updateData.start_date) updateData.start_date = new Date(updateData.start_date);
    if (updateData.end_date) updateData.end_date = new Date(updateData.end_date);
    
    // Handle optional reason field
    if (updateData.reason !== undefined) {
      updateData.reason = updateData.reason || '';
    }

    // Normalize optional spare_employee_id to allow null clearing
    if (Object.prototype.hasOwnProperty.call(updateData, 'spare_employee_id')) {
      updateData.spare_employee_id = updateData.spare_employee_id ?? null;
    }
    
    const leaveRequest = await LeaveRequest.findOneAndUpdate(
      { request_no: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Leave request updated successfully',
      data: leaveRequest,
    });
  } catch (error) {
    console.error('Update leave request error:', error);
    
    if (error.message === 'End date must be after start date') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update leave request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Process leave request (approve/reject)
const processLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, processed_by, reason_for_rejection } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected',
      });
    }
    
    const updateData = {
      status,
      processing_date: new Date(),
      processed_by,
    };
    
    if (status === 'rejected' && reason_for_rejection) {
      updateData.reason_for_rejection = reason_for_rejection;
    }
    
    const leaveRequest = await LeaveRequest.findOneAndUpdate(
      { request_no: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: leaveRequest,
    });
  } catch (error) {
    console.error('Process leave request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process leave request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Delete leave request
const deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const leaveRequest = await LeaveRequest.findOneAndDelete({ request_no: id });
    
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Leave request deleted successfully',
    });
  } catch (error) {
    console.error('Delete leave request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete leave request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = {
  getAllLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  updateLeaveRequest,
  processLeaveRequest,
  deleteLeaveRequest,
};
