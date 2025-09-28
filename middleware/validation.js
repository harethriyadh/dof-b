const { body, validationResult } = require('express-validator');

// Validation rules for user registration (new schema)
const validateRegistration = [
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('full_name must be between 2 and 100 characters'),

  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('username can only contain letters, numbers, and underscores'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('password must be at least 6 characters long'),

  body('phone')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('phone is required and must be between 1 and 20 characters'),

  body('college')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('college is required and must be between 1 and 100 characters'),

  body('administrative_position')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('administrative_position is required and must be between 1 and 100 characters'),

  body('degree')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('degree is required and must be between 1 and 100 characters'),

  body('gender')
    .isIn(['male', 'female'])
    .withMessage('gender must be either male or female'),

  body('department')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('department is required and must be between 1 and 100 characters'),

  body('role')
    .isIn(['employee', 'manager', 'admin'])
    .withMessage('role must be one of: employee, manager, admin'),

  body('leave_balances')
    .optional()
    .isArray()
    .withMessage('leave_balances must be an array'),

  body('leave_balances.*.leave_type_id')
    .optional()
    .isString()
    .withMessage('leave_type_id must be a string'),

  body('leave_balances.*.available_days')
    .optional()
    .isInt({ min: 0 })
    .withMessage('available_days must be a non-negative integer'),

  body('leave_balances.*.one_time_used')
    .optional()
    .isBoolean()
    .withMessage('one_time_used must be a boolean'),
];

// Validation rules for user login
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('username is required'),

  body('password')
    .notEmpty()
    .withMessage('password is required'),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  handleValidationErrors,
};
