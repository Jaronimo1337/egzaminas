import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProductCard from '../ProductCard';
import Sort from '../Sort';
import { searchProducts } from '../../helpers/searchProducts';
import getSearchRegex from '../../helpers/getSearchRegex';


const SearchedProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [zalgoRegex, setZalgoRegex] = useState(null);
    const navigate = useNavigate();

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalProducts: 0,
        perPage: 8,
    });

    const [sortValue, setSortValue] = useState(() => {
        const savedSortValue = localStorage.getItem('sortValue');
        const validSortValues = [
            'timestamp-asc',
            'timestamp-desc',
            'price-asc',
            'price-desc',
            'avgRating-asc',
            'avgRating-desc',
            'name-asc',
            'name-desc',
        ];
        return validSortValues.includes(savedSortValue)
            ? savedSortValue
            : 'timestamp-desc';
    });

    useEffect(() => {
        const fetchRegex = async () => {
            try {
                const response = await getSearchRegex();
                if (response?.zalgoRegex) {
                    const regex = new RegExp(response.zalgoRegex);
                    setZalgoRegex(regex);
                }
            } catch (err) {
                console.error('Failed to fetch Zalgo regex:', err);
            }
        };

        fetchRegex();
    }, []);

    const fetchSearchResults = async (query, page = 1) => {
        if (!query) return;

        setLoading(true);
        setError(null);

        try {
            const [sort, order] = sortValue.split('-');
            const response = await searchProducts(
                query,
                sort,
                order,
                page,
                pagination.perPage
            );

            if (response?.data) {
                setProducts(response.data.data || []);

                if (response.data.pagination) {
                    setPagination({
                        currentPage: response.data.pagination.currentPage,
                        totalPages: response.data.pagination.totalPages,
                        totalProducts: response.data.pagination.totalProducts,
                        perPage: response.data.pagination.perPage,
                    });
                }
            } else {
                setProducts([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 0,
                    totalProducts: 0,
                    perPage: pagination.perPage,
                });
            }
        } catch (err) {
            console.error('Error fetching search results:', err);
            if (err.response && err.response.status === 404) {
                setProducts([]);
            } else {
                setError('Failed to load search results');
                setProducts([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const query = searchParams.get('q');
        const page = parseInt(searchParams.get('page') || '1', 10);

        const isZalgo = (text) => {
            try {
                return zalgoRegex ? zalgoRegex.test(text) : false;
            } catch (e) {
                console.error('Error in Zalgo check:', e);
                return false;
            }
        };

        if (zalgoRegex && query) {
            const trimmedQuery = query.trim().toLowerCase();

            const isInvalid =
                trimmedQuery.length < 3 ||
                trimmedQuery.length > 30 ||
                !/^[a-zA-Z0-9 ]+$/.test(trimmedQuery) ||
                isZalgo(trimmedQuery);

            if (isInvalid) {
                toast.error('Zalgo? Not on my watch.');
                navigate('*');
                return;
            }

            fetchSearchResults(trimmedQuery, page);
        } else {
            setProducts([]);
        }
    }, [searchParams, navigate, zalgoRegex, sortValue]);

    const searchQuery = searchParams.get('q');
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    useEffect(() => {
        localStorage.setItem('sortValue', sortValue);
    }, [sortValue]);

    const handleSortChange = (newSortValue) => {
        setSortValue(newSortValue);
        setSearchParams((params) => {
            params.set('page', '1');
            return params;
        });
    };

    const handlePageChange = (newPage) => {
        setSearchParams((params) => {
            params.set('page', newPage.toString());
            return params;
        });
        window.scrollTo(0, 0);
    };

    return (
        <div className="p-4">
            <div className="mt-8 w-full">
                {/* Sort component */}
                <div className="flex justify-end mb-4 mx-10">
                    <Sort
                        onSortChange={handleSortChange}
                        sortValue={sortValue}
                    />
                </div>

                <div className="flex ml-10 flex-row gap-2 mt-2">
                    <div className="w-2 h-6 bg-red-500"></div>
                    <h2 className="text-l text-red-500 font-bold mb-2">
                        Search Results
                    </h2>
                </div>
                <h2 className="text-2xl font-bold ml-10 mb-2">
                    {searchQuery
                        ? `Products matching "${searchQuery}"`
                        : 'Search Results'}
                </h2>

                {loading && (
                    <div className="text-center py-8">
                        <p>Loading...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-10 mb-4">
                        {error}
                    </div>
                )}

                {!loading &&
                    !error &&
                    (products.length === 0 ? (
                        <p className="text-gray-500 text-center mx-10 py-8">
                            {searchQuery
                                ? `No products found matching "${searchQuery}"`
                                : 'Enter a search term to find products.'}
                        </p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 mx-6">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        avgRating={product.avgRating}
                                        ratingCount={product.ratingCount}
                                    />
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {pagination.totalPages > 1 && (
                                <div className="flex justify-center mt-8 mb-4">
                                    <nav className="flex items-center">
                                        <button
                                            onClick={() =>
                                                handlePageChange(
                                                    Math.max(currentPage - 1, 1)
                                                )
                                            }
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1 mr-1 rounded ${
                                                currentPage === 1
                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                            }`}
                                        >
                                            Previous
                                        </button>

                                        {Array.from(
                                            { length: pagination.totalPages },
                                            (_, i) => i + 1
                                        )
                                            .filter(
                                                (page) =>
                                                    page === 1 ||
                                                    page ===
                                                        pagination.totalPages ||
                                                    (page >= currentPage - 1 &&
                                                        page <= currentPage + 1)
                                            )
                                            .map((page, index, array) => {
                                                // Show ellipsis when pages are skipped
                                                if (
                                                    index > 0 &&
                                                    page - array[index - 1] > 1
                                                ) {
                                                    return (
                                                        <span
                                                            key={`ellipsis-${page}`}
                                                            className="mx-1"
                                                        >
                                                            ...
                                                        </span>
                                                    );
                                                }

                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() =>
                                                            handlePageChange(
                                                                page
                                                            )
                                                        }
                                                        className={`w-8 h-8 mx-1 rounded ${
                                                            currentPage === page
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            })}

                                        <button
                                            onClick={() =>
                                                handlePageChange(
                                                    Math.min(
                                                        currentPage + 1,
                                                        pagination.totalPages
                                                    )
                                                )
                                            }
                                            disabled={
                                                currentPage ===
                                                pagination.totalPages
                                            }
                                            className={`px-3 py-1 ml-1 rounded ${
                                                currentPage ===
                                                pagination.totalPages
                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                            }`}
                                        >
                                            Next
                                        </button>
                                    </nav>
                                </div>
                            )}

                            <div className="text-center text-gray-500 mb-8">
                                Showing {products.length} of{' '}
                                {pagination.totalProducts} products
                            </div>
                        </>
                    ))}
            </div>
        </div>
    );
};

export default SearchedProducts;
