// @ts-check
import express from 'express';
import protect from '../validators/validateJWT.js';
import validateCreateComment from '../validators/validateCreateComment.js';
import validateEditComment from '../validators/validateEditComment.js';
import validate from '../middlewares/validate.js';
import {
    getProductCommentsById,
    createComment,
    getUserComments,
    editComment,
    deleteComment,
} from '../controllers/commentController.js';

/**@type {express.Router}*/
const commentRouter = express.Router();

commentRouter.route('/:id/comments').get(getProductCommentsById);
commentRouter.route('/:id').get(getUserComments);
commentRouter.use(protect);
commentRouter
    .route('/comment')
    .post(validateCreateComment, validate, createComment);

commentRouter
    .route('/comment/:commentId')
    .patch(validateEditComment, validate, editComment)
    .delete(deleteComment);

export default commentRouter;
