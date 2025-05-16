import axios from 'axios';
import url from './getURL.js';

const sanitizeParam = (param) => {
    return param !== null && param !== undefined && param !== ''
        ? param
        : undefined;
};

const getCategoryProducts = async (
    categoryId,
    {
        page = 1,
        limit = 8,
        minPrice,
        maxPrice,
        minDate,
        maxDate,
        sort,
        order,
        categoryName,
    } = {}
) => {
    try {
        const params = {
            page,
            limit,
            minPrice: sanitizeParam(minPrice),
            maxPrice: sanitizeParam(maxPrice),
            minDate: sanitizeParam(minDate),
            maxDate: sanitizeParam(maxDate),
            sort: sanitizeParam(sort),
            order: sanitizeParam(order),
            categoryName: sanitizeParam(categoryName),
        };

        const response = await axios.get(url(`categories/${categoryId}`), {
            params,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching products for category:', error);
        throw new Error(
            `Error fetching products for category ${categoryId}: ${error.message}`
        );
    }
};

export default getCategoryProducts;
