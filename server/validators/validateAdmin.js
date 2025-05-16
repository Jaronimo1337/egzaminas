import AppError from '../utilities/AppError.js';

const admin = (req, res, next) => {
    const { role } = res.locals;
    if (role === 'admin') {
        next();
    } else {
        console.log(
            '\x1b[33m - Unauthorized:\x1b[31m user must have admin privileges\x1b[0m'
        );
        const error = new AppError(
            'Unauthorized: user must have admin privileges',
            403
        );
        next(error);
    }
};

export default admin;
