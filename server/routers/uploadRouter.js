// @ts-check
import express from 'express';
import {
    checkFileTypes,
    upload,
    uploadResult,
    getDirectory,
} from '../controllers/uploadController.js';
import protect from '../validators/validateJWT.js';
import validateGetDirectory from '../validators/validateGetDirectory.js';
import validate from '../middlewares/validate.js';

/**@type {express.Router}*/
const uploadRouter = express.Router();

uploadRouter.route('/').get(checkFileTypes);
uploadRouter.use(protect);
uploadRouter.route('/dir').post(validateGetDirectory, validate, getDirectory);
uploadRouter.route('/avatar').post(upload.single('avatar'), uploadResult);
uploadRouter.route('/images').post(upload.array('images'), uploadResult);
export default uploadRouter;
