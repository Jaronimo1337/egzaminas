import jsonwebtoken from 'jsonwebtoken';
import User from '../models/userModel.js';
import dotenv from 'dotenv';
import AppError from '../utilities/AppError.js';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const protect = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.token)
            throw new AppError('Unauthorized: no token found', 401);
        const token = cookies.token;
        let error;
        jsonwebtoken.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) {
                error = new AppError('Unauthorized: invalid token', 401);
                return;
            }
            const decodedUser = decoded;
            if (!decodedUser) {
                error = new AppError('Unauthorized: invalid token', 401);
                return;
            }
            const foundUser = await User.findByPk(decodedUser.id);
            if (foundUser) {
                res.locals.id = foundUser.id;
                res.locals.role = decodedUser.role;
                return next();
            } else {
                error = new AppError('Unauthorized: user not found', 401);
            }
        });
        if (error) throw error;
    } catch (error) {
        next(error);
    }
};

export default protect;
