import axios from 'axios';
import url from './getURL.js';

const editComment = async (commentId, data) => {
    const response = await axios.patch(
        url(`comments/comment/${commentId}`),
        data,
        {
            withCredentials: true,
        }
    );
    return response;
};

export default editComment;
