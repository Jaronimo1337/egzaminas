import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    banUser,
    deleteUser,
    getAllUsers,
    updateUser,
    updateUserRole,
} from '../../../helpers/adminPanel.js';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editData, setEditData] = useState({
        username: '',
        email: '',
        contacts: '',
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const users = await getAllUsers();
                setUsers(users);
            } catch (error) {
                console.error('Klaida įkeliant naudotojus:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleDelete = async (userId) => {
        if (!window.confirm('Ištrinti naudotoją?')) return;
        try {
            const res = await deleteUser(userId);
            if (res.status === 204) {
                setUsers((prevUsers) =>
                    prevUsers.filter((user) => user.id !== userId)
                );
            } else {
                const errorData = await res.json();
                console.error('Pašalinimo klaida:', errorData.message);
            }
        } catch (err) {
            console.error('Serverio klaida:', err);
        }
    };

    const handleBan = async (userId) => {
        try {
            await banUser(userId);
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === userId ? { ...user, role: 'banned' } : user
                )
            );
        } catch (error) {
            console.error('Klaida uždraudžiant naudotoją:', error);
        }
    };

    const handleSaveEdit = async () => {
        try {
            await updateUser(editingUser, editData);
            toast.success('Vartotojas atnaujintas!');
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === editingUser ? { ...u, ...editData } : u
                )
            );
            setEditingUser(null);
        } catch (err) {
            console.error('Klaida išsaugant:', err);
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user.id);
        setEditData({
            username: user.username,
            email: user.email,
            contacts: user.contacts || '',
        });
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto text-gray-900">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                Admin panel
            </h1>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar
            />

            {/* Users Table */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    List of users
                </h2>

                {users.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="bg-neutral-100 p-4 rounded-lg shadow transition"
                            >
                                <p className="text-sm text-gray-500 mb-1">
                                    ID: {user.id}
                                </p>

                                {editingUser === user.id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editData.username}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    username:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full mb-1 p-1 rounded bg-gray-100 text-sm"
                                        />
                                        <input
                                            type="email"
                                            value={editData.email}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    email: e.target
                                                        .value,
                                                })
                                            }
                                            className="w-full mb-1 p-1 rounded bg-gray-100 text-sm"
                                        />
                                        <input
                                            type="text"
                                            value={editData.contacts}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    contacts:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full mb-1 p-1 rounded bg-gray-100 text-sm"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-semibold text-lg">
                                                {user.username}
                                            </p>
                                            <button
                                                onClick={() =>
                                                    handleEditUser(user)
                                                }
                                                className="text-blue-400 hover:text-blue-600 text-sm"
                                                title="Redaguoti"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke="currentColor"
                                                    className="size-6"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {user.email}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Contact:{' '}
                                            {user.contacts || '—'}
                                        </p>
                                    </>
                                )}

                                {/* Role */}
                                <div className="mt-3">
                                    <label
                                        htmlFor="role_select"
                                        className="text-sm text-gray-500 block mb-1"
                                    >
                                        Vaidmuo:
                                    </label>
                                    <select
                                        id="role_select"
                                        value={user.role}
                                        onChange={async (e) => {
                                            const newRole =
                                                e.target.value;
                                            try {
                                                await updateUserRole(
                                                    user.id,
                                                    newRole
                                                );
                                                setUsers(
                                                    users.map((u) =>
                                                        u.id === user.id
                                                            ? {
                                                                  ...u,
                                                                  role: newRole,
                                                              }
                                                            : u
                                                    )
                                                );
                                            } catch (err) {
                                                console.error(
                                                    'Klaida keičiant vaidmenį:',
                                                    err
                                                );
                                            }
                                        }}
                                        className="w-full bg-gray-100 text-gray-900 rounded px-2 py-1"
                                    >
                                        <option value="user">
                                            User
                                        </option>
                                        <option value="admin">
                                            Admin
                                        </option>
                                        <option value="banned">
                                            Banned
                                        </option>
                                    </select>
                                </div>

                                {/* Actions */}
                                {editingUser === user.id ? (
                                    <div className="mt-4 flex justify-between text-sm font-medium">
                                        <button
                                            onClick={handleSaveEdit}
                                            className="text-green-600 hover:underline"
                                        >
                                            Išsaugoti
                                        </button>
                                        <button
                                            onClick={() =>
                                                setEditingUser(null)
                                            }
                                            className="text-gray-500 hover:underline"
                                        >
                                            Atšaukimas
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex justify-between text-sm font-medium">
                                        <button
                                            onClick={() =>
                                                handleBan(user.id)
                                            }
                                            className="text-red-600 hover:underline"
                                        >
                                            Ban
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(user.id)
                                            }
                                            className="text-red-700 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-400 py-4">
                        No users found.
                    </p>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;