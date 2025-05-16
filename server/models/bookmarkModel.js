import { DataTypes, Model } from 'sequelize';
import sq from '../database/sequelize.js';
import User from './userModel.js';
import Product from './productModel.js';
import AppError from '../utilities/AppError.js';

/**@type {import("sequelize").ModelStatic<Model<any, any>>}*/
const Bookmark = sq.define(
    'Bookmark',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { 
            type: DataTypes.INTEGER, 
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            }
        },
        product_id: { 
            type: DataTypes.INTEGER, 
            allowNull: false,
            references: {
                model: Product,
                key: 'id'
            }
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    },
    {
        tableName: 'bookmarks',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'product_id']
            }
        ]
    }
);

User.hasMany(Bookmark, { foreignKey: 'user_id' });
Bookmark.belongsTo(User, { foreignKey: 'user_id' });

Product.hasMany(Bookmark, { foreignKey: 'product_id' });
Bookmark.belongsTo(Product, { foreignKey: 'product_id' });

try {
    /**@type {object}*/
    const syncOptions = {
        /**@type {boolean}*/
        truncate: true,
        /**@type {boolean}*/
        force: true,
    };
    await Bookmark.sync(syncOptions);
    console.log('\x1b[35mBookmark\x1b[34m table created\x1b[0m');
} catch (error) {
    throw new AppError(`Error while creating Bookmark model: ${error}`, 500);
}

export default Bookmark;