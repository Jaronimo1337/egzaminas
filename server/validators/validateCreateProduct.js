import { body } from 'express-validator';

const validateCreateProduct = [
    body('category_id')
        .trim()
        .notEmpty()
        .withMessage('Category Id is a required field')
        .isNumeric()
        .withMessage('Category Id must be a number'),

    body('subcategory_id')
        .trim()
        .notEmpty()
        .withMessage('Subcategory Id is a required field')
        .isNumeric()
        .withMessage('Subcategory Id must be a number'),

    body('name')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Name is a required field')
        .isString()
        .withMessage('Name must be a string'),

    body('price')
        .trim()
        .notEmpty()
        .withMessage('Price is a required field')
        .isNumeric()
        .withMessage('Price must be a number'),

    body('description')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Description is a required field')
        .isString()
        .withMessage('Description must be a string'),

    body('amount_in_stock')
        .trim()
        .notEmpty()
        .withMessage('Amount in stock is a required field')
        .isNumeric()
        .withMessage('Amount in stock must be a number'),
];

export default validateCreateProduct;
