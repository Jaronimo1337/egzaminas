// @ts-check
import { DataTypes, Model } from 'sequelize';
import sq from '../database/sequelize.js';
import User from './userModel.js';
import Rating from './ratingModel.js';
import Subcategory from './subcategoryModel.js';
import AppError from '../utilities/AppError.js';

/**@type {import("sequelize").ModelStatic<Model<any, any>>}*/
const Product = sq.define(
    'Product',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        category_id: { type: DataTypes.INTEGER, allowNull: false },
        subcategory_id: { type: DataTypes.INTEGER, allowNull: false },
        name: { type: DataTypes.STRING(255), allowNull: false },
        price: { type: DataTypes.FLOAT, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: false },
        image_url: { type: DataTypes.TEXT, allowNull: true },
        amount_in_stock: { type: DataTypes.BIGINT, allowNull: false },
    },
    {
        tableName: 'products',
        timestamps: false,
    }
);

// Nustatome ryšį tarp User ir Product
User.hasMany(Product, { foreignKey: 'user_id' });
Product.belongsTo(User, { foreignKey: 'user_id' });
Product.hasMany(Rating, { foreignKey: 'product_id' });
Rating.belongsTo(Product, { foreignKey: 'product_id' });
Product.belongsTo(Subcategory, {
    foreignKey: 'subcategory_id',
    as: 'subcategory',
});
Subcategory.hasMany(Product, { foreignKey: 'subcategory_id', as: 'products' });

try {
    /**@type {object}*/
    const syncOptions = {
        /**@type {boolean}*/
        truncate: true,
        /**@type {boolean}*/
        force: true,
    };
    await Product.sync(syncOptions);
    console.log('\x1b[35mProduct\x1b[34m table created\x1b[0m');
} catch (error) {
    throw new AppError(`Error while creating Product model: ${error}`, 500);
}
export default Product;
