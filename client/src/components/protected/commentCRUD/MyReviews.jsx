import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../contexts/AuthContext.jsx';
import getUserComments from '../../../helpers/getUserComments.js';
import { getProductById } from '../../../helpers/getProduct.js'; 
import axios from 'axios';
import url from '../../../helpers/getURL.js';
import { FaStar, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Link } from 'react-router';
import EditCommentModal from '../commentCRUD/EditCommentModal.jsx';
import DeleteCommentModal from '../commentCRUD/DeleteCommentModal';

export default function MyReviews() {
    const { auth, loading } = useContext(AuthContext);
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    
    // State for edit and delete modals
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);
    const [productNames, setProductNames] = useState({});

    const fetchComments = async () => {
        if (!auth?.id) return;
        
        try {
            setIsLoading(true);
            const response = await getUserComments(auth.id);
            const commentsData = response.data.data || [];
            
            // Get product details for each comment
            const productIds = [...new Set(commentsData.map(comment => comment.product_id))];
            const productDetailsMap = {};
            
            await Promise.all(
                productIds.map(async (productId) => {
                    try {
                        // Using your existing getProductById helper
                        const productResponse = await getProductById(productId);
                        if (productResponse?.data?.data) {
                            productDetailsMap[productId] = productResponse.data.data.name;
                        }
                    } catch (err) {
                        console.error(`Error fetching product ${productId}:`, err);
                        productDetailsMap[productId] = 'Unknown Product';
                    }
                })
            );
            
            setProductNames(productDetailsMap);
            
            // Get images for each comment
            const commentsWithImages = await Promise.all(
                commentsData.map(async (comment) => {
                    try {
                        const imgResponse = await axios.get(
                            url(`images/c/comment${comment.id}`),
                            {
                                withCredentials: true,
                            }
                        );
                        return {
                            ...comment,
                            images: imgResponse.data.data || [],
                        };
                    } catch (imgErr) {
                        if (imgErr.response?.status !== 404) {
                            console.error(
                                `Error getting comment ${comment.id} images:`,
                                imgErr
                            );
                        }
                        return { ...comment, images: [] };
                    }
                })
            );
            
            setComments(commentsWithImages);
            setError(null);
        } catch (err) {
            console.error('Error getting comments:', err);
            setError(err.message || 'Failed to get comments');
            toast.error('Failed to load your reviews', {
                position: 'top-center',
                autoClose: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && auth?.id) {
            fetchComments();
        }
    }, [auth, loading]);

    // Handle edit comment
    const handleEditClick = (comment) => {
        setSelectedComment(comment);
        setEditModalOpen(true);
    };
    
    // Handle delete comment
    const handleDeleteClick = (comment) => {
        setSelectedComment(comment);
        setDeleteModalOpen(true);
    };

    if (loading || isLoading) return (
        <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
    );
    
    if (!auth) return (
        <div className="p-8 text-center">
            <p className="text-lg text-gray-700">Please log in to view your reviews</p>
            <Link to="/login" className="mt-4 inline-block px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                Login
            </Link>
        </div>
    );
    
    if (error) return (
        <div className="p-8 text-center">
            <p className="text-lg text-red-500">Error: {error}</p>
            <button 
                onClick={fetchComments}
                className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
                Try Again
            </button>
        </div>
    );

    return (
        <div className="p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    My Reviews
                </h2>
                <button 
                    onClick={fetchComments}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {comments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500 text-lg mb-4">You haven't written any reviews yet</p>
                    <Link to="/products" className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="bg-white border border-gray-200 shadow-md rounded-xl p-5 transition-all hover:shadow-lg"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-medium text-gray-800">
                                        <Link to={`/products/${comment.product_id}`} className="hover:text-red-500 transition-colors">
                                            {productNames[comment.product_id] || 'Product'}
                                        </Link>
                                    </h3>
                                    <div className="flex items-center mt-1">
                                        {[...Array(5)].map((_, index) => (
                                            <FaStar
                                                key={index}
                                                className={`${
                                                    index < comment.stars 
                                                        ? 'text-yellow-500' 
                                                        : 'text-gray-300'
                                                } text-lg`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditClick(comment)}
                                        className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                                        aria-label="Edit review"
                                    >
                                        <FaEdit className="text-lg" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(comment)}
                                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                                        aria-label="Delete review"
                                    >
                                        <FaTrashAlt className="text-lg" />
                                    </button>
                                </div>
                            </div>
                            
                            {comment.images && comment.images.length > 0 && (
                                <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                                    {comment.images.map((imageUrl, index) => (
                                        <img
                                            key={index}
                                            src={imageUrl}
                                            alt={`Comment ${comment.id} image ${index + 1}`}
                                            className="w-24 h-24 object-cover rounded-md cursor-pointer"
                                            onClick={() => setSelectedImage(imageUrl)}
                                        />
                                    ))}
                                </div>
                            )}
                            
                            <p className="text-gray-700 mb-2">{comment.comment}</p>
                            
                            <p className="text-xs text-gray-500 mt-3">
                                {comment.createdAt && moment(comment.createdAt).format('MMMM D, YYYY')}
                            </p>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Image preview modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="Preview"
                        className="max-w-full max-h-full p-4 rounded-lg"
                    />
                </div>
            )}
            
            {/* Edit Comment Modal */}
            {selectedComment && (
                <EditCommentModal 
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    comment={selectedComment}
                    productId={selectedComment.product_id}
                    onCommentUpdated={fetchComments}
                />
            )}
            
            {/* Delete Comment Modal */}
            {selectedComment && (
                <DeleteCommentModal 
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    commentId={selectedComment.id}
                    onCommentDeleted={fetchComments}
                />
            )}
        </div>
    );
}