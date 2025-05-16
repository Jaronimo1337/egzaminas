// @ts-check
import sq from '../database/sequelize.js';
import { DataTypes, Model } from 'sequelize';
import AppError from '../utilities/AppError.js';

/**@type {import("sequelize").ModelStatic<Model<any, any>>}*/
const User = sq.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.STRING,
        },
        contacts: {
            type: DataTypes.STRING,
        },
        image_url: {
            type: DataTypes.STRING,
        },
    },
    {
        timestamps: false,
        tableName: 'users',
    }
);

try {
    await User.sync({ alter: true, force: true });
    console.log('\x1b[35mUser\x1b[34m table created\x1b[0m');
} catch (error) {
    throw new AppError(`Error while creating user model: ${error}`, 500);
}

export default User;
