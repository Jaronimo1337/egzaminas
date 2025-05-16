import axios from 'axios';
import url from './getURL';
const getProductsBySubcategory = async (subcategoryId, limit, page) => {
    const offset = (page - 1) * limit;
    const response = await axios.get(
        url(
            `categories/products/${subcategoryId}?limit=${limit}&offset=${offset}`
        )
    );
    return response.data;
};

export default getProductsBySubcategory;
