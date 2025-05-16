import axios from 'axios';
import url from './getURL.js';

const getFilteredProducts = async ({
    page = 1,
    limit = 8,
    minPrice,
    maxPrice,
    minDate,
    maxDate,
    sort = 'timestamp', // Updated to match the controller's expected field
    order = 'DESC',
} = {}) => {
    try {
        console.log(`Fetching products with params:`, {
            page, limit, minPrice, maxPrice, minDate, maxDate, sort, order
        });
        
        const response = await axios.get(url('products'), {
            params: {
                page,
                limit,
                minPrice,
                maxPrice,
                minDate,
                maxDate,
                sort,
                order,
            },
        });
        
        console.log('API response status:', response.status);
        
        // Log only a preview of the data to avoid console clutter
        if (response.data && response.data.products) {
            console.log('Products count:', response.data.products.length);
            console.log('First product sample:', response.data.products[0]);
            console.log('Pagination:', response.data.pagination);
        } else {
            console.log('Unexpected response format:', response.data);
        }
        
        return response.data;
    } catch (error) {
        // Log detailed error information
        console.error('Error fetching filtered products:');
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            
            // For no products responses
            if (error.response.status === 500 && 
                error.response.data && 
                error.response.data.message === 'Internal server error') {
                
                return {
                    products: [],
                    pagination: {
                        currentPage: page,
                        totalPages: 0,
                        totalProducts: 0
                    }
                };
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
        
        throw new Error(
            error.response?.data?.message || 'Error fetching products'
        );
    }
};

export default getFilteredProducts;