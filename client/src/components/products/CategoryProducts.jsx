import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import getCategoryProducts from '../../helpers/getCategoryProducts';
import ProductCard from '../ProductCard';
import Sort from '../Sort';

const CategoryProducts = () => {
    const { id } = useParams();
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [page, setPage] = useState(1);
    const [sortValue, setSortValue] = useState('');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const [sort, order] = sortValue.split('-');
            const response = await getCategoryProducts(id, {
                page,
                limit: 8,
                sort,
                order,
            });

            setProducts(response.products);
            setPagination(response.pagination);
            console.log(response);
            setCategoryName(response.categoryName);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchProducts();
    }, [id, page, sortValue]);

    const resetFilters = () => {
        setSortValue('');
        setPage(1);
    };

    return (
        <div className="p-4">
            <div className="flex ml-10 flex-row gap-2 mt-5">
            </div>
            {loading ? (
                <p>Loading products...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <>
                    <div className="flex justify-between">
                        <h2 className="text-2xl ml-10 font-bold mb-4">
                            Products in: {categoryName || 'Selected Category'}
                        </h2>
                        <div className="ml-10  mb-5">
                            <Sort
                                onSortChange={setSortValue}
                                sortValue={sortValue}
                                resetFilters={resetFilters}
                            />
                        </div>
                    </div>

                    {products.length === 0 ? (
                        <p>No products available.</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        avgRating={product.avgRating}
                                        ratingCount={product.ratingCount}
                                    />
                                ))}
                            </div>

                            <div className="flex justify-center mt-6 dark:text-gray-700 space-x-2">
                                {[...Array(pagination.totalPages).keys()].map(
                                    (num) => (
                                        <button
                                            key={num}
                                            onClick={() => setPage(num + 1)}
                                            className={`px-3 py-1 rounded ${
                                                page === num + 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200'
                                            }`}
                                        >
                                            {num + 1}
                                        </button>
                                    )
                                )}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default CategoryProducts;
