import jsonwebtoken from 'jsonwebtoken';
import User from '../models/userModel.js';
import Secret from '../models/userSecretModel.js';
import AppError from '../utilities/AppError.js';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.cookies?.token) {
            token = req.cookies.token;
        } else if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            throw new AppError('Unauthorized: no token found', 401);
        }

        jsonwebtoken.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) {
                return next(new AppError('Unauthorized: invalid token', 401));
            }

            const decodedUser = decoded;
            if (!decodedUser) {
                return next(new AppError('Unauthorized: invalid token', 401));
            }

            const foundUser = await User.findByPk(decodedUser.id);
            if (foundUser) {
                res.locals.id = foundUser.id;
                res.locals.role = decodedUser.role;
                req.user = {
                    id: foundUser.id,
                    role: decodedUser.role,
                };

                return next();
            } else {
                return next(new AppError('Unauthorized: user not found', 401));
            }
        });
    } catch (error) {
        next(error);
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        const userRole = res.locals.role;

        if (!userRole || !roles.includes(userRole)) {
            return next(
                new AppError(
                    'Forbidden: You do not have permission to perform this action',
                    403
                )
            );
        }

        next();
    };
};

export { protect, restrictTo };
export default protect;
