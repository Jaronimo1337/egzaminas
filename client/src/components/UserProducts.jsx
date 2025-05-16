import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import ProductCard from './ProductCard';
import { getUserByUsername } from '../helpers/getUser.js';
import { getUserProductsByUserName } from '../helpers/getProduct.js';


export default function UserProducts() {
    const { username } = useParams();

    const [userName, setUserName] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalProducts: 0,
    });
    const [pageSize, setPageSize] = useState(12);

    const fetchProducts = async (page = 1) => {
        setLoading(true);
        try {
            const response = await getUserProductsByUserName(username, page, pageSize);
            setProducts(response.data.data);

            setPagination({
                currentPage: response.data.pagination.currentPage,
                totalPages: response.data.pagination.totalPages,
                totalProducts: response.data.pagination.totalProducts,
            });

            const userResponse = await getUserByUsername(username);
            setUserName(userResponse.data.data.username);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(pagination.currentPage);
    }, [username, pagination.currentPage, pageSize]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setPagination({ ...pagination, currentPage: newPage });
        }
    };

    const handlePageSizeChange = (event) => {
        setPageSize(parseInt(event.target.value));
        setPagination({ ...pagination, currentPage: 1 });
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (products.length === 0) return <p>No products found</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold ml-10 mt-2 mb-2">
                {userName} Products
            </h2>

            <div className="mb-4 ml-10">
                <label htmlFor="pageSize" className="mr-2">Products per page:</label>
                <select
                    id="pageSize"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="p-2 border rounded-md"
                >
                    {[6, 12, 18, 24].map((size) => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        avgRating={product.avgRating}
                        ratingCount={product.ratingCount}
                    />
                ))}
            </div>

            {pagination.totalProducts > pageSize && (
                <div className="mt-6 flex justify-center items-center space-x-2">
                    <button
                        className={`px-4 py-2 bg-blue-500 text-white rounded-md ${pagination.currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage <= 1}
                    >
                        Previous
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            className={`px-4 py-2 text-sm rounded-md ${pagination.currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'} hover:bg-blue-400`}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        className={`px-4 py-2 bg-blue-500 text-white rounded-md ${pagination.currentPage >= pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
