import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { updateUserAvatar } from '../../../helpers/updateUserInfo.js';
import getFileTypes from '../../../helpers/getFileTypes.js';
import { ToastContainer, toast } from 'react-toastify';

const ModalPicture = ({ user, showModal, setShowModal }) => {
    const { id } = user;

    const [availableTypes, setAvailableTypes] = useState();
    const [strippedAvailableFileTypes, setStrippedAvailableFileTypes] =
        useState();

    useEffect(() => {
        const fetchTypes = async () => {
            const data = await getFileTypes();
            setAvailableTypes(data);
            const strippedFileTypes = data
                .map((fileType) => fileType.split('/')[1].toUpperCase())
                .join(', ');
            setStrippedAvailableFileTypes(strippedFileTypes);
        };
        fetchTypes();
    }, [user]);

    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        clearErrors,
    } = useForm();

    const submitHandler = async (data) => {
        const file = data.avatar[0];
        if (!availableTypes.includes(file.type)) {
            setError('Invalid file type');
            return;
        }
        try {
            await updateUserAvatar(id, data);
            setError('');
            setValue('avatar', '');
            toast.success('Contacts updated successfully!', {
                position: 'bottom-right',
                autoClose: 2000,
                style: { background: '#161D2F', color: '#FFFFFF' },
                hideProgressBar: true,
            });
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleClose = () => {
        setShowModal(false);
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <ToastContainer />
            <div className="bg-white  shadow-lg rounded-xl p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Edit Picture</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-all"
                    >
                        ✕
                    </button>
                </div>
                <form
                    onSubmit={handleSubmit(submitHandler)}
                    className="flex flex-col"
                >
                    <div>
                        <input
                            type="file"
                            {...register('avatar', {
                                required: 'This field is required',
                                onChange: () => {
                                    setError('');
                                    clearErrors('avatar');
                                },
                                validate: {
                                    fileSize: (value) => {
                                        if (!value[0]) return true;
                                        return (
                                            value[0].size <= 2000000 ||
                                            'File size must be less than 2MB'
                                        );
                                    },
                                    fileType: (value) => {
                                        if (!value[0]) return true;
                                        return (
                                            availableTypes.includes(
                                                value[0].type
                                            ) ||
                                            `The only available file formats are: ${strippedAvailableFileTypes}`
                                        );
                                    },
                                },
                            })}
                            className="block w-full border border-gray-300 rounded-lg p-2 cursor-pointer text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-white file:bg-purple-500 hover:file:bg-purple-600"
                        />
                        {errors.file && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.file.message}
                            </p>
                        )}
                    </div>
                    {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                    <button
                        type="submit"
                        className="bg-red-500 hover:bg-red-600 text-white rounded py-2 px-4 mt-4 transition-all"
                    >
                        Submit New Picture
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ModalPicture;
