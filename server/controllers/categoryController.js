import { Category, Subcategory } from '../models/categorySyncModel.js';
import AppError from '../utilities/AppError.js';
import Product from '../models/productModel.js';
import Rating from '../models/ratingModel.js';
import { Op } from 'sequelize';

export const getAllCategoriesWithSubcategories = async (req, res, next) => {
    try {
        const categories = await Category.findAll({
            include: [
                {
                    model: Subcategory,
                    as: 'subcategories',
                },
            ],
        });

        res.status(200).json({
            status: 'success',
            results: categories.length,
            data: {
                categories,
            },
        });
    } catch (error) {
        next(new AppError(`Error fetching categories: ${error.message}`, 500));
    }
};

export const getCategoryWithSubcategories = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(id, {
            include: [
                {
                    model: Subcategory,
                    as: 'subcategories',
                },
            ],
        });

        if (!category) {
            return next(new AppError(`No category found with id: ${id}`, 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                category,
            },
        });
    } catch (error) {
        next(new AppError(`Error fetching category: ${error.message}`, 500));
    }
};

export const getProductsBySubcategory = async (req, res) => {
    try {
        const subcategoryId = req.params.subcategoryId;
        const limit = req.query.limit || 8;
        const offset = req.query.offset || 0;

        if (!subcategoryId || isNaN(subcategoryId)) {
            return res
                .status(400)
                .json({ message: 'Invalid or missing subcategory ID' });
        }

        const { count, rows: products } = await Product.findAndCountAll({
            where: {
                subcategory_id: subcategoryId,
            },
            include: {
                model: Subcategory,
                as: 'subcategory',
            },
            offset: offset,
            limit: limit,
        });

        if (!products || products.length === 0) {
            return res
                .status(404)
                .json({ message: 'No products found for this subcategory' });
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
                avgRating: avgRating.toFixed(2),
                ratingCount,
            };
        });

        res.status(200).json({
            status: 'success',
            results: processedProducts.length,
            totalProducts: count,
            data: {
                products: processedProducts,
            },
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
};
export const getFilteredProductsByCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { minPrice, maxPrice, minDate, maxDate, sort, order } = req.query;
        let { page = 1, limit = 8 } = req.query;

        page = Math.max(Number(page), 1);
        limit = Math.max(Number(limit), 1);
        const offset = (page - 1) * limit;

        if (!id || isNaN(id)) {
            return res.status(400).json({ message: 'Invalid category ID' });
        }

        const allProducts = await Product.findAll({
            where: { category_id: id },
        });

        const category = await Category.findOne({ where: { id } });

        const ratings = await Rating.findAll({
            where: {
                product_id: { [Op.in]: allProducts.map((p) => p.id) },
            },
        });

        const productsWithRatings = allProducts.map((product) => {
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
                ratingCount,
                avgRating,
            };
        });

        let filtered = [...productsWithRatings];

        if (
            (minPrice !== undefined && minPrice !== 'null') ||
            (maxPrice !== undefined && maxPrice !== 'null')
        ) {
            filtered = filtered.filter((p) => {
                const price = parseFloat(p.price);
                return (
                    (!minPrice || price >= minPrice) &&
                    (!maxPrice || price <= maxPrice)
                );
            });
        }

        if (
            (minDate !== undefined && minDate !== 'null') ||
            (maxDate !== undefined && maxDate !== 'null')
        ) {
            filtered = filtered.filter((p) => {
                const date = new Date(p.createdAt);
                return (
                    (!minDate || date >= new Date(minDate)) &&
                    (!maxDate || date <= new Date(maxDate))
                );
            });
        }

        if (sort) {
            filtered.sort((a, b) => {
                const [field, direction] = [sort, order === 'desc' ? -1 : 1];
                if (a[field] < b[field]) return -1 * direction;
                if (a[field] > b[field]) return 1 * direction;
                return 0;
            });
        }

        const total = filtered.length;
        const paginated = filtered.slice(offset, offset + limit);

        return res.status(200).json({
            categoryName: category?.name || null,
            products: paginated,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalProducts: total,
            },
        });
    } catch (err) {
        console.error('Failed to fetch paginated products by category:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
