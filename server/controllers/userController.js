import User from '../models/userModel.js';
import Secret from '../models/userSecretModel.js';
import jsonwebtoken from 'jsonwebtoken';
import AppError from '../utilities/AppError.js';
import sha1 from 'js-sha1';
import sha256 from 'js-sha256';
import dotenv from 'dotenv';
dotenv.config();
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const ADMIN_HASH = sha256(sha1(sha256(sha1(ADMIN_PASS)) + 'salt'));
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_BALANCE = +process.env.ADMIN_BALANCE;
const CLIENT_HOST = process.env.CLIENT_HOST;
const CLIENT_PORT = process.env.CLIENT_PORT;

const createAdmin = async () => {
    try {
        const admin = await User.create({
            username: ADMIN_USER,
            email: ADMIN_EMAIL,
        });
        console.log(
            `\x1b[34mUser \x1b[31m"${ADMIN_USER}"\x1b[34m created successfully\x1b[0m`
        );
        await Secret.create({
            userId: admin.id,
            password: `${ADMIN_HASH}:${'salt'}`,
            role: 'admin',
            balance: ADMIN_BALANCE,
        });
        console.log(
            `\x1b[34mUser \x1b[31m"${ADMIN_USER}"\x1b[34m secret created successfully\x1b[0m`
        );
    } catch (error) {
        throw new AppError(
            `\x1b[31mError creating admin account:\x1b[0m\n${error}`,
            500
        );
    }
};

const createUser = async (req, res) => {
    const { username, password, email } = req.body;
    const role = 'user';
    const now = new Date();
    const salt = sha256(sha1(now.toString() + username));
    const hashedPassword = sha256(sha1(password + salt));
    const user = await User.create({ username: username, email: email });
    await Secret.create({
        userId: user.id,
        password: `${hashedPassword}:${salt}`,
        role: role,
    });

    res.status(201).json({
        status: 'success',
        data: user,
    });
};

const getUserByUsername = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ where: { username: username } });
        if (user === undefined)
            throw new AppError(`User "${username}" not found`, 404);
        res.status(200).json({
            status: 'success',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (user === undefined)
            throw new AppError(`User with id ${id} not found`, 404);
        res.status(200).json({
            status: 'success',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username: username } });
        if (!user) throw new AppError('Invalid username or password', 401);
        const secret = await Secret.findOne({
            where: { userId: user.id },
        });
        if (secret.role === 'banned') {
            throw new AppError('This account is banned.', 403);
        }
        const salt = secret.password.split(':')[1];
        const hashedPassword = sha256(sha1(password + salt));
        if (hashedPassword !== secret.password.split(':')[0]) {
            throw new AppError('Invalid username or password', 401);
        }
        const token = jsonwebtoken.sign(
            { id: user.id, role: secret.role },
            process.env.JWT_SECRET,
            { expiresIn: '360s' }
        );
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
        });
        res.cookie('tokenJS', 1);
        res.status(200).json({
            status: 'success',
            data: {
                ...user.dataValues,
                role: secret.role,
            },
            token: token,
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.token) return res.sendStatus(203);
        const token = jsonwebtoken.decode(cookies.token);
        const foundUser = await User.findByPk(token.id);
        if (foundUser) {
            res.clearCookie('token', { httpOnly: true });
            res.clearCookie('tokenJS');
            return res.sendStatus(204);
        } else throw new AppError('User not found', 404);
    } catch (error) {
        next(error);
    }
};

const getBalance = async (_req, res, next) => {
    try {
        const { id } = res.locals;
        if (id) {
            const foundSecret = await Secret.findOne({ where: { userId: id } });
            if (foundSecret) {
                res.status(200).json({
                    status: 'success',
                    data: { balance: foundSecret.balance },
                });
            } else {
                res.status(404).json({
                    status: 'fail',
                    message: 'User not found',
                });
            }
        } else {
            res.status(401).json({
                status: 'fail',
                message: 'Invalid user id provided',
            });
        }
    } catch (error) {
        next(error);
    }
};

const me = async (_req, res, next) => {
    try {
        const { id } = res.locals;
        const user = await User.findByPk(id);
        const secret = await Secret.findOne({ where: { userId: id } });
        if (user && secret) {
            res.status(200).json({
                status: 'success',
                data: { ...user.dataValues, role: secret.role },
            });
        } else throw new AppError('User not found', 404);
    } catch (error) {
        next(error);
    }
};

const getAllUsers = async (_req, res, next) => {
    try {
        const users = await User.findAll();
        res.status(200).json({
            status: 'success',
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

const getAllUsersCount = async (_req, res) => {
    const userCount = await User.count();
    res.status(200).json({
        status: 'success',
        data: userCount,
    });
};

const changeUserInfo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { email, username, description, contacts } = req.body;
        const updatedUser = await User.findByPk(id);
        updatedUser.email = email || updatedUser.email;
        updatedUser.username = username || updatedUser.username;
        updatedUser.description = description || updatedUser.description;
        updatedUser.contacts = contacts || updatedUser.contacts;
        await updatedUser.save();
        res.status(200).json({
            status: 'success',
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;
        const foundUser = await User.findByPk(id);
        if (!foundUser) {
            return res.status(404).json({
                status: 'fail',
                message: 'Unknown user',
            });
        }
        const foundSecret = await Secret.findOne({ where: { userId: id } });
        if (!foundSecret) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            });
        }
        const hashedOldPassword = sha256(
            sha1(oldPassword + foundSecret.password.split(':')[1])
        );
        if (foundSecret.password.split(':')[0] === hashedOldPassword) {
            const now = new Date();
            const salt = sha256(sha1(now.toString() + foundUser.username));
            const hashedPassword = sha256(sha1(newPassword + salt));
            foundSecret.password = `${hashedPassword}:${salt}`;
            await foundSecret.save();
            res.status(203).json({
                status: 'success',
                message: 'Changed user password',
            });
        } else {
            res.status(403).json({
                status: 'fail',
                message: 'Incorrect old password',
            });
        }
    } catch (error) {
        next(error);
    }
};

const changeImageURL = async (req, res, next) => {
    try {
        const { id } = req.params;
        const foundUser = await User.findByPk(id);
        if (!foundUser) {
            return res.status(404).json({
                status: 'fail',
                message: 'Unknown user',
            });
        } else {
            const imageURL = req.cookies?.filepath;
            foundUser.image_url = imageURL;
            await foundUser.save();
            res.status(203).json({
                status: 'success',
                message: 'Image url changed',
            });
        }
    } catch (error) {
        next(error);
    }
};

export {
    createAdmin,
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
};
