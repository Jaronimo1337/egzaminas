// @ts-check
import express from 'express';
import {
    getImage,
    getImages,
    getCommentImages,
} from '../controllers/imageController.js';

/**@type {express.Router}*/
const imageRouter = express.Router();

imageRouter.route('/d/:dir').get(getImages);
imageRouter.route('/c/:dirName').get(getCommentImages);
imageRouter.route('/:dir/:file').get(getImage);

export default imageRouter;
