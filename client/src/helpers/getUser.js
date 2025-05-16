import axios from 'axios';
import url from './getURL.js';

const getUserById = async (userId) => {
    const response = await axios
        .get(url(`users/id/${userId}`))
        .catch((error) => {
            console.log(error);
        });
    return response;
};

const getAllUsers = async () => {
    const response = await axios.get(url('users')).catch((error) => {
        console.log(error);
    });
    return response;
};
const getUserByUsername = async (username) => {
    const response = await axios
        .get(url(`users/${username}`))
        .catch((error) => {
            console.log(error);
        });
    return response;
};

export { getUserById, getAllUsers, getUserByUsername };
