// @ts-check
import { validationResult, Result } from 'express-validator';
import express from 'express';
import AppError from '../utilities/AppError.js';
/**
 *
 * @param {express.Request} req
 * @param {express.Response} _res
 * @param {express.NextFunction} next
 */
const validate = (req, _res, next) => {
    try {
        /**@type {Result<import("express-validator").ValidationError>}*/
        const errors = validationResult(req);
        /**@type {string}*/
        const errorString = errors
            .array()
            .map((error) => error.msg)
            .join(';');
        if (!errors.isEmpty()) {
            throw new AppError(errorString, 400);
        }
        next();
    } catch (error) {
        next(error);
    }
};

export default validate;
