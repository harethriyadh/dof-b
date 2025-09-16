const LeaveType = require('../models/LeaveType');

// Get all leave types
const getAllLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find().sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      message: 'Leave types retrieved successfully',
      data: leaveTypes,
    });
  } catch (error) {
    console.error('Get leave types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leave types',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get leave type by ID
const getLeaveTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const leaveType = await LeaveType.findOne({ leave_type_id: id });
    
    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: 'Leave type not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Leave type retrieved successfully',
      data: leaveType,
    });
  } catch (error) {
    console.error('Get leave type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leave type',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Create new leave type
const createLeaveType = async (req, res) => {
  try {
    const {
      name,
      description,
      payment_status,
      duration_rules,
      frequency,
      balance_rules,
      required_balance_id,
      requires_proof
    } = req.body;
    
    const leaveType = new LeaveType({
      name,
      description,
      payment_status,
      duration_rules: duration_rules || [],
      frequency,
      balance_rules: balance_rules || { is_accumulative: false, expires: false },
      required_balance_id,
      requires_proof: requires_proof || false,
    });
    
    await leaveType.save();
    
    res.status(201).json({
      success: true,
      message: 'Leave type created successfully',
      data: leaveType,
    });
  } catch (error) {
    console.error('Create leave type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create leave type',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Update leave type
const updateLeaveType = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const leaveType = await LeaveType.findOneAndUpdate(
      { leave_type_id: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: 'Leave type not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Leave type updated successfully',
      data: leaveType,
    });
  } catch (error) {
    console.error('Update leave type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update leave type',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Delete leave type
const deleteLeaveType = async (req, res) => {
  try {
    const { id } = req.params;
    const leaveType = await LeaveType.findOneAndDelete({ leave_type_id: id });
    
    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: 'Leave type not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Leave type deleted successfully',
    });
  } catch (error) {
    console.error('Delete leave type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete leave type',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = {
  getAllLeaveTypes,
  getLeaveTypeById,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
};
