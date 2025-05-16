import { body, param } from 'express-validator';
import Product from '../models/productModel.js';

const validateEditComment = [
    param('commentId')
        .trim()
        .notEmpty()
        .withMessage('CommentId is a required parameter')
        .isNumeric()
        .withMessage('Comment Id must be a number'),

    body('product_id')
        .trim()
        .optional()
        .isNumeric()
        .withMessage('Product Id must be a number')
        .custom(async (product_id) => {
            const product = await Product.findByPk(product_id);
            if (product) {
                throw new AppError('Product not found', 404);
            }
        }),

    body('comment')
        .trim()
        .optional()
        .isString()
        .withMessage('Comment must be a string')
        .isLength({ min: 1, max: 255 })
        .withMessage('Comment must be between 1 and 255 characters')
        .escape() // Apsaugo nuo XSS, paverčia HTML simbolius į saugius
        .matches(/^[A-Za-z0-9ąčęėįšųūž\s.,!?()-]*$/)
        .withMessage(
            'Only letters, numbers, Lithuanian letters, and certain characters (.,!?()- and spaces) are allowed in the comment)'
        ),

    body('stars')
        .trim()
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Stars must be a number between 1 and 5'),
];

export default validateEditComment;
