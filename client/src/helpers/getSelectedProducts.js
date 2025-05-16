import axios from 'axios';
import url from './getURL.js';

const getSelectedProduct = async (id) => {
    try {
        const response = await axios.get(url(`products/selected/${id}`));
        return response.data;
    } catch (error) {
        throw new Error(
            `Error fetching product with id ${id}: ${error.message}`
        );
    }
};

export default getSelectedProduct;
