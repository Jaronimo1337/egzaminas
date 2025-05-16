import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import url from '../../../helpers/getURL';
import { toast } from 'react-toastify';
import loginMe from '../../../helpers/loginMe';

export default function CommentForm({ productId, onCommentAdded, isLoggedIn }) {
    const [comment, setComment] = useState('');
    const [stars, setStars] = useState(5);
    const [hoveredStar, setHoveredStar] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleStarClick = (rating) => {
        setStars(rating);
    };

    const handleStarHover = (rating) => {
        setHoveredStar(rating);
    };

    const handleStarLeave = () => {
        setHoveredStar(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isLoggedIn) {
            toast.error('Please log in to add a comment', {
                position: 'top-center',
                autoClose: 3000,
            });
            return;
        }

        if (!comment.trim()) {
            setError('Comment cannot be empty');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            // Get the JWT token from cookies or localStorage
            const userResponse = await loginMe();
            if (userResponse?.data?.status !== 'success') {
                throw new Error('You must be logged in to comment');
            }

            // Send the comment to the server
            const response = await axios.post(
                url('comments/comment'),
                {
                    product_id: productId,
                    comment,
                    stars
                },
                {
                    withCredentials: true
                }
            );

            if (response.data.status === 'success') {
                toast.success('Comment added successfully!', {
                    position: 'top-center',
                    autoClose: 3000,
                });
                
                // Reset the form
                setComment('');
                setStars(5);
                
                // Notify parent component to refresh comments
                if (onCommentAdded) {
                    onCommentAdded();
                }
            }
        } catch (err) {
            console.error('Error submitting comment:', err);
            setError(err.response?.data?.message || 'Failed to add comment');
            toast.error('Failed to add comment. Please try again.', {
                position: 'top-center',
                autoClose: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 my-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Add Your Comment</h3>
            
            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
                    {error}
                </div>
            )}
            
            {!isLoggedIn && (
                <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md mb-4">
                    Please log in to add a comment
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="rating" className="block text-gray-700 mb-2">
                        Rating
                    </label>
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <FaStar
                                key={rating}
                                className={`cursor-pointer text-2xl ${
                                    (hoveredStar || stars) >= rating
                                        ? 'text-yellow-500'
                                        : 'text-gray-300'
                                }`}
                                onClick={() => handleStarClick(rating)}
                                onMouseEnter={() => handleStarHover(rating)}
                                onMouseLeave={handleStarLeave}
                            />
                        ))}
                    </div>
                </div>
                
                <div className="mb-4">
                    <label htmlFor="comment" className="block text-gray-700 mb-2">
                        Your Comment
                    </label>
                    <textarea
                        id="comment"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        rows="4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts about this product..."
                        disabled={isSubmitting || !isLoggedIn}
                    ></textarea>
                </div>
                
                <button
                    type="submit"
                    className={`px-4 py-2 rounded-md text-white ${
                        isSubmitting || !isLoggedIn
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600'
                    }`}
                    disabled={isSubmitting || !isLoggedIn}
                >
                    {isSubmitting ? 'Submitting...' : 'Add Comment'}
                </button>
            </form>
        </div>
    );
}