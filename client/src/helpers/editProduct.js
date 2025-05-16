import axios from 'axios';
import url from './getURL.js';

const editProduct = async (id, data) => {
    if (!data.category_id) data.category_id = undefined;
    if (!data.subcategory_id) data.subcategory_id = undefined;
    const response = await axios.patch(url(`products/user/p/${id}`), data, {
        withCredentials: true,
    });
    return response;
};

export default editProduct;
