import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import getFileTypes from '../../../helpers/getFileTypes.js';
import createComment from '../../../helpers/createComment.js';
import { FaStar } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';

export default function ReviewCreateModal({
    setShowModal,
    setUpdate,
    productId,
}) {
    const [availableFileTypes, setAvailableFileTypes] = useState([]);
    const [strippedAvailableFileTypes, setStrippedAvailableFileTypes] =
        useState('');
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        clearErrors,
        watch,
    } = useForm();

    useEffect(() => {
        const fetchFileTypes = async () => {
            const fileTypes = await getFileTypes();
            setAvailableFileTypes(fileTypes);
            const stripped = fileTypes
                .map((ft) => ft.split('/')[1].toUpperCase())
                .join(', ');
            setStrippedAvailableFileTypes(stripped);
        };
        fetchFileTypes();
    }, []);

    useEffect(() => {
        if (productId) {
            setValue('product_id', productId);
        }
    }, [productId, setValue]);

    const submitHandler = async (data) => {
        try {
            await createComment(data);
            setUpdate((u) => u + 1);
            toast.success('Atsiliepimas sėkmingai pateiktas!', {
                position: 'bottom-right',
                autoClose: 2000,
                style: { background: '#161D2F', color: '#FFFFFF' },
                hideProgressBar: true,
            });
            setTimeout(() => {
                setShowModal(false);
                window.location.reload();
            }, 2500);
        } catch (error) {
            setError(
                error.response?.data?.message || 'Nepavyko sukurti komentaro'
            );
        }
    };

    const handleClose = () => {
        setShowModal(false);
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/50 mt-20">
            <ToastContainer />
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex dark:bg-gray-800 items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl dark:text-white font-semibold text-gray-800">
                        Palikite atsiliepimą
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit(submitHandler)}
                    className="dark:bg-gray-800 p-6"
                >
                    <div className="mb-4">
                        <textarea
                            placeholder="Komentaras"
                            {...register('comment', {
                                required: 'Komentaras būtinas',
                                onChange: () => {
                                    setError('');
                                    clearErrors('comment');
                                },
                            })}
                            rows="3"
                            className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        {errors.comment && (
                            <p className="text-red-500 text-sm mt-2">
                                {errors.comment.message}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                            Įvertinimas
                        </label>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => {
                                        setValue('stars', star);
                                        clearErrors('stars');
                                        setError('');
                                    }}
                                    className="focus:outline-none"
                                >
                                    <FaStar
                                        size={28}
                                        color={
                                            watch('stars') >= star
                                                ? '#facc15'
                                                : '#d1d5db'
                                        }
                                        className="transition-colors hover:scale-110"
                                    />
                                </button>
                            ))}
                        </div>
                        <input
                            type="hidden"
                            {...register('stars', {
                                required: 'Reikalingas įvertinimas',
                                min: 1,
                                max: 5,
                                valueAsNumber: true,
                            })}
                        />
                        {errors.stars && (
                            <p className="text-red-500 text-sm mt-2">
                                {errors.stars.message}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                            Nuotraukos ({strippedAvailableFileTypes})
                        </label>
                        <input
                            type="file"
                            multiple
                            {...register('images', {
                                onChange: () => {
                                    setError('');
                                    clearErrors('images');
                                },
                                validate: {
                                    fileType: (value) => {
                                        if (!value || !Array.from(value)[0])
                                            return true;
                                        return (
                                            availableFileTypes.includes(
                                                Array.from(value)[0].type
                                            ) ||
                                            `Leistini formatai: ${strippedAvailableFileTypes}`
                                        );
                                    },
                                },
                            })}
                            className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        {errors.images && (
                            <p className="text-red-500 text-sm mt-2">
                                {errors.images.message}
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
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-4 rounded-lg transition duration-200"
                    >
                        Pateikti atsiliepimą
                    </button>
                </form>
            </div>
        </div>
    );
}
