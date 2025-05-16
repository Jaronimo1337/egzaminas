import axios from 'axios';
import url from './getURL.js';

const getUserCommentsByUserId = async (userId) => {
    const response = await axios
        .get(url(`comments/${userId}`), {
            withCredentials: true,
        })
        .catch((error) => {
            console.log('Klaida gaunant komentarus:', error);
            throw error;
        });
    return response;
};

export default getUserCommentsByUserId;
