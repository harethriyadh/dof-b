const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errorDetails
        }
      });
    }

    next();
  };
};

// Validation schemas
const authSchemas = {
  login: Joi.object({
    username: Joi.string().required().messages({
      'string.empty': 'Username is required',
      'any.required': 'Username is required'
    }),
    password: Joi.string().required().min(5).messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 5 characters long',
      'any.required': 'Password is required'
    })
  }),

  register: Joi.object({
    fullName: Joi.string().required().min(2).max(100).messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 100 characters',
      'any.required': 'Full name is required'
    }),
    username: Joi.string().required().min(3).max(50).alphanum().messages({
      'string.empty': 'Username is required',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 50 characters',
      'string.alphanum': 'Username must contain only alphanumeric characters',
      'any.required': 'Username is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().min(6).messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    employeeNumber: Joi.string().required().messages({
      'string.empty': 'Employee number is required',
      'any.required': 'Employee number is required'
    }),
    department: Joi.string().required().messages({
      'string.empty': 'Department is required',
      'any.required': 'Department is required'
    }),
    phone: Joi.string().optional().pattern(/^\+?[\d\s\-\(\)]+$/).messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
    role: Joi.string().valid('employee', 'head_of_department', 'manager', 'admin', 'superadmin').default('employee').messages({
      'any.only': 'Role must be one of: employee, head_of_department, manager, admin, superadmin'
    })
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      'string.empty': 'Refresh token is required',
      'any.required': 'Refresh token is required'
    })
  })
};

const userSchemas = {
  updateProfile: Joi.object({
    fullName: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 100 characters'
    }),
    email: Joi.string().email().optional().messages({
      'string.email': 'Please provide a valid email address'
    }),
    phone: Joi.string().optional().pattern(/^\+?[\d\s\-\(\)]+$/).messages({
      'string.pattern.base': 'Please provide a valid phone number'
    })
  }),

  updateUser: Joi.object({
    fullName: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 100 characters'
    }),
    email: Joi.string().email().optional().messages({
      'string.email': 'Please provide a valid email address'
    }),
    department: Joi.string().optional().messages({
      'string.empty': 'Department cannot be empty'
    }),
    phone: Joi.string().optional().pattern(/^\+?[\d\s\-\(\)]+$/).messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
    role: Joi.string().valid('employee', 'head_of_department', 'manager', 'admin', 'superadmin').optional().messages({
      'any.only': 'Role must be one of: employee, head_of_department, manager, admin, superadmin'
    }),
    managerId: Joi.string().optional().messages({
      'string.empty': 'Manager ID cannot be empty'
    }),
    isActive: Joi.boolean().optional()
  }),

  updateLeaveBalance: Joi.object({
    annualLeaveDays: Joi.number().min(0).max(365).optional().messages({
      'number.min': 'Annual leave days cannot be negative',
      'number.max': 'Annual leave days cannot exceed 365'
    }),
    sickLeaveDays: Joi.number().min(0).max(365).optional().messages({
      'number.min': 'Sick leave days cannot be negative',
      'number.max': 'Sick leave days cannot exceed 365'
    }),
    emergencyLeaveDays: Joi.number().min(0).max(365).optional().messages({
      'number.min': 'Emergency leave days cannot be negative',
      'number.max': 'Emergency leave days cannot exceed 365'
    })
  })
};

const leaveRequestSchemas = {
  // Full-day leave request schema
  createFullDayRequest: Joi.object({
    startDate: Joi.date().iso().required().min('now').messages({
      'date.base': 'Start date must be a valid date',
      'date.min': 'Start date cannot be in the past',
      'any.required': 'Start date is required'
    }),
    endDate: Joi.date().iso().required().min(Joi.ref('startDate')).messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be after start date',
      'any.required': 'End date is required'
    }),
    leaveType: Joi.string().valid('annual', 'sick', 'emergency', 'unpaid').required().messages({
      'string.empty': 'Leave type is required',
      'any.only': 'Leave type must be one of: annual, sick, emergency, unpaid',
      'any.required': 'Leave type is required'
    }),
    description: Joi.string().optional().max(500).messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
    requestType: Joi.string().valid('full-day').required().messages({
      'any.only': 'Request type must be full-day',
      'any.required': 'Request type is required'
    })
  }),

  // Part-time leave request schema
  createPartTimeRequest: Joi.object({
    date: Joi.date().iso().required().min('now').messages({
      'date.base': 'Date must be a valid date',
      'date.min': 'Date cannot be in the past',
      'any.required': 'Date is required'
    }),
    startTime: Joi.string().required().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).messages({
      'string.empty': 'Start time is required',
      'string.pattern.base': 'Start time must be in HH:MM format (24-hour)',
      'any.required': 'Start time is required'
    }),
    endTime: Joi.string().required().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).messages({
      'string.empty': 'End time is required',
      'string.pattern.base': 'End time must be in HH:MM format (24-hour)',
      'any.required': 'End time is required'
    }),
    reason: Joi.string().optional().max(500).messages({
      'string.max': 'Reason cannot exceed 500 characters'
    }),
    requestType: Joi.string().valid('part-time').required().messages({
      'any.only': 'Request type must be part-time',
      'any.required': 'Request type is required'
    })
  }),

  // Legacy schema for backward compatibility
  createRequest: Joi.object({
    leaveTypeId: Joi.string().required().messages({
      'string.empty': 'Leave type is required',
      'any.required': 'Leave type is required'
    }),
    startDate: Joi.date().iso().required().min('now').messages({
      'date.base': 'Start date must be a valid date',
      'date.min': 'Start date cannot be in the past',
      'any.required': 'Start date is required'
    }),
    endDate: Joi.date().iso().required().min(Joi.ref('startDate')).messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be after start date',
      'any.required': 'End date is required'
    }),
    startTime: Joi.string().optional().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).messages({
      'string.pattern.base': 'Start time must be in HH:MM format'
    }),
    endTime: Joi.string().optional().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).messages({
      'string.pattern.base': 'End time must be in HH:MM format'
    }),
    reason: Joi.string().required().min(10).max(500).messages({
      'string.empty': 'Reason is required',
      'string.min': 'Reason must be at least 10 characters long',
      'string.max': 'Reason cannot exceed 500 characters',
      'any.required': 'Reason is required'
    }),
    description: Joi.string().optional().max(1000).messages({
      'string.max': 'Description cannot exceed 1000 characters'
    })
  }),

  updateRequest: Joi.object({
    startDate: Joi.date().iso().optional().min('now').messages({
      'date.base': 'Start date must be a valid date',
      'date.min': 'Start date cannot be in the past'
    }),
    endDate: Joi.date().iso().optional().min(Joi.ref('startDate')).messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be after start date'
    }),
    startTime: Joi.string().optional().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).messages({
      'string.pattern.base': 'Start time must be in HH:MM format'
    }),
    endTime: Joi.string().optional().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).messages({
      'string.pattern.base': 'End time must be in HH:MM format'
    }),
    reason: Joi.string().optional().min(10).max(500).messages({
      'string.min': 'Reason must be at least 10 characters long',
      'string.max': 'Reason cannot exceed 500 characters'
    }),
    description: Joi.string().optional().max(1000).messages({
      'string.max': 'Description cannot exceed 1000 characters'
    })
  }),

  approveRequest: Joi.object({
    comments: Joi.string().optional().max(200).messages({
      'string.max': 'Comments cannot exceed 200 characters'
    })
  }),

  rejectRequest: Joi.object({
    rejectionReason: Joi.string().required().min(10).max(200).messages({
      'string.empty': 'Rejection reason is required',
      'string.min': 'Rejection reason must be at least 10 characters long',
      'string.max': 'Rejection reason cannot exceed 200 characters',
      'any.required': 'Rejection reason is required'
    }),
    comments: Joi.string().optional().max(200).messages({
      'string.max': 'Comments cannot exceed 200 characters'
    })
  })
};

const departmentSchemas = {
  createDepartment: Joi.object({
    name: Joi.string().required().min(2).max(100).messages({
      'string.empty': 'Department name is required',
      'string.min': 'Department name must be at least 2 characters long',
      'string.max': 'Department name cannot exceed 100 characters',
      'any.required': 'Department name is required'
    }),
    nameAr: Joi.string().required().min(2).max(100).messages({
      'string.empty': 'Department name in Arabic is required',
      'string.min': 'Department name in Arabic must be at least 2 characters long',
      'string.max': 'Department name in Arabic cannot exceed 100 characters',
      'any.required': 'Department name in Arabic is required'
    }),
    description: Joi.string().optional().max(500).messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
    headOfDepartment: Joi.string().optional().messages({
      'string.empty': 'Head of department ID cannot be empty'
    }),
    manager: Joi.string().optional().messages({
      'string.empty': 'Manager ID cannot be empty'
    })
  }),

  updateDepartment: Joi.object({
    name: Joi.string().optional().min(2).max(100).messages({
      'string.min': 'Department name must be at least 2 characters long',
      'string.max': 'Department name cannot exceed 100 characters'
    }),
    nameAr: Joi.string().optional().min(2).max(100).messages({
      'string.min': 'Department name in Arabic must be at least 2 characters long',
      'string.max': 'Department name in Arabic cannot exceed 100 characters'
    }),
    description: Joi.string().optional().max(500).messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
    headOfDepartment: Joi.string().optional().messages({
      'string.empty': 'Head of department ID cannot be empty'
    }),
    manager: Joi.string().optional().messages({
      'string.empty': 'Manager ID cannot be empty'
    }),
    isActive: Joi.boolean().optional()
  })
};

const holidaySchemas = {
  createHoliday: Joi.object({
    name: Joi.string().required().min(2).max(100).messages({
      'string.empty': 'Holiday name is required',
      'string.min': 'Holiday name must be at least 2 characters long',
      'string.max': 'Holiday name cannot exceed 100 characters',
      'any.required': 'Holiday name is required'
    }),
    nameAr: Joi.string().required().min(2).max(100).messages({
      'string.empty': 'Holiday name in Arabic is required',
      'string.min': 'Holiday name in Arabic must be at least 2 characters long',
      'string.max': 'Holiday name in Arabic cannot exceed 100 characters',
      'any.required': 'Holiday name in Arabic is required'
    }),
    description: Joi.string().optional().max(500).messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
    startDate: Joi.date().iso().required().messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required'
    }),
    endDate: Joi.date().iso().required().min(Joi.ref('startDate')).messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be after start date',
      'any.required': 'End date is required'
    }),
    isRecurring: Joi.boolean().default(false),
    year: Joi.number().integer().min(2020).max(2030).optional().messages({
      'number.integer': 'Year must be an integer',
      'number.min': 'Year must be at least 2020',
      'number.max': 'Year cannot exceed 2030'
    })
  }),

  updateHoliday: Joi.object({
    name: Joi.string().optional().min(2).max(100).messages({
      'string.min': 'Holiday name must be at least 2 characters long',
      'string.max': 'Holiday name cannot exceed 100 characters'
    }),
    nameAr: Joi.string().optional().min(2).max(100).messages({
      'string.min': 'Holiday name in Arabic must be at least 2 characters long',
      'string.max': 'Holiday name in Arabic cannot exceed 100 characters'
    }),
    description: Joi.string().optional().max(500).messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
    startDate: Joi.date().iso().optional().messages({
      'date.base': 'Start date must be a valid date'
    }),
    endDate: Joi.date().iso().optional().min(Joi.ref('startDate')).messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be after start date'
    }),
    isRecurring: Joi.boolean().optional(),
    year: Joi.number().integer().min(2020).max(2030).optional().messages({
      'number.integer': 'Year must be an integer',
      'number.min': 'Year must be at least 2020',
      'number.max': 'Year cannot exceed 2030'
    })
  })
};

const reportSchemas = {
  exportReport: Joi.object({
    reportType: Joi.string().valid('leave_summary', 'approval_times', 'leave_types', 'team_workload').required().messages({
      'any.only': 'Report type must be one of: leave_summary, approval_times, leave_types, team_workload',
      'any.required': 'Report type is required'
    }),
    format: Joi.string().valid('pdf', 'excel').required().messages({
      'any.only': 'Format must be either pdf or excel',
      'any.required': 'Format is required'
    }),
    filters: Joi.object({
      startDate: Joi.date().iso().optional().messages({
        'date.base': 'Start date must be a valid date'
      }),
      endDate: Joi.date().iso().optional().min(Joi.ref('startDate')).messages({
        'date.base': 'End date must be a valid date',
        'date.min': 'End date must be after start date'
      }),
      department: Joi.string().optional(),
      userId: Joi.string().optional()
    }).optional()
  })
};

const helpSchemas = {
  contactSupport: Joi.object({
    subject: Joi.string().required().min(5).max(100).messages({
      'string.empty': 'Subject is required',
      'string.min': 'Subject must be at least 5 characters long',
      'string.max': 'Subject cannot exceed 100 characters',
      'any.required': 'Subject is required'
    }),
    message: Joi.string().required().min(10).max(1000).messages({
      'string.empty': 'Message is required',
      'string.min': 'Message must be at least 10 characters long',
      'string.max': 'Message cannot exceed 1000 characters',
      'any.required': 'Message is required'
    }),
    category: Joi.string().valid('technical', 'billing', 'general').default('general').messages({
      'any.only': 'Category must be one of: technical, billing, general'
    })
  })
};

module.exports = {
  validate,
  authSchemas,
  userSchemas,
  leaveRequestSchemas,
  departmentSchemas,
  holidaySchemas,
  reportSchemas,
  helpSchemas
};
