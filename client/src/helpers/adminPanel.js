import axios from 'axios';
import url from './getURL';
import { sha1 } from 'js-sha1';
import { sha256 } from 'js-sha256';

const API = axios.create({
    withCredentials: true,
});

export const getAllUsers = async () => {
    const res = await API.get(url('admin/users'));
    return res.data.data;
};

export const createUser = async (userData) => {
    const hashedPassword = sha256(sha1(userData.password));
    userData.password = undefined;
    const res = await API.post(url('admin/users'), {
        ...userData,
        password: hashedPassword,
    });
    return res.data;
};

export const deleteUser = async (id) => {
    return await API.delete(url(`admin/users/${id}`));
};

export const banUser = async (id) => {
    await API.post(url(`admin/users/ban/${id}`));
};

export const updateUser = async (id, data) => {
    const res = await API.patch(url(`admin/users/${id}`), data);
    return res.data;
};

export const updateUserRole = async (id, role) => {
    const res = await API.patch(url(`admin/users/role/${id}`), { role });
    return res.data;
};

export const getAllEvents = async () => {
    const res = await API.get(url('admin/events'));
    return res.data;
};
