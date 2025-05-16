import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router';
import { FaStar, FaStarHalf, FaBookmark as BookmarkSolid, FaRegBookmark as BookmarkOutline } from 'react-icons/fa';
import { nanoid } from 'nanoid';
import axios from 'axios';
import url from '../helpers/getURL'; 
import { AuthContext } from '../contexts/AuthContext'; // Adjust path if needed

export default function ProductCard({ product, avgRating, ratingCount }) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(false);
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        // Check if product is bookmarked when component mounts
        if (auth && product?.id) {
            checkBookmarkStatus();
        }
    }, [auth, product?.id]);

    const checkBookmarkStatus = async () => {
        if (!auth) return;
        
        try {
            const response = await axios.get(url(`products/bookmarks/${product.id}`), {
                withCredentials: true
            });
            
            setIsBookmarked(response.data.isBookmarked);
        } catch (error) {
            console.error('Error checking bookmark status:', error);
            // If the API endpoint doesn't exist yet, just don't show bookmark status
        }
    };

    const handleBookmarkToggle = async (e) => {
        e.preventDefault(); // Prevent navigation since this is inside a Link component
        e.stopPropagation();
        
        if (!auth) {
            // Redirect to login or show login modal
            alert('Please log in to bookmark products');
            return;
        }

        setLoading(true);
        
        try {
            if (isBookmarked) {
                // Remove bookmark
                await axios.delete(url(`products/bookmarks/${product.id}`), {
                    withCredentials: true
                });
                setIsBookmarked(false);
            } else {
                // Add bookmark
                await axios.post(url(`products/bookmarks/${product.id}`), {}, {
                    withCredentials: true
                });
                setIsBookmarked(true);
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            // You could add toast notifications here
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <Link
                to={`/products/selected/${product.id}`}
                className="no-underline text-black"
            >
                <div className="bg-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 hover:animate-ease-in hover:animate-duration-300 transition-shadow p-4 flex flex-col items-center">
                    <div className="w-full h-48 overflow-hidden">
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="mx-auto h-full object-cover rounded-md"
                        />
                    </div>
                    <h2 className="font-semibold text-lg mt-3 text-center">
                        {product.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-red-500 text-lg font-bold">
                            ${product.price}
                        </span>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => {
                                if (i < Math.floor(avgRating)) {
                                    return (
                                        <FaStar
                                            key={nanoid(64)}
                                            className="text-yellow-500"
                                        />
                                    );
                                } else if (
                                    i === Math.floor(avgRating) &&
                                    avgRating % 1 !== 0
                                ) {
                                    return (
                                        <FaStarHalf
                                            key={nanoid(64)}
                                            className="text-yellow-500"
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
                            <span className="text-gray-600 text-sm">
                                ({ratingCount || 0})
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
            
            {/* Bookmark button - positioned at top right */}
            {auth && (
                <button 
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow z-10"
                    onClick={handleBookmarkToggle}
                    disabled={loading}
                >
                    {isBookmarked ? (
                        <BookmarkSolid className="text-[#800020] text-xl" />
                    ) : (
                        <BookmarkOutline className="text-gray-500 text-xl hover:text-[#800020]" />
                    )}
                </button>
            )}
        </div>
    );
}