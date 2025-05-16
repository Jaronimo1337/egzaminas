import axios from 'axios';
import url from './getURL.js';

const getSearchRegex = async () => {
    const response = await axios.get(url(`products/searchregex`));
    return response.data;
};
export default getSearchRegex;
