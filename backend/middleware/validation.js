const { body, query, validationResult } = require('express-validator');

// Middleware to check validation results
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return res.status(400).json({
      error: 'Validation failed',
      errors: extractedErrors,
      message: extractedErrors[0]?.message || 'Invalid input data',
    });
  }
  return next();
}

// Validation rules
const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const changePasswordRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((val, { req }) => {
      if (val !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }
      return true;
    }),
];

const sportRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Sport name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Sport name must be between 2 and 100 characters'),
  body('description')
    .optional({ nullable: true })
    .trim(),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean true or false'),
];

const sessionCreateRules = [
  body('sportId')
    .notEmpty()
    .withMessage('Sport ID is required')
    .isUUID()
    .withMessage('Invalid sport ID format'),
  body('scheduledAt')
    .notEmpty()
    .withMessage('Date and time are required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const scheduledDate = new Date(value);
      if (isNaN(scheduledDate.getTime())) {
        throw new Error('Invalid date');
      }
      if (scheduledDate <= new Date()) {
        throw new Error('Session date and time must be in the future');
      }
      return true;
    }),
  body('venue')
    .trim()
    .notEmpty()
    .withMessage('Venue is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Venue must be between 2 and 255 characters'),
  body('additionalPlayersRequired')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Additional players required must be a non-negative integer'),
  body('team')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Team name must not exceed 50 characters'),
];

const sessionCancelRules = [
  body('cancellationReason')
    .trim()
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Cancellation reason must be between 3 and 500 characters'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  changePasswordRules,
  sportRules,
  sessionCreateRules,
  sessionCancelRules,
};
