import axios from 'axios';
import url from './getURL.js';

const getProductCommentsById = async (id) => {
    const response = await axios
        .get(url(`comments/${id}/comments`))
        .catch((error) => {
            console.log(error);
        });
    return response;
};

export { getProductCommentsById };
