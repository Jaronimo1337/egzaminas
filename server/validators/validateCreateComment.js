import { body } from 'express-validator';

const validateCreateComment = [
    body('product_id')
        .notEmpty()
        .withMessage('Product ID is required')
        .isInt({ min: 1 })
        .withMessage('Product ID must be a positive integer'),

    body('comment')
        .notEmpty()
        .withMessage('comment field is required')
        .isString()
        .withMessage('comment must be a string')
        .isLength({ min: 1, max: 255 })
        .withMessage('Comment must be between 1 and 255 characters')
        .trim()
        .escape() // Apsaugo nuo XSS, paverčia HTML simbolius į saugius
        .matches(/^[A-Za-z0-9ąčęėįšųūž\s.,!?()-]*$/)
        .withMessage(
            'Only letters, numbers, Lithuanian letters, and certain characters (.,!?()- and spaces) are allowed in the comment)'
        ),

    body('stars')
        .notEmpty()
        .withMessage('Stars field is required')
        .isInt({ min: 1, max: 5 })
        .withMessage('Stars must be an integer between 1 and 5'),
];

export default validateCreateComment;
