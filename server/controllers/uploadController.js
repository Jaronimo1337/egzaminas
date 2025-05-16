import multer from 'multer';
import dotenv from 'dotenv';
import AppError from '../utilities/AppError.js';
import fs from 'fs';
import images from '../utilities/getImages.js';
import User from '../models/userModel.js';
dotenv.config();

const checkFileTypes = (_req, res, next) => {
    try {
        const fileTypes = process.env.AVAILABLE_IMAGE_FILE_TYPES.split(', ');
        if (!fileTypes) {
            throw new AppError('Internal server error', 500);
        } else {
            res.status(200).json({
                status: 'success',
                data: fileTypes,
            });
        }
    } catch (error) {
        next(error);
    }
};

//uploader
const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        const { dirName } = req.cookies;
        cb(null, `public/images/${dirName || ''}`);
    },
    filename: async (req, file, cb) => {
        const suffixedName = Date.now() + '_' + file.originalname;
        const { dirName } = req.cookies;
        if (dirName) {
            const userId = dirName.split('user').join('');
            if (!isNaN(userId)) {
                const foundUser = await User.findByPk(Number(userId));
                if (foundUser) {
                    foundUser.image_url = `http://${process.env.HOST}:${process.env.PORT}/images/${dirName}/${suffixedName}`;
                    await foundUser.save();
                }
            }
        }

        cb(null, suffixedName);
    },
});
const upload = multer({
    storage: storage,
});
const uploadResult = (_req, res, next) => {
    try {
        res.status(200).json({
            status: 'success',
            message: 'File(-s) uploaded successfully',
        });
    } catch (error) {
        next(error);
    }
};

//directory setter
const getDirectory = (req, res, next) => {
    try {
        const { dirName } = req.body;
        if (!dirName) {
            res.status(423).json({
                status: 'fail',
                message: 'No directory name provided',
            });
            return;
        }
        res.cookie('dirName', dirName, { httpOnly: true, maxAge: 10000 });
        if (!fs.existsSync(`${images()}/${dirName}`)) {
            fs.mkdirSync(`${images()}/${dirName}`);
            return res.status(201).json({
                status: 'success',
                message: `Directory '${dirName}' created successfully`,
            });
        } else {
            return res.status(200).json({
                status: 'success',
                message: `Directory '${dirName}' saved`,
            });
        }
    } catch (error) {
        next(error);
    }
};
export { checkFileTypes, upload, uploadResult, getDirectory };
