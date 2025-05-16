import { body } from 'express-validator';

const validateUpdateUserRole = [
    body('role')
        .trim()
        .isString()
        .withMessage('Role must be a string')
        .notEmpty()
        .withMessage('Role must be provided')
        .matches(/^user$|^admin$|^courier$|^banned$/),
];

export default validateUpdateUserRole;
