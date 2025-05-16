import axios from 'axios';
import url from './getURL.js';

const getFileTypes = async () => {
    const response = await axios.get(url('upload'), { withCredentials: true });
    return response.data.data;
};

export default getFileTypes;
