import { body } from 'express-validator';

export const userValidationRules = [
  body('id')
    .notEmpty().withMessage('ID is required')
    .isString().withMessage('ID must be a string'),

  body('userName')
    .notEmpty().withMessage('UserName is required')
    .isString().withMessage('UserName must be a string'),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('first_name')
    .notEmpty().withMessage('First name is required')
    .isString().withMessage('First name must be a string'),

  body('last_name')
    .notEmpty().withMessage('Last name is required')
    .isString().withMessage('Last name must be a string'),

  body('profile_picture')
    .notEmpty().withMessage('Profile picture is required')
    .isURL().withMessage('Profile picture must be a valid URL'),

  body('phone_number')
    .notEmpty().withMessage('Phone number is required')
    .isNumeric().withMessage('Phone number must contain only numbers')
    .isLength({ min: 10, max: 10 }).withMessage('Phone number must be exactly 10 digits'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['user', 'admin', 'moderator']).withMessage('Role must be user, admin, or moderator'),

  body('date_joined')
    .optional()
    .isISO8601().withMessage('Date joined must be a valid date'),

  body('bio')
    .notEmpty().withMessage('Bio is required')
    .isString().withMessage('Bio must be a string'),

  body('address')
    .notEmpty().withMessage('Address is required')
    .isString().withMessage('Address must be a string'),

  body('social_links')
    .notEmpty().withMessage('Social links are required')
    .custom(value => {
      if (typeof value !== 'object' || value === null) {
        throw new Error('Social links must be an object');
      }
      for (const key in value) {
        if (typeof value[key] !== 'string') {
          throw new Error(`Social link ${key} must be a string`);
        }
      }
      return true;
    }),
];
