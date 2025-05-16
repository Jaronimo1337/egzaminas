import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import getFileTypes from '../../../helpers/getFileTypes.js';
import createProduct from '../../../helpers/createProduct.js';
import getAllCategories from '../../../helpers/getAllCategories.js';
import { ToastContainer, toast } from 'react-toastify';

const ProductCreateModal = ({ setShowModal, setUpdate }) => {
    const [availableFileTypes, setAvailableFileTypes] = useState();
    const [strippedAvailableFileTypes, setStrippedAvailableFileTypes] =
        useState();
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetch = async () => {
            const fileTypes = await getFileTypes();
            setAvailableFileTypes(fileTypes);
            const strippedFileTypes = fileTypes
                .map((fileType) => fileType.split('/')[1].toUpperCase())
                .join(', ');
            setStrippedAvailableFileTypes(strippedFileTypes);

            const cat = await getAllCategories();
            setCategories(cat.data.categories);
        };
        fetch();
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        clearErrors,
        watch,
    } = useForm();

    // Stebime pasirinktą kategoriją
    const selectedCategoryId = watch('category_id');

    // Atnaujiname subkategorijas, kai keičiasi pasirinkta kategorija
    useEffect(() => {
        if (selectedCategoryId) {
            const selectedCategory = categories.find(
                (category) => category.id === parseInt(selectedCategoryId)
            );
            setSubcategories(
                selectedCategory ? selectedCategory.subcategories : []
            );
        } else {
            setSubcategories([]); // Išvalome subkategorijas, jei niekas nepasirinkta
        }
    }, [selectedCategoryId, categories]);

    const submitHandler = async (data) => {
        try {
            await createProduct(data);
            setUpdate((update) => update + 1);
            setError('');
            setValue('category_id', '');
            setValue('subcategory_id', '');
            setValue('name', '');
            setValue('price', '');
            setValue('description', '');
            setValue('amount_in_stock', '');
            setValue('images', '');
            toast.success('Product created successfully!', {
                position: 'bottom-right',
                autoClose: 2000,
                style: { background: '#161D2F', color: '#FFFFFF' },
                hideProgressBar: true,
            });
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            setError(error.message || 'Nepavyko sukurti produkto');
        }
    };

    const handleClose = () => {
        setShowModal(false);
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/50">
            <ToastContainer />
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex  items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xlfont-semibold text-gray-800">
                        Create New Product
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
                            type="text"
                            placeholder="Name of the product"
                            {...register('name', {
                                required: 'This field is required',
                                onChange: () => {
                                    setError('');
                                    clearErrors('name');
                                },
                            })}
                            className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-2">
                                {errors.name.message}
                            </p>
                        )}
                    </div>
                    <div className="mb-4">
                        <select
                            name="category"
                            id="cat"
                            {...register('category_id', {
                                required: 'This field is required',
                                onChange: () => {
                                    setError('');
                                    clearErrors('category_id');
                                },
                            })}
                            className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="">Select category</option>
                            {categories?.map((category) => (
                                <option value={category.id} key={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.category_id && (
                            <p className="text-red-500 text-sm mt-2">
                                {errors.category_id.message}
                            </p>
                        )}
                    </div>
                    <div className="mb-4">
                        <select
                            name="subcategory"
                            id="subcat"
                            {...register('subcategory_id', {
                                required: 'This field is required',
                                onChange: () => {
                                    setError('');
                                    clearErrors('subcategory_id');
                                },
                            })}
                            className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="">Select subcategory</option>
                            {subcategories?.map((subcategory) => (
                                <option
                                    value={subcategory.id}
                                    key={subcategory.id}
                                >
                                    {subcategory.name}
                                </option>
                            ))}
                        </select>
                        {errors.subcategory_id && (
                            <p className="text-red-500 text-sm mt-2">
                                {errors.subcategory_id.message}
                            </p>
                        )}
                    </div>
                    <div className="mb-4">
                        <input
                            type="number"
                            placeholder="Product price"
                            {...register('price', {
                                required: 'This field is required',
                                min: 0,
                                validate: (value) =>
                                    value != 0 || 'Price cannot be 0',
                                onChange: () => {
                                    setError('');
                                    clearErrors('price');
                                },
                            })}
                            className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        {errors.price && (
                            <p className="text-red-500 text-sm mt-2">
                                {errors.price.message}
                            </p>
                        )}
                    </div>
                    <div className="mb-4">
                        <textarea
                            placeholder="Description"
                            {...register('description', {
                                required: 'This field is required',
                                onChange: () => {
                                    setError('');
                                    clearErrors('description');
                                },
                            })}
                            className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows="3"
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-2">
                                {errors.description.message}
                            </p>
                        )}
                    </div>
                    <div className="mb-4">
                        <input
                            type="number"
                            placeholder="Number of items in stock"
                            {...register('amount_in_stock', {
                                required: 'This field is required',
                                min: 0,
                                onChange: () => {
                                    setError('');
                                    clearErrors('amount_in_stock');
                                },
                            })}
                            className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        {errors.amount_in_stock && (
                            <p className="text-red-500 text-sm mt-2">
                                {errors.amount_in_stock.message}
                            </p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                            Upload Images ({strippedAvailableFileTypes})
                        </label>
                        <input
                            type="file"
                            multiple
                            {...register('images', {
                                required:
                                    'Add at least one image of your product',
                                onChange: () => {
                                    setError('');
                                    clearErrors('images');
                                },
                                validate: {
                                    fileType: (value) =>
                                        !value[0] ||
                                        availableFileTypes.includes(
                                            value[0].type
                                        ) ||
                                        `The only available file formats are: ${strippedAvailableFileTypes}`,
                                },
                            })}
                            className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                        Create Product
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductCreateModal;
