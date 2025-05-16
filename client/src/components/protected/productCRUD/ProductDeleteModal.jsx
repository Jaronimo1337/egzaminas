import { useForm } from 'react-hook-form';
import deleteProduct from '../../../helpers/deleteProduct.js';
import { ToastContainer, toast } from 'react-toastify';
import { useState } from 'react';

const ProductDeleteModal = ({ id, toggleShow }) => {
    const { handleSubmit } = useForm();

    const [error, setError] = useState(null);

    const submitHandler = async () => {
        try {
            await deleteProduct(id);
            toast.success('Product successfully deleted!', {
                position: 'bottom-right',
                autoClose: 2000,
                style: { background: '#161D2F', color: '#FFFFFF' },
                hideProgressBar: true,
            });

            setTimeout(() => {
                toggleShow();
                window.location.reload();
            }, 2500);
        } catch (error) {
            setError(error.message || 'Nepavyko nutrinti produkto');
        }
    };
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/50">
            <ToastContainer />
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex  items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl  font-semibold text-gray-800">
                        Delete Product
                    </h3>
                    <button
                        onClick={toggleShow}
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
                    <p>Are you sure you want to delete this product?</p>
                    <button
                        type="submit"
                        className="w-1/3 bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                        Yes
                    </button>{' '}
                    <button
                        type="submit"
                        className="w-1/3 bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        onClick={toggleShow}
                    >
                        Cancel
                    </button>
                    {error}
                </form>
            </div>
        </div>
    );
};

export default ProductDeleteModal;
