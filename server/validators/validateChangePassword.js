import { body } from 'express-validator';

const validateChangePassword = [
    body('oldPassword')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Old password hash is a required field')
        .isString()
        .withMessage('Old password hash must be a string')
        .matches(/^[a-z\d]{64}$/)
        .withMessage('Old password hash must be a valid hash')
        .isLength({ min: 64, max: 64 })
        .withMessage('Old password hash must be 64 characters long'),

    body('newPassword')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('New password hash is a required field')
        .isString()
        .withMessage('New password must be a string')
        .matches(/^[a-z\d]{64}$/)
        .withMessage('New password hash must be a valid hash')
        .isLength({ min: 64, max: 64 })
        .withMessage('New password hash must be 64 characters long'),
];

export default validateChangePassword;
