// @ts-check
import {
    createUser,
    getUserByUsername,
    getUserById,
    login,
    logout,
    getBalance,
    me,
    getAllUsers,
    getAllUsersCount,
    changeUserInfo,
    changePassword,
    changeImageURL,
} from '../controllers/userController.js';

import express from 'express';
import protect from '../validators/validateJWT.js';
import validateCreateUser from '../validators/validateCreateUser.js';
import validateLogin from '../validators/validateLogin.js';
import validateForgot from '../validators/validateForgot.js';
import validatePasswordReset from '../validators/validatePasswordReset.js';
import validateChangePassword from '../validators/validateChangePassword.js';
import validateChangeUserInfo from '../validators/validateChangeUserInfo.js';
import validate from '../middlewares/validate.js';

/**@type {express.Router}*/
const userRouter = express.Router();

userRouter
    .route('/')
    .post(validateCreateUser, validate, createUser)
    .get(getAllUsers);
userRouter.route('/count').get(getAllUsersCount);
userRouter.route('/id/:id').get(getUserById);
userRouter.route('/login').post(validateLogin, validate, login);
userRouter.route('/logout').post(logout);
userRouter.route('/:username').get(getUserByUsername);
userRouter.use(protect);
userRouter.route('/balance').get(getBalance);
userRouter.route('/u/me').get(me);
userRouter
    .route('/password/:id')
    .patch(validateChangePassword, validate, changePassword);
userRouter
    .route('/update/:id')
    .patch(validateChangeUserInfo, validate, changeUserInfo);
userRouter.route('/avatar/:id').get(changeImageURL);
userRouter.route('/:username').get(getUserByUsername);
export default userRouter;
