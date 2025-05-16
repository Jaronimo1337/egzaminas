import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../ProductCard';
import getProductsBySubcategory from '../../helpers/getProductsBySubcategory';

const ProductsPage = () => {
    const { subcategoryId } = useParams();
    const [subcategory, setSubcategory] = useState({});
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [noProducts, setNoProducts] = useState(false);
    const [pageSize, setPageSize] = useState(8);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalProducts: 0,
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getProductsBySubcategory(
                    subcategoryId,
                    pageSize,
                    pagination.currentPage
                );
                const products = response.data.products;
                const totalProducts = response.totalProducts;

                if (products.length === 0) {
                    setNoProducts(true);
                } else {
                    setProducts(products);
                    setSubcategory(products[0].subcategory);
                }
                setPagination({
                    currentPage: pagination.currentPage,
                    totalPages:
                        totalProducts % pageSize != 0
                            ? Math.trunc(totalProducts / pageSize) + 1
                            : Math.trunc(totalProducts / pageSize),
                    totalProducts: totalProducts,
                });
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [subcategoryId, pageSize, pagination.currentPage]);

    console.log(pagination, 'totalPages');

    const handlePageSizeChange = (event) => {
        setPageSize(parseInt(event.target.value));
        setPagination({ ...pagination, currentPage: 1 });
    };
    console.log(products);
    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setPagination({ ...pagination, currentPage: newPage });
            console.log(pagination.currentPage, 'currentPage');
        }
    };

    if (noProducts) {
        return (
            <div className="text-center text-lg text-gray-500">
                No products found in this subcategory
            </div>
        );
    }

    if (isLoading)
        return <div className="text-center text-lg">Loading products...</div>;

    return (
        <div className="mt-10 w-full">
            <div className="flex ml-10 flex-row gap-2 mt-2">
                <div className="w-2 h-6 bg-red-500"></div>
                <h2 className="text-l text-red-500 font-bold mb-2">Products</h2>
            </div>
            <div>{error}</div>
            <h2 className="text-2xl font-bold ml-10 mb-2">
                Products in:{' '}
                {products[0]?.subcategory?.name || 'Selected Category'}
            </h2>

            <div className="mb-4 ml-10">
                <label htmlFor="pageSize" className="mr-2">
                    Products per page:
                </label>
                <select
                    id="pageSize"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="p-2 dark:text-white dark:bg-gray-900 border rounded-md"
                >
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={18}>18</option>
                    <option value={24}>24</option>
                    <option value={30}>30</option>
                </select>
            </div>

            {products.length === 0 ? (
                <p className="text-gray-500 text-center">
                    No products available for this category
                </p>
            ) : (
                <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
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
                                className={`px-4 py-2 bg-blue-500 text-white rounded-md ${
                                    pagination.currentPage <= 1
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                }`}
                                onClick={() =>
                                    handlePageChange(pagination.currentPage - 1)
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
                                            pagination.currentPage === index + 1
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200'
                                        } hover:bg-blue-400`}
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
                                        : ''
                                }`}
                                onClick={() =>
                                    handlePageChange(pagination.currentPage + 1)
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
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
