import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Rating from '../models/ratingModel.js';
import Bookmark from '../models/bookmarkModel.js';
import AppError from '../utilities/AppError.js';
import { Op } from 'sequelize';
import {
    sortHelper,
    filterItemsByRange,
} from './paginatedProductController.js';

// Add these new bookmark controller functions

const createBookmark = async (req, res) => {
    try {
        const { id } = res.locals; // Current user ID from JWT
        const { productId } = req.params;

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if bookmark already exists
        const existingBookmark = await Bookmark.findOne({
            where: {
                user_id: id,
                product_id: productId
            }
        });

        if (existingBookmark) {
            return res.status(200).json({
                status: 'success',
                message: 'Product already bookmarked',
                data: existingBookmark
            });
        }

        // Create new bookmark
        const newBookmark = await Bookmark.create({
            user_id: id,
            product_id: productId,
            created_at: new Date()
        });

        res.status(201).json({
            status: 'success',
            message: 'Product bookmarked successfully',
            data: newBookmark
        });
    } catch (error) {
        console.error('Error creating bookmark:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteBookmark = async (req, res) => {
    try {
        const { id } = res.locals; // Current user ID from JWT
        const { productId } = req.params;

        const bookmark = await Bookmark.findOne({
            where: {
                user_id: id,
                product_id: productId
            }
        });

        if (!bookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        await bookmark.destroy();
        
        res.status(200).json({
            status: 'success',
            message: 'Bookmark removed successfully'
        });
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const checkBookmarkStatus = async (req, res) => {
    try {
        const { id } = res.locals; // Current user ID from JWT
        const { productId } = req.params;

        const bookmark = await Bookmark.findOne({
            where: {
                user_id: id,
                product_id: productId
            }
        });

        res.status(200).json({
            status: 'success',
            isBookmarked: !!bookmark
        });
    } catch (error) {
        console.error('Error checking bookmark status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getUserProductsByUserName = async (req, res) => {
    try {
        let { page = 1, limit = 8 } = req.query;
        page = Math.max(Number(page), 1);
        limit = Math.max(Number(limit), 1);
        const offset = (page - 1) * limit;
        const username = req.params.username;

        if (!username) {
            return res
                .status(400)
                .json({ message: 'Netinkamas vartotojo vardas' });
        }

        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ message: 'Vartotojas nerastas' });
        }

        const products = await Product.findAll({ where: { user_id: user.id } });

        if (products.length === 0) {
            return res.status(200).json({
                message: 'Produktų nerasta',
                data: [],
                avgUserRating: 0,
            });
        }

        const ratings = await Rating.findAll({
            where: {
                product_id: { [Op.in]: products.map((product) => product.id) },
            },
        });

        const userIds = [...new Set(ratings.map((rating) => rating.user_id))];

        const users = await User.findAll({
            where: { id: { [Op.in]: userIds } },
        });

        const userMap = {};
        users.forEach((user) => {
            userMap[user.id] = user;
        });

        // Calculate each product's average rating
        const productRatingsMap = {};
        ratings.forEach((rating) => {
            if (!productRatingsMap[rating.product_id]) {
                productRatingsMap[rating.product_id] = { stars: 0, count: 0 };
            }
            productRatingsMap[rating.product_id].stars += rating.stars;
            productRatingsMap[rating.product_id].count += 1;
        });

        let totalRatings = 0;
        let totalStars = 0;

        const processedProducts = products.map((product) => {
            const productRating = productRatingsMap[product.id];
            let avgRating = 0;
            let ratingCount = 0;

            if (productRating) {
                ratingCount = productRating.count;
                avgRating = productRating.stars / ratingCount;
                totalStars += avgRating;
                totalRatings += 1;
            }

            const productRatings = ratings.filter(
                (rating) => rating.product_id === product.id
            );
            const comments = productRatings
                .map((rating) => {
                    return {
                        username:
                            userMap[rating.user_id]?.username || 'Nežinomas',
                        comment: rating.comment,
                        stars: rating.stars,
                        timestamp: null,
                    };
                })
                .filter((comment) => comment.comment);

            const userData = userMap[product.user_id] || {};

            return {
                ...product.dataValues,
                ratingCount,
                avgRating,
                comments,
                userData,
            };
        });

        const avgUserRating =
            totalRatings > 0 ? +(totalStars / totalRatings).toFixed(2) : 0;
            const totalProducts = processedProducts.length;
            const totalPages = Math.ceil(totalProducts / limit);
            const paginatedProducts = processedProducts.slice(offset, offset + limit);
        return res.json({
            avgUserRating,
            totalRatings,
            data: paginatedProducts,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalProducts,
            },
        });
    } catch (err) {
        console.error('Klaida gaunant duomenis:', err);
        return res.status(500).json({ message: 'Klaida gaunant duomenis' });
    }
};

const getUserProducts = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        if (!userId) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const products = await Product.findAll({
            where: { user_id: userId },
        });

        if (products.length === 0) {
            return res
                .status(404)
                .json({ message: 'No products found for this user' });
        }

        return res.json({ data: products });
    } catch (error) {
        console.error('Error fetching user products:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getUserProductsSortedPaginated = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { sort, order } = req.query;
        let { page = 1, limit = 8 } = req.query;

        // Validuojame userId
        if (!userId) {
            return res
                .status(400)
                .json({ message: 'Neteisingas vartotojo ID' });
        }

        // Užtikriname, kad page ir limit yra teigiami skaičiai
        page = Math.max(Number(page), 1);
        limit = Math.max(Number(limit), 1);
        const offset = (page - 1) * limit;

        // Gauname vartotojo produktus
        const products = await Product.findAll({
            where: { user_id: userId },
        });

        if (products.length === 0) {
            return res
                .status(200)
                .json({ message: 'Šiam vartotojui produktų nerasta' });
        }

        // Gauname reitingus produktams
        const ratings = await Rating.findAll({
            where: {
                product_id: {
                    [Op.in]: products.map((product) => product.id),
                },
            },
        });

        // Pridedame laiko žymes ir reitingų informaciją
        const productsWithTimestamps = products.map((product) => {
            const productRatings = ratings.filter(
                (r) => r.product_id === product.id
            );
            const ratingCount = productRatings.length;
            const avgRating =
                ratingCount > 0
                    ? productRatings.reduce((sum, r) => sum + r.stars, 0) /
                      ratingCount
                    : 0;

            return {
                ...product.toJSON(),
                timestamp: null,
                ratingCount,
                avgRating,
            };
        });

        // Rūšiuojame produktus
        const sortedProducts = await sortHelper(
            productsWithTimestamps,
            sort,
            order
        );

        // Apskaičiuojame puslapiavimą
        const totalProducts = sortedProducts.length;
        const totalPages = Math.ceil(totalProducts / limit);
        const paginatedProducts = sortedProducts.slice(offset, offset + limit);

        // Grąžiname atsakymą
        res.json({
            products: paginatedProducts,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalProducts,
            },
        });
    } catch (error) {
        console.error('Klaida gaunant vartotojo produktus:', error);
        return res.status(500).json({ message: 'Serverio klaida' });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const { q, sort, order } = req.query;

        let { page = 1, limit = 8 } = req.query;
        page = Math.max(Number(page), 1);
        limit = Math.max(Number(limit), 1);
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (q) {
            whereClause.name = {
                [Op.iLike]: `%${q}%`,
            };
        }

        const count = await Product.count({
            where: whereClause,
        });

        const queryOptions = {
            where: whereClause,
            limit: Number(limit),
            offset: Number(offset),
        };

        if (sort && order) {
            if (sort === 'timestamp') {
                console.log(
                    'Timestamp sorting will be applied after fetching data'
                );
            } else {
                queryOptions.order = [[sort, order.toUpperCase()]];
            }
        }

        const products = await Product.findAll(queryOptions);

        if (products.length === 0 && page === 1) {
            return res.status(404).json({
                message: 'Nėra produktų',
                pagination: {
                    currentPage: Number(page),
                    totalPages: 0,
                    totalProducts: 0,
                    perPage: Number(limit),
                },
            });
        }

        const ratings = await Rating.findAll({
            where: {
                product_id: {
                    [Op.in]: products.map((product) => product.id),
                },
            },
        });

        const processedProducts = products.map((product) => {
            const productRatings = ratings.filter(
                (r) => r.product_id === product.id
            );
            const ratingCount = productRatings.length;
            const avgRating =
                ratingCount > 0
                    ? productRatings.reduce((sum, r) => sum + r.stars, 0) /
                      ratingCount
                    : 0;

            return {
                ...product.toJSON(),
                timestamp: null,
                avgRating: avgRating.toFixed(2),
                ratingCount,
            };
        });

        const sortedProducts = [...processedProducts];
        if (sort === 'timestamp' && order) {
            sortedProducts.sort((a, b) => {
                // Since we've removed timestamps, we'll sort by another field if timestamp was requested
                // For example, sort by id as a fallback
                return order.toLowerCase() === 'asc'
                    ? a.id - b.id
                    : b.id - a.id;
            });
        }

        return res.json({
            data: sortedProducts,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(count / limit),
                totalProducts: count,
                perPage: Number(limit),
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Klaida gaunant duomenis' });
    }
};

const getHotProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll();

        if (products.length === 0) {
            return res.status(200).json({
                message: 'Nerasta produktų',
                data: [],
            });
        }

        const ratings = await Rating.findAll({
            where: {
                product_id: { [Op.in]: products.map((product) => product.id) },
            },
        });

        const processedProducts = products.map((product) => {
            const productRatings = ratings.filter(
                (rating) => rating.product_id === product.id
            );
            const ratingCount = productRatings.length;
            const avgRating =
                ratingCount > 0
                    ? productRatings.reduce(
                          (sum, rating) => sum + rating.stars,
                          0
                      ) / ratingCount
                    : 0;

            return { ...product.dataValues, ratingCount, avgRating, createdAt: null };
        });

        const filteredProducts = processedProducts
            .filter(
                (product) => product.avgRating >= 4.5 && product.ratingCount > 0
            )
            .sort((a, b) => b.ratingCount - a.ratingCount)
            .slice(0, 4);

        if (filteredProducts.length === 0) {
            return res
                .status(200)
                .json({ message: 'Nerasta populiarių produktų', data: [] });
        }

        res.json({ status: 'success', data: filteredProducts });
    } catch (error) {
        next(error);
    }
};

const getTopRatedProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll();

        if (products.length === 0) {
            return res
                .status(200)
                .json({ message: 'No products found', data: [] });
        }

        const ratings = await Rating.findAll({
            where: {
                product_id: {
                    [Op.in]: products.map((product) => product.id),
                },
            },
        });

        const results = products.map((product) => {
            const productRatings = ratings.filter(
                (rating) => rating.product_id === product.id
            );
            const ratingCount = productRatings.length;
            const avgRating =
                ratingCount > 0
                    ? productRatings.reduce(
                          (sum, rating) => sum + rating.stars,
                          0
                      ) / ratingCount
                    : 0;

            return { ...product.dataValues, ratingCount, avgRating };
        });

        const filteredProducts = results
            .filter((result) => result.avgRating >= 4.5)
            .sort((a, b) => b.ratingCount - a.ratingCount)
            .slice(0, 4);

        if (filteredProducts.length === 0) {
            return res
                .status(200)
                .json({ message: 'No hot products found', data: [] });
        }

        res.json({
            status: 'success',
            data: filteredProducts,
        });
    } catch (error) {
        next(error);
    }
};

const getTopUserProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll();

        const ratings = await Rating.findAll({
            where: {
                product_id: {
                    [Op.in]: products.map((product) => product.id),
                },
            },
        });

        const userStats = {};

        products.forEach((product) => {
            if (!userStats[product.user_id]) {
                userStats[product.user_id] = {
                    products: [],
                    totalRatings: 0,
                    totalStars: 0,
                };
            }
            userStats[product.user_id].products.push(product);
        });

        const productRatingsMap = {};
        ratings.forEach((rating) => {
            if (!productRatingsMap[rating.product_id]) {
                productRatingsMap[rating.product_id] = { stars: 0, count: 0 };
            }
            productRatingsMap[rating.product_id].stars += rating.stars;
            productRatingsMap[rating.product_id].count += 1;
        });

        Object.keys(userStats).forEach((userId) => {
            userStats[userId].products.forEach((product) => {
                const productRating = productRatingsMap[product.id];
                if (productRating) {
                    const avgProductRating =
                        productRating.stars / productRating.count;
                    userStats[userId].totalStars += avgProductRating;
                    userStats[userId].totalRatings += 1;
                }
            });
        });

        let topUserId = null;
        let maxRatings = 0;
        let topUserRating = 0;

        Object.entries(userStats).forEach(([userId, stats]) => {
            const avgUserRating =
                stats.totalRatings > 0
                    ? stats.totalStars / stats.totalRatings
                    : 0;

            if (
                stats.products.length >= 4 &&
                avgUserRating >= 4.5 &&
                stats.totalRatings > maxRatings
            ) {
                maxRatings = stats.totalRatings;
                topUserId = userId;
                topUserRating = avgUserRating;
            }
        });

        if (!topUserId || topUserRating < 4.5) {
            return res
                .status(200)
                .json({ message: 'No suitable user found', data: [] });
        }

        const topUserProducts = userStats[topUserId].products
            .map((product) => {
                const productRating = productRatingsMap[product.id];
                if (productRating) {
                    const ratingCount = productRating.count;
                    const avgRating = productRating.stars / ratingCount;
                    return { ...product.dataValues, ratingCount, avgRating };
                }
                return null;
            })
            .filter((product) => product !== null)
            .sort((a, b) => b.avgRating - a.avgRating)
            .slice(0, 4);

        if (topUserProducts.length < 4) {
            return res
                .status(200)
                .json({ message: 'No suitable user found', data: [] });
        }

        res.json({
            status: 'success',
            user_id: topUserId,
            userRating: topUserRating.toFixed(2),
            totalRatings: maxRatings,
            data: topUserProducts,
        });
    } catch (error) {
        next(error);
    }
};

const getTrendingUserProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll();

        if (products.length === 0) {
            return res
                .status(200)
                .json({ message: 'Nerasta produktų', data: [] });
        }

        const ratings = await Rating.findAll({
            where: {
                product_id: { [Op.in]: products.map((product) => product.id) },
            },
        });

        const userStats = {};

        products.forEach((product) => {
            if (!userStats[product.user_id]) {
                userStats[product.user_id] = {
                    products: [],
                    totalRatings: 0,
                    totalStars: 0,
                    createdAt: null,
                };
            }
            userStats[product.user_id].products.push(product);
        });

        const productRatingsMap = {};
        ratings.forEach((rating) => {
            if (!productRatingsMap[rating.product_id]) {
                productRatingsMap[rating.product_id] = { stars: 0, count: 0 };
            }
            productRatingsMap[rating.product_id].stars += rating.stars;
            productRatingsMap[rating.product_id].count += 1;
        });

        Object.keys(userStats).forEach((userId) => {
            userStats[userId].products.forEach((product) => {
                const productRating = productRatingsMap[product.id];
                if (productRating) {
                    const avgProductRating =
                        productRating.stars / productRating.count;
                    userStats[userId].totalStars += avgProductRating;
                    userStats[userId].totalRatings += 1;
                }
            });
        });

        let trendingUserId = null;
        let highestAvgRating = 0;

        Object.entries(userStats).forEach(([userId, stats]) => {
            const avgUserRating =
                stats.totalRatings > 0
                    ? stats.totalStars / stats.totalRatings
                    : 0;

            if (stats.totalRatings >= 4 && avgUserRating >= 4) {
                if (avgUserRating > highestAvgRating) {
                    trendingUserId = userId;
                    highestAvgRating = avgUserRating;
                }
            }
        });

        if (!trendingUserId) {
            return res
                .status(200)
                .json({ message: 'Nerasta populiaraus vartotojo', data: [] });
        }

        const trendingUserProducts = userStats[trendingUserId].products
            .map((product) => {
                const productRating = productRatingsMap[product.id];
                if (productRating) {
                    const ratingCount = productRating.count;
                    const avgRating = productRating.stars / ratingCount;
                    return { ...product.dataValues, ratingCount, avgRating };
                }
                return null;
            })
            .filter((product) => product !== null)
            .sort((a, b) => b.avgRating - a.avgRating)
            .slice(0, 4);

        if (trendingUserProducts.length < 4) {
            return res.status(200).json({
                message: 'Nerasta tinkamo populiaraus vartotojo',
                data: [],
            });
        }

        res.json({
            status: 'success',
            user_id: trendingUserId,
            userRating: highestAvgRating.toFixed(2),
            userCreatedAt: null,
            data: trendingUserProducts,
        });
    } catch (error) {
        next(error);
    }
};

const getAllProductCount = async (req, res) => {
    const userCount = await Product.count();
    res.status(200).json({
        status: 'success',
        data: userCount,
    });
};

const getRatedProductsByUserName = async (req, res) => {
    try {
        const username = req.params.username;
        if (!username) {
            return res.status(400).json({
                message: 'Username is required',
            });
        }

        const user = await User.findOne({ where: { username: username } });
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        const userRatings = await Rating.findAll({
            where: { user_id: user.id },
        });

        if (userRatings.length === 0) {
            return res.status(200).json({
                message: 'No ratings found for the user',
                data: [],
            });
        }

        const productIds = [
            ...new Set(userRatings.map((rating) => rating.product_id)),
        ];

        const products = await Product.findAll({
            where: {
                id: { [Op.in]: productIds },
            },
        });

        const productMap = {};
        products.forEach((product) => {
            productMap[product.id] = product.dataValues;
        });

        const processedProducts = userRatings.map((rating) => {
            const product = productMap[rating.product_id];

            return {
                ...product,
                userRating: rating.stars,
                userComment: rating.comment,
                timestamp: null,
            };
        });

        return res.json({
            status: 'success',
            data: processedProducts,
        });
    } catch (error) {
        console.error('Error getting rated products:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    attributes: ['username', 'contacts'],
                },
                {
                    model: Rating,
                    attributes: ['stars'],
                },
            ],
        });
        if (product) {
            const ratings = product.Ratings;
            const ratingCount = ratings.length;
            const avgRating =
                ratingCount > 0
                    ? ratings.reduce((sum, rating) => sum + rating.stars, 0) /
                      ratingCount
                    : 0;

            res.json({
                ...product.dataValues,
                avgRating: avgRating.toFixed(2),
                ratingCount,
            });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error}` });
    }
};

const createProduct = async (req, res, next) => {
    try {
        const { id } = res.locals;
        const {
            category_id,
            subcategory_id,
            name,
            price,
            description,
            amount_in_stock,
        } = req.body;
        const newProduct = await Product.create({
            user_id: id,
            category_id,
            subcategory_id,
            name,
            price,
            description,
            amount_in_stock,
        });
        if (!newProduct) {
            throw new AppError('Internal server error', 500);
        } else {
            res.status(201).json({
                status: 'success',
                data: newProduct.dataValues,
            });
        }
    } catch (error) {
        next(error);
    }
};

const editProduct = async (req, res, next) => {
    try {
        const { id } = res.locals;
        const { productId } = req.params;
        const {
            category_id,
            subcategory_id,
            name,
            price,
            description,
            amount_in_stock,
            image_url,
        } = req.body;
        const foundProduct = await Product.findByPk(productId);
        if (!foundProduct) {
            throw new AppError('Product not found', 404);
        } else if (foundProduct.user_id !== id) {
            throw new AppError(
                "Forbidden to change other user's products",
                403
            );
        } else {
            foundProduct.category_id = category_id || foundProduct.category_id;
            foundProduct.subcategory_id =
                subcategory_id || foundProduct.subcategory_id;
            foundProduct.name = name || foundProduct.name;
            foundProduct.price = price || foundProduct.price;
            foundProduct.amount_in_stock =
                amount_in_stock || foundProduct.amount_in_stock;
            foundProduct.description = description || foundProduct.description;
            foundProduct.image_url = image_url || foundProduct.image_url;
            await foundProduct.save();
            res.status(200).json({
                status: 'success',
                message: 'Changed product successfully',
                data: foundProduct.dataValues,
            });
        }
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = res.locals;
        const { productId } = req.params;
        const foundProduct = await Product.findByPk(productId);
        if (!foundProduct) {
            throw new AppError('Product not found', 404);
        } else if (foundProduct.user_id !== id) {
            throw new AppError(
                "Forbidden to delete other user's products",
                403
            );
        } else {
            await foundProduct.destroy();
            res.status(203).send();
        }
    } catch (error) {
        next(error);
    }
};

const getSearchRegex = (req, res) => {
    const zalgoRegex = process.env.ZALGO_REGEX;
    res.json({ zalgoRegex });
};

export {
    getUserProductsSortedPaginated,
    getAllProductCount,
    getUserProductsByUserName,
    getAllProducts,
    getHotProducts,
    getTopRatedProducts,
    getTopUserProducts,
    getTrendingUserProducts,
    getRatedProductsByUserName,
    getUserProducts,
    createProduct,
    editProduct,
    deleteProduct,
    getSearchRegex,
    createBookmark,
    deleteBookmark,
    checkBookmarkStatus
};
