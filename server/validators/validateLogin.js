import { body } from 'express-validator';
import User from '../models/userModel.js';
import AppError from '../utilities/AppError.js';

const validateLogin = [
    body('username')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Username is a required field')
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
            if (!user) {
                throw new AppError('User not found', 404);
            }
        }),

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
];

export default validateLogin;
