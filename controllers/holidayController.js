const OfficialHoliday = require('../models/OfficialHoliday');
const { isHoliday, isFixedWeeklyHoliday, isOfficialHoliday } = require('../utils/holidays');

// Get all holidays
const getAllHolidays = async (req, res) => {
  try {
    const holidays = await OfficialHoliday.find().sort({ start_date: 1 });
    
    res.status(200).json({
      success: true,
      message: 'Holidays retrieved successfully',
      data: holidays,
    });
  } catch (error) {
    console.error('Get holidays error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve holidays',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get holiday by ID
const getHolidayById = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await OfficialHoliday.findOne({ holiday_id: id });
    
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Holiday retrieved successfully',
      data: holiday,
    });
  } catch (error) {
    console.error('Get holiday error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve holiday',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Create new holiday
const createHoliday = async (req, res) => {
  try {
    const { name, start_date, end_date, image_urls, message } = req.body;
    
    const holiday = new OfficialHoliday({
      name,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      image_urls: image_urls || [],
      message,
    });
    
    await holiday.save();
    
    res.status(201).json({
      success: true,
      message: 'Holiday created successfully',
      data: holiday,
    });
  } catch (error) {
    console.error('Create holiday error:', error);
    
    if (error.message === 'End date must be after start date') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create holiday',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Update holiday
const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Convert date strings to Date objects if provided
    if (updateData.start_date) updateData.start_date = new Date(updateData.start_date);
    if (updateData.end_date) updateData.end_date = new Date(updateData.end_date);
    
    const holiday = await OfficialHoliday.findOneAndUpdate(
      { holiday_id: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Holiday updated successfully',
      data: holiday,
    });
  } catch (error) {
    console.error('Update holiday error:', error);
    
    if (error.message === 'End date must be after start date') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update holiday',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Delete holiday
const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await OfficialHoliday.findOneAndDelete({ holiday_id: id });
    
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Holiday deleted successfully',
    });
  } catch (error) {
    console.error('Delete holiday error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete holiday',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = {
  getAllHolidays,
  getHolidayById,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  // New exports added below
  checkHoliday: async (req, res) => {
    try {
      const { date } = req.query;
      if (!date) {
        return res.status(400).json({ success: false, message: 'Missing date query parameter (YYYY-MM-DD)' });
      }
      const parsed = new Date(date);
      if (Number.isNaN(parsed.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' });
      }
      const [fixed, official] = [isFixedWeeklyHoliday(parsed), await isOfficialHoliday(parsed)];
      const holiday = fixed || official;
      res.status(200).json({
        success: true,
        message: 'Holiday check completed',
        data: {
          date: parsed.toISOString(),
          isHoliday: holiday,
          reasons: {
            fixedWeeklyThuFri: fixed,
            officialRange: official,
          },
        },
      });
    } catch (error) {
      console.error('Check holiday error:', error);
      res.status(500).json({ success: false, message: 'Failed to check holiday' });
    }
  },
};
