// @ts-check
import { DataTypes, Model } from 'sequelize';
import sq from '../database/sequelize.js';

/**@type {import("sequelize").ModelStatic<Model<any, any>>}*/
const Subcategory = sq.define(
    'Subcategory',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'categories',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },
    {
        timestamps: false,
        tableName: 'subcategories',
    }
);

export default Subcategory;
