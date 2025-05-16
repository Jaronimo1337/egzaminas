import axios from 'axios';
import url from './getURL';

export default async function loginMe() {
    try {
        const response = await axios.get(url('users/me'), {
            withCredentials: true 
        });

        return response;
    } catch (error) {
        console.error('Login check failed:', error);
        return { data: { status: 'fail', user: null } };
    }
}