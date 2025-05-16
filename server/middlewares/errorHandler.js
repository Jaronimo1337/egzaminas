// @ts-check
import express from 'express';

const Err = {
    /**@type {number | undefined}*/
    statusCode: undefined,
    /**@type {string | undefined}*/
    status: undefined,
    /**@type {string | undefined}*/
    message: undefined,
};

/**
 * @param {Err} err
 * @param {express.Request} _req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const errorHandler = (err, _req, res, next) => {
    /**@type {number}*/
    const statusCode = err.statusCode || 500;
    console.log(statusCode);

    /**@type {string}*/
    const errStatus = err?.status || 'error';
    /**@type {string}*/
    const errMessage = err?.message || 'Internal Server Error';

    /**@type {object}*/
    const responseContents = {
        /**@type {string}*/
        status: errStatus,
        /**@type {string}*/
        message: errMessage,
    };
    res.status(statusCode).json(responseContents);
    next();
};

export default errorHandler;
