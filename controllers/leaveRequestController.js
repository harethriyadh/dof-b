const LeaveRequest = require('../models/LeaveRequest');

// Get all leave requests
const getAllLeaveRequests = async (req, res) => {
  try {
    const { status, user_id, department } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (user_id) filter.user_id = user_id;
    if (department) filter.department = department;
    
    const leaveRequests = await LeaveRequest.find(filter).sort({ request_date: -1 });
    
    res.status(200).json({
      success: true,
      message: 'Leave requests retrieved successfully',
      data: leaveRequests,
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leave requests',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
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
      user_id
    } = req.body;
    
    const leaveRequest = new LeaveRequest({
      employee_name,
      department,
      leave_type,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      reason,
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
