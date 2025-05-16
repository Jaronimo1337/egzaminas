import axios from 'axios';
import url from './getURL.js';
import sha1 from 'js-sha1';
import sha256 from 'js-sha256';

const createUser = async (user) => {
    let response;
    await axios
        .post(url('users'), { ...user, password: sha256(sha1(user.password)) })
        .then((res) => {
            response = res;
        })
        .catch((error) => {
            response = error.response;
        });
    return response;
};

export default createUser;
