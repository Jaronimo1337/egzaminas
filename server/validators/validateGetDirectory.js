import { body } from 'express-validator';

const validateGetDirectory = [
    body('dirName')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('dirName is a required field')
        .isString()
        .withMessage('dirName must be a string'),
];

export default validateGetDirectory;
