import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { updatePassword } from '../../../helpers/updateUserInfo.js';
import { sha1 } from 'js-sha1';
import { sha256 } from 'js-sha256';
import { ToastContainer, toast } from 'react-toastify';
const ModalPassword = ({ user, showModal, setShowModal }) => {
    const { id } = user;
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        clearErrors,
        watch,
    } = useForm();

    const submitHandler = async (data) => {
        try {
            const oldPassword = sha256(sha1(data.oldPassword));
            const newPassword = sha256(sha1(data.newPassword));
            await updatePassword(id, { oldPassword, newPassword });
            setError('');
            setValue('oldPassword', '');
            setValue('newPassword', '');
            setValue('repeatPassword', '');
            toast.success('Contacts updated successfully!', {
                position: 'bottom-right',
                autoClose: 2000,
                style: { background: '#161D2F', color: '#FFFFFF' },
                hideProgressBar: true,
            });
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            setError(error);
        }
    };

    const handleClose = () => {
        setShowModal(!showModal);
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/50">
            <ToastContainer />
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800">
                        Edit Password
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full hover:bg-gray-100 transition duration-200"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
                <form
                    onSubmit={handleSubmit(submitHandler)}
                    className=" p-6"
                >
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="Old password"
                            {...register('oldPassword', {
                                required: 'This field is required',
                                minLength: {
                                    value: 7,
                                    message: 'Password is too short',
                                },
                                pattern: {
                                    value: /^[A-Za-z0-9$&+,:;=?@#|'<>.^*()%!-]{7,}$/,
                                    message:
                                        'Password must contain valid characters',
                                },
                                validate: (value) =>
                                    (/^.*[A-Z].*$/.test(value) &&
                                        /^.*\d.*$/.test(value) &&
                                        /^.*[$&+,:;=?@#|'<>.^*()%!-].*$/.test(
                                            value
                                        )) ||
                                    'Password must contain at least 1 capital letter, 1 number, and 1 special character',
                                onChange: () => {
                                    setError('');
                                    clearErrors('oldPassword');
                                },
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        {errors.oldPassword && (
                            <p className="text-red-500 text-sm mt-2">
                                {errors.oldPassword.message}
                            </p>
                        )}
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="New password"
                            {...register('newPassword', {
                                required: 'This field is required',
                                minLength: {
                                    value: 7,
                                    message: 'Password is too short',
                                },
                                pattern: {
                                    value: /^[A-Za-z0-9$&+,:;=?@#|'<>.^*()%!-]{7,}$/,
                                    message:
                                        'Password must contain valid characters',
                                },
                                validate: (value) =>
                                    (/^.*[A-Z].*$/.test(value) &&
                                        /^.*\d.*$/.test(value) &&
                                        /^.*[$&+,:;=?@#|'<>.^*()%!-].*$/.test(
                                            value
                                        )) ||
                                    'Password must contain at least 1 capital letter, 1 number, and 1 special character',
                                onChange: () => {
                                    setError('');
                                    clearErrors('newPassword');
                                },
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        {errors.newPassword && (
                            <p className="text-red-500 text-sm mt-2">
                                {errors.newPassword.message}
                            </p>
                        )}
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="Repeat new password"
                            {...register('repeatPassword', {
                                required: 'This field is required',
                                validate: (value) =>
                                    value === watch('newPassword') ||
                                    'Passwords must match',
                                onChange: () => {
                                    setError('');
                                    clearErrors('repeatPassword');
                                },
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        {errors.repeatPassword && (
                            <p className="text-red-500 text-sm mt-2">
                                {errors.repeatPassword.message}
                            </p>
                        )}
                    </div>
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                        Submit New Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ModalPassword;
