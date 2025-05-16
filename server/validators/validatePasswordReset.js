import { body } from 'express-validator';

const validatePasswordReset = [
    body('password')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Password hash is a required field')
        .isString()
        .withMessage('Password hash must be a string')
        .matches(/^[a-z\d]{64}$/)
        .withMessage('Password hash must be a valid hash')
        .isLength({ min: 64, max: 64 })
        .withMessage('Password hash must be 64 characters long'),

    body('salt')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Salt is a required field')
        .isString()
        .withMessage('Salt must be a string')
        .matches(/^[a-z\d]{64}$/)
        .withMessage('Salt must be a valid hash')
        .isLength({ min: 64, max: 64 })
        .withMessage('Salt must be 64 characters long'),
];

export default validatePasswordReset;
