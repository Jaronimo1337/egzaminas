import { body } from 'express-validator';
import User from '../models/userModel.js';
import AppError from '../utilities/AppError.js';

const validateForgot = [
    body('email')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Email is a required field')
        .isEmail()
        .withMessage('Email must be a valid email')
        .isLength({ min: 8, max: 32 })
        .withMessage('Email must be between 8 and 32 characters')
        .custom(async (email) => {
            const user = await User.findOne({ where: { email: email } });
            if (!user) {
                throw new AppError('User not found', 404);
            }
        }),
];

export default validateForgot;
