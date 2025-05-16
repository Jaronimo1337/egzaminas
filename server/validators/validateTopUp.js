import { body } from 'express-validator';
import User from '../models/userModel.js';
import AppError from '../utilities/AppError.js';

const validateTopUp = [
    body('userId')
        .trim()
        .notEmpty()
        .withMessage('User Id is a required field')
        .custom(async (id) => {
            const user = await User.findByPk(id);
            if (!user) {
                throw new AppError("User doesn't exist", 404);
            }
        }),

    body('amount').trim().notEmpty().withMessage('Amount is a required field'),
];

export default validateTopUp;
