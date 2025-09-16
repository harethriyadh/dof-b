const LeaveConsumptionRecord = require('../models/LeaveConsumptionRecord');

// Get all leave consumption records
const getAllLeaveConsumptionRecords = async (req, res) => {
  try {
    const { user_id, leave_type_id, leave_request_id } = req.query;
    let filter = {};
    
    if (user_id) filter.user_id = user_id;
    if (leave_type_id) filter.leave_type_id = leave_type_id;
    if (leave_request_id) filter.leave_request_id = leave_request_id;
    
    const records = await LeaveConsumptionRecord.find(filter).sort({ date_recorded: -1 });
    
    res.status(200).json({
      success: true,
      message: 'Leave consumption records retrieved successfully',
      data: records,
    });
  } catch (error) {
    console.error('Get leave consumption records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leave consumption records',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get leave consumption record by ID
const getLeaveConsumptionRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await LeaveConsumptionRecord.findOne({ record_id: id });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Leave consumption record not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Leave consumption record retrieved successfully',
      data: record,
    });
  } catch (error) {
    console.error('Get leave consumption record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leave consumption record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Create new leave consumption record
const createLeaveConsumptionRecord = async (req, res) => {
  try {
    const {
      user_id,
      leave_request_id,
      leave_type_id,
      days_consumed,
      date_recorded
    } = req.body;
    
    const record = new LeaveConsumptionRecord({
      user_id,
      leave_request_id,
      leave_type_id,
      days_consumed,
      date_recorded: date_recorded ? new Date(date_recorded) : new Date(),
    });
    
    await record.save();
    
    res.status(201).json({
      success: true,
      message: 'Leave consumption record created successfully',
      data: record,
    });
  } catch (error) {
    console.error('Create leave consumption record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create leave consumption record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Update leave consumption record
const updateLeaveConsumptionRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Convert date string to Date object if provided
    if (updateData.date_recorded) {
      updateData.date_recorded = new Date(updateData.date_recorded);
    }
    
    const record = await LeaveConsumptionRecord.findOneAndUpdate(
      { record_id: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Leave consumption record not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Leave consumption record updated successfully',
      data: record,
    });
  } catch (error) {
    console.error('Update leave consumption record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update leave consumption record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Delete leave consumption record
const deleteLeaveConsumptionRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await LeaveConsumptionRecord.findOneAndDelete({ record_id: id });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Leave consumption record not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Leave consumption record deleted successfully',
    });
  } catch (error) {
    console.error('Delete leave consumption record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete leave consumption record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = {
  getAllLeaveConsumptionRecords,
  getLeaveConsumptionRecordById,
  createLeaveConsumptionRecord,
  updateLeaveConsumptionRecord,
  deleteLeaveConsumptionRecord,
};
