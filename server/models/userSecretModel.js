// @ts-check
import { DataTypes, Model } from 'sequelize';
import sq from '../database/sequelize.js';
import AppError from '../utilities/AppError.js';

/**@type {import("sequelize").ModelStatic<Model<any, any>>}*/
const Secret = sq.define(
    'Secret',
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        balance: {
            type: DataTypes.INTEGER,
        },
    },
    {
        timestamps: false,
        tableName: 'user_secrets',
    }
);

try {
    await Secret.sync({ alter: true, force: true });
    console.log('\x1b[35mSecret\x1b[34m table created\x1b[0m');
} catch (error) {
    throw new AppError(`Error while creating secret model: ${error}`, 500);
}

export default Secret;
