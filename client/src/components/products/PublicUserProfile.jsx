import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { FaStar, FaStarHalf } from 'react-icons/fa';
import { getUserByUsername } from '../../helpers/getUser.js';
import { getUserProductsByUserName } from '../../helpers/getProduct.js';
import RatedProductsByUserName from './RatedProductsByUserName.jsx';
import moment from 'moment';
import { nanoid } from 'nanoid';

export default function PublicUserProfile() {
    const { username } = useParams();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [avgUserRating, setAvgUserRating] = useState(null);
    const [user, setUser] = useState(null);

    const [commentPage, setCommentPage] = useState({});
    const COMMENTS_PER_PAGE = 3;

    useEffect(() => {
        const initialPages = {};
        products.forEach((product) => {
            initialPages[product.id] = 1;
        });
        setCommentPage(initialPages);
    }, [products]);

    const handleNextPage = (productId, total) => {
        setCommentPage((prev) => {
            const current = prev[productId] || 1;
            const max = Math.ceil(total / COMMENTS_PER_PAGE);
            return {
                ...prev,
                [productId]: current < max ? current + 1 : current,
            };
        });
    };

    const handlePrevPage = (productId) => {
        setCommentPage((prev) => ({
            ...prev,
            [productId]: Math.max(1, (prev[productId] || 1) - 1),
        }));
    };

    const getPaginatedComments = (product) => {
        const currentPage = commentPage[product.id] || 1;
        const start = (currentPage - 1) * COMMENTS_PER_PAGE;
        const end = start + COMMENTS_PER_PAGE;
        return product.comments.slice(start, end);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getUserProductsByUserName(username);
                setProducts(response.data.data);
                setAvgUserRating(response.data.avgUserRating);

                const userResponse = await getUserByUsername(username);
                setUser(userResponse.data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [username]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!user) return <p>User not found</p>;
    const productsWithComments = products.filter(
        (product) => product.comments.length > 0
    );
    return (
        <>
            {/* User Header */}
            <header className="py-10 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-xl dark:from-[#121c2e] dark:to-[#1f2d44] transition-all duration-300">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <img
                        src={
                            user.image_url ||
                            'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
                        }
                        alt={user.username}
                        className="w-32 h-32 object-cover rounded-full border-4 border-white dark:border-gray-600 shadow-lg"
                    />
                    <div>
                        <h1 className="text-4xl font-bold text-white">
                            {user.username}
                        </h1>
                        <p className="mt-2 text-lg text-white/80">
                            Average User Rating:
                            <span className="ml-2 text-yellow-300 font-semibold text-xl">
                                {avgUserRating || 'N/A'}
                            </span>
                        </p>
                    </div>
                </div>
            </header>
            <div className="flex justify-center md:justify-end my-2">
                {(
                    <Link to={`/products/u/${username}`}>
                        <button className="bg-red-500 dark:bg-red-700 md:mr-10 hover:bg-red-700 dark:hover:bg-red-800 text-white font-bold rounded py-2 px-4">
                            View All Products
                        </button>
                    </Link>
                )}
            </div>
            {/* User Info Section */}
            <section className="py-10 px-6 mt-8 bg-white dark:bg-[#1a1f2b] rounded-xl shadow-md transition-all duration-300 max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    User Information
                </h2>
                <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
                    <p>
                        <span className="font-semibold text-gray-900 dark:text-gray-400">
                            Email:
                        </span>{' '}
                        {user.email}
                    </p>
                    <p>
                        <span className="font-semibold text-gray-900 dark:text-gray-400">
                            Description:
                        </span>{' '}
                        {user.description}
                    </p>
                    <p>
                        <span className="font-semibold text-gray-900 dark:text-gray-400">
                            Contacts:
                        </span>{' '}
                        {user.contacts}
                    </p>
                </div>
            </section>

            {/* Products with Comments */}
            <section className="py-12 px-4">
                <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">
                    Products Rated for You
                </h2>
                {productsWithComments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
                        {productsWithComments.map((product) => {
                            const paginatedComments =
                                getPaginatedComments(product);
                            return (
                                <div
                                    key={`+${product.id}`}
                                    className="bg-white dark:bg-[#1a1f2b] rounded-2xl shadow-xl transition-all hover:shadow-2xl hover:scale-[1.01]"
                                >
                                    <div className="overflow-hidden rounded-t-2xl">
                                        <Link
                                            to={`/products/selected/${product.id}`}
                                        >
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-56 object-contain rounded-t-2xl p-2"
                                            />
                                        </Link>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => {
                                                if (
                                                    i <
                                                    Math.floor(
                                                        product.avgRating
                                                    )
                                                ) {
                                                    return (
                                                        <FaStar
                                                            key={nanoid(64)}
                                                            className="text-yellow-400"
                                                        />
                                                    );
                                                } else if (
                                                    i ===
                                                        Math.floor(
                                                            product.avgRating
                                                        ) &&
                                                    product.avgRating % 1 !== 0
                                                ) {
                                                    return (
                                                        <FaStarHalf
                                                            key={nanoid(64)}
                                                            className="text-yellow-400"
                                                        />
                                                    );
                                                } else {
                                                    return (
                                                        <FaStar
                                                            key={nanoid(64)}
                                                            className="text-gray-300"
                                                        />
                                                    );
                                                }
                                            })}
                                            <span className="text-sm text-gray-500">
                                                ({product.comments.length})
                                            </span>
                                        </div>

                                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-2">
                                            Comments
                                        </h4>
                                        <div className="space-y-4">
                                            {paginatedComments.map(
                                                (comment) => (
                                                    <div
                                                        key={nanoid(64)}
                                                        className="border-t pt-4 border-gray-200 dark:border-gray-700"
                                                    >
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {moment(
                                                                comment.timestamp
                                                            ).format('lll')}
                                                        </p>
                                                        <p className="text-sm text-gray-800 dark:text-gray-300">
                                                            <span className="font-semibold dark:text-gray-400">
                                                                {
                                                                    comment.username
                                                                }
                                                            </span>
                                                            : {comment.comment}
                                                        </p>
                                                        <div className="flex items-center mt-1 text-yellow-400">
                                                            {[
                                                                ...Array(
                                                                    comment.stars
                                                                ),
                                                            ].map(() => (
                                                                <FaStar
                                                                    key={nanoid(
                                                                        64
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        {/* Pagination buttons */}
                                        <div className="flex justify-between items-center mt-6">
                                            <button
                                                disabled={
                                                    (commentPage[product.id] ||
                                                        1) === 1
                                                }
                                                onClick={() =>
                                                    handlePrevPage(product.id)
                                                }
                                                className="text-sm font-medium text-indigo-600 hover:underline disabled:text-gray-400"
                                            >
                                                ◀ Previous
                                            </button>
                                            <button
                                                disabled={
                                                    (commentPage[product.id] ||
                                                        1) *
                                                        COMMENTS_PER_PAGE >=
                                                    product.comments.length
                                                }
                                                onClick={() =>
                                                    handleNextPage(
                                                        product.id,
                                                        product.comments.length
                                                    )
                                                }
                                                className="text-sm font-medium text-indigo-600 hover:underline disabled:text-gray-400"
                                            >
                                                Next ▶
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">
                        No products with comments found.
                    </p>
                )}
            </section>

            <RatedProductsByUserName />
        </>
    );
}
