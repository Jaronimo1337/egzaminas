import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../contexts/AuthContext.jsx';
import { getProductsById } from '../../../helpers/getProduct.js';
import MyProduct from './MyProduct.jsx';
import Sort from '../../Sort.jsx';

const MyProductList = ({ update, setUpdate }) => {
    const {
        auth: { id },
    } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortValue, setSortValue] = useState('');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const [sort, order] = sortValue ? sortValue.split('-') : ['', ''];
            const response = await getProductsById(id, {
                page: pagination.currentPage,
                limit: 5,
                sort,
                order,
            });

            setProducts(response.products || []);
            setPagination(
                response.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalProducts: 0,
                }
            );
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setProducts([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalProducts: 0,
                });
            } else {
                setError(err.message || 'Nepavyko užkrauti produktų');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchProducts();
    }, [id, update, pagination.currentPage, sortValue]);

    const handleSortChange = (newSortValue) => {
        setSortValue(newSortValue);
        setPagination({ ...pagination, currentPage: 1 });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination({ ...pagination, currentPage: newPage });
        }
    };

    const resetSort = () => {
        setSortValue('');
        setPagination({ ...pagination, currentPage: 1 });
    };

    const pageSize = 5;

    return (
        <div className="max-w-full mx-auto">
            <div className="flex items-center gap-3 mb-6"></div>

            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold">
                            All products ({pagination.totalProducts})
                        </h3>
                        <Sort
                            sortValue={sortValue}
                            onSortChange={handleSortChange}
                            resetSort={resetSort}
                        />
                    </div>

                    {products.length === 0 ? (
                        <p className="text-gray-500">No products found.</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <MyProduct
                                        key={product.id}
                                        product={product}
                                        setUpdate={setUpdate}
                                        avgRating={product.avgRating}
                                        ratingCount={product.ratingCount}
                                    />
                                ))}
                            </div>

                            {pagination.totalProducts > pageSize && (
                                <div className="mt-6 flex justify-center items-center space-x-2">
                                    <button
                                        className={`px-4 py-2 bg-blue-500 text-white rounded-md ${
                                            pagination.currentPage <= 1
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:bg-blue-600'
                                        }`}
                                        onClick={() =>
                                            handlePageChange(
                                                pagination.currentPage - 1
                                            )
                                        }
                                        disabled={pagination.currentPage <= 1}
                                    >
                                        Previous
                                    </button>

                                    {Array.from(
                                        { length: pagination.totalPages },
                                        (_, index) => (
                                            <button
                                                key={index + 1}
                                                className={`px-4 py-2 text-sm rounded-md ${
                                                    pagination.currentPage ===
                                                    index + 1
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 hover:bg-blue-400'
                                                }`}
                                                onClick={() =>
                                                    handlePageChange(index + 1)
                                                }
                                            >
                                                {index + 1}
                                            </button>
                                        )
                                    )}

                                    <button
                                        className={`px-4 py-2 bg-blue-500 text-white rounded-md ${
                                            pagination.currentPage >=
                                            pagination.totalPages
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:bg-blue-600'
                                        }`}
                                        onClick={() =>
                                            handlePageChange(
                                                pagination.currentPage + 1
                                            )
                                        }
                                        disabled={
                                            pagination.currentPage >=
                                            pagination.totalPages
                                        }
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default MyProductList;
