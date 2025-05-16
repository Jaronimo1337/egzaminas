import axios from 'axios';
import url from './getURL.js';
import sha1 from 'js-sha1';
import sha256 from 'js-sha256';

const loginUser = async (user) => {
    let response;
    const { username, password } = user;
    const hashedPassword = sha256(sha1(password));
    await axios
        .post(
            url('users/login'),
            { username: username, password: hashedPassword },
            { withCredentials: true }
        )
        .then((res) => {
            response = res;
        })
        .catch((error) => {
            response = error.response;
        });
    return response.data.data;
};

export default loginUser;
