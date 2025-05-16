import images from '../utilities/getImages.js';
import Product from '../models/productModel.js';
import AppError from '../utilities/AppError.js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
const HOST = process.env.HOST;
const PORT = process.env.PORT;

const getImage = (req, res, next) => {
    try {
        const { dir, file } = req.params;
        res.status(200).sendFile(`${images()}/${dir}/${file}`);
    } catch (error) {
        next(error);
    }
};

const getImages = async (req, res, next) => {
    try {
        const { dir } = req.params;
        const productId = Number(dir.split('product').join(''));
        const foundProduct = await Product.findByPk(productId);
        if (!foundProduct) {
            throw new AppError('Product not found', 404);
        } else {
            let files = fs.readdirSync(`./public/images/${dir}`);
            if (files)
                files = files.map(
                    (file) => `http://${HOST}:${PORT}/images/${dir}/${file}`
                );
            res.status(200).json({
                status: 'success',
                data: files,
            });
        }
    } catch (error) {
        next(error);
    }
};

const getCommentImages = (req, res, next) => {
    try {
        const { dirName } = req.params;
        console.log('Gautas dirName:', dirName);
        const dirPath = `${images()}/${dirName}`;
        console.log('Kelias:', dirPath);
        const exists = fs.existsSync(dirPath);
        console.log('Ar aplankas egzistuoja:', exists);
        if (!exists) {
            return res
                .status(404)
                .json({ status: 'fail', message: 'Katalogas nerastas' });
        }
        const files = fs.readdirSync(dirPath);
        console.log('Failai:', files);
        const fileUrls = files.map(
            (file) => `http://${HOST}:${PORT}/images/${dirName}/${file}`
        );
        console.log('Failų URL:', fileUrls);
        return res.status(200).json({ status: 'success', data: fileUrls });
    } catch (error) {
        console.error('Klaida getImages:', error);
        return res
            .status(500)
            .json({ status: 'error', message: error.message });
    }
};

export { getImage, getImages, getCommentImages };
