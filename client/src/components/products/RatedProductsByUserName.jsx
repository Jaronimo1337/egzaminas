import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { getUserByUsername } from '../../helpers/getUser.js';
import { getRatedProductsByUserName } from '../../helpers/getProduct';
import { nanoid } from 'nanoid';
import moment from 'moment';
import { FaStar } from 'react-icons/fa';
export default function RatedProductsByUserName() {
    const { username } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getRatedProductsByUserName(username);
                setProducts(response.data.data);

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
    return (
        <section className="px-4 py-10 bg-white dark:bg-[#1a1f2b] shadow-xl rounded-2xl transition-all duration-300 max-w-6xl mx-auto mt-10">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">
                Products Rated by{' '}
                <span className="text-indigo-500">{user.username}</span>
            </h2>

            {products.length > 0 ? (
                <div className="space-y-6">
                    {products.map((product) => (
                        <div
                            key={nanoid(64)}
                            className="bg-gray-50 dark:bg-[#232c3b] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                    <Link
                                        to={`/products/selected/${product.id}`}
                                        className="hover:text-indigo-500 transition-colors duration-200"
                                    >
                                        {product.name}
                                    </Link>
                                </h2>
                                <div className="flex items-center gap-1">
                                    {[...Array(product.userRating)].map(() => (
                                        <FaStar
                                            key={nanoid(64)}
                                            className="text-yellow-400 text-lg"
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {moment(product.timestamp).format('lll')}
                            </div>

                            <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                {product.userComment}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
                    No rated products.
                </p>
            )}
        </section>
    );
}
