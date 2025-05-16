import url from './getURL.js';
import axios from 'axios';

export const searchProducts = async (
    query,
    sort,
    order,
    page = 1,
    limit = 8
) => {
    try {
        const response = await axios.get(
            url(
                `products/search?q=${query}&order=${order}&sort=${sort}&page=${page}&limit=${limit}`
            )
        );
        return response;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const searchSuggestions = async (query) => {
    try {
        const response = await axios.get(url(`products/search?q=${query}`));
        return response.data;
    } catch (error) {
        console.error('API error:', error);
        return [];
    }
};
