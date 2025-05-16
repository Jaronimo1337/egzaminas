import User from '../models/userModel.js';
import { body } from 'express-validator';
import AppError from '../utilities/AppError.js';

const validateCreateUser = [
    body('username')
        .notEmpty()
        .withMessage('Username field is required')
        .isString()
        .withMessage('Username must be a string')
        .isLength({ min: 4, max: 32 })
        .withMessage('Username must be between 4 and 32 characters')
        .matches(/^[A-Za-z0-9]*$/)
        .withMessage('Username must only contain letters or numbers')
        .matches(/^[A-Za-z].*$/)
        .withMessage('Username must start with a letter')
        .custom(async (username) => {
            const user = await User.findOne({ where: { username: username } });
            if (user) {
                throw new AppError('Username already exists', 403);
            }
        }),

    body('password')
        .notEmpty()
        .withMessage('Password field is required')
        .isString()
        .withMessage('Password must be a string')
        .matches(/^[a-z\d]{64}$/)
        .withMessage('Password hash must be a valid hash')
        .isLength({ min: 64, max: 64 })
        .withMessage('Password hash must be 64 characters long'),

    body('email')
        .isEmail()
        .withMessage('Email must be a valid email address')
        .isLength({ min: 8, max: 32 })
        .withMessage('Email must be between 8 and 32 characters')
        .custom(async (email) => {
            const user = await User.findOne({ where: { email: email } });
            if (user) {
                throw new AppError('Email already exists', 403);
            }
        })
        .withMessage('Email already exists'),
];

export default validateCreateUser;
