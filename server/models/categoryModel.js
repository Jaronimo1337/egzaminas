// @ts-check
import { DataTypes, Model } from 'sequelize';
import sq from '../database/sequelize.js';

/**@type {import("sequelize").ModelStatic<Model<any, any>>}*/
const Category = sq.define(
    'Category',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },
    {
        timestamps: false,
        tableName: 'categories',
    }
);

export default Category;
