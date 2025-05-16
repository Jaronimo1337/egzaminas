// server/controllers/paginatedSearchController.js

import Product from '../models/productModel.js';
import Event from '../models/eventModel.js';
import Rating from '../models/ratingModel.js';
import { Op } from 'sequelize';
import {
    filterItemsByRange,
    sortHelper,
} from './paginatedProductController.js'; // reuse your helpers

export async function searchProductsPaginated(req, res) {
    try {
        const { q } = req.query;
        const {
            page = 1,
            limit = 8,
            minPrice,
            maxPrice,
            minDate,
            maxDate,
            sort,
            order,
        } = req.query;

        page = Math.max(Number(page), 1);
        limit = Math.max(Number(limit), 1);
        const offset = (page - 1) * limit;

        // 1) Load all products + related events + ratings
        const products = await Product.findAll();
        const events = await Event.findAll({
            where: { type_id: 1, target_id: 2 },
        });
        const ratings = await Rating.findAll({
            where: { product_id: { [Op.in]: products.map((p) => p.id) } },
        });

        // 2) Inject timestamp, avgRating, ratingCount
        const withExtras = products.map((product) => {
            const evts = events.filter(
                (e) =>
                    e.user_id === product.user_id && e.product_id === product.id
            );
            const latest = evts.length
                ? evts.sort(
                      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                  )[0]
                : null;

            const prodRatings = ratings.filter(
                (r) => r.product_id === product.id
            );
            const count = prodRatings.length;
            const avg = count
                ? prodRatings.reduce((sum, r) => sum + r.stars, 0) / count
                : 0;

            return {
                ...product.toJSON(),
                timestamp: latest?.timestamp || null,
                ratingCount: count,
                avgRating: avg,
            };
        });

        // 3) Text search filter
        let filtered = q
            ? withExtras.filter((p) =>
                  p.name.toLowerCase().includes(q.trim().toLowerCase())
              )
            : withExtras;

        // 4) Price/date filters
        if (minPrice != null || maxPrice != null) {
            filtered = await filterItemsByRange(
                minPrice,
                maxPrice,
                filtered,
                null,
                null,
                'price'
            );
        }
        if (minDate != null || maxDate != null) {
            filtered = await filterItemsByRange(
                minDate,
                maxDate,
                filtered,
                null,
                null,
                'date'
            );
        }

        // 5) Sort
        const sorted = await sortHelper(filtered, sort, order);

        // 6) Paginate
        const totalProducts = sorted.length;
        const totalPages = Math.ceil(totalProducts / limit);
        const pageItems = sorted.slice(offset, offset + limit);

        // 7) Response
        return res.json({
            products: pageItems,
            pagination: {
                currentPage: page,
                totalPages,
                totalProducts,
            },
        });
    } catch (err) {
        console.error('Error in searchProductsPaginated:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
