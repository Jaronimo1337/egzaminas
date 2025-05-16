// @ts-check
import sq from './sequelize.js';
import AppError from '../utilities/AppError.js';
import fs from 'fs';
import { sha1 } from 'js-sha1';
import { sha256 } from 'js-sha256';
import User from '../models/userModel.js';
import UserSecret from '../models/userSecretModel.js';

/**@type {string}*/
const fileData = fs.readFileSync('./database/database.sql', 'utf8');

console.log('\x1b[32mPopulating tables...\x1b[0m');

/**@type {(arg0:{username: string, email: string, role: string, password: string}) => Promise<void>}*/
const createUser = async (userData) => {
    const { username, email, role, password } = userData;
    const hashedPassword = sha256(sha1(password));
    const now = new Date();
    const salt = sha256(sha1(now + username));
    const fullPassword = sha256(sha1(hashedPassword + salt));
    const newUser = await User.create({ username, email });
    await UserSecret.create({
        userId: newUser.dataValues.id,
        role: role,
        password: `${fullPassword}:${salt}`,
    });
};

/**@type {string}*/
const users = fs.readFileSync('./database/newusers.txt', 'utf8');

/**@type {Array<string>}*/
const usersArray = users.split(/\s/) || undefined;

/**@type {() => Promise<void>}*/
const populate = async () => {
    try {
        await sq.query(fileData);
        console.log('\x1b[32mPopulated tables successfully\x1b[0m');
    } catch (error) {
        throw new AppError(`Error while populating tables: ${error}`, 500);
    }
    try {
        if (usersArray[0])
            for (let i = 0; i < usersArray.length; i += 4) {
                if (usersArray[i] == '') i++;
                await createUser({
                    username: usersArray[i],
                    email: usersArray[i + 1],
                    role: usersArray[i + 2],
                    password: usersArray[i + 3],
                });
            }
        if (usersArray[0])
            console.log('\x1b[32mCreated additional users successfully\x1b[0m');
    } catch (error) {
        throw new AppError(`Error while creating users: ${error}`, 500);
    }
};

export default populate;
