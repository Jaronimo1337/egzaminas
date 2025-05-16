import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import url from '../../../helpers/getURL';
import { toast } from 'react-toastify';
import Modal from 'react-modal';


if (typeof window !== 'undefined') {
    Modal.setAppElement('#root'); 
}

export default function EditCommentModal({ 
    isOpen, 
    onClose, 
    comment, 
    productId, 
    onCommentUpdated 
}) {
    const [editedComment, setEditedComment] = useState('');
    const [editedStars, setEditedStars] = useState(5);
    const [hoveredStar, setHoveredStar] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Initialize form with current comment data when opened
    useEffect(() => {
        if (comment) {
            setEditedComment(comment.comment || '');
            setEditedStars(comment.stars || 5);
        }
    }, [comment, isOpen]);

    const handleStarClick = (rating) => {
        setEditedStars(rating);
    };

    const handleStarHover = (rating) => {
        setHoveredStar(rating);
    };

    const handleStarLeave = () => {
        setHoveredStar(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!editedComment.trim()) {
            setError('Comment cannot be empty');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            // Send the updated comment to the server
            const response = await axios.patch(
                url(`comments/comment/${comment.id}`),
                {
                    product_id: productId,
                    comment: editedComment,
                    stars: editedStars
                },
                {
                    withCredentials: true
                }
            );

            if (response.data.status === 'success') {
                toast.success('Comment updated successfully!', {
                    position: 'top-center',
                    autoClose: 3000,
                });
                
                // Close the modal
                onClose();
                
                // Notify parent component to refresh comments
                if (onCommentUpdated) {
                    onCommentUpdated();
                }
            }
        } catch (err) {
            console.error('Error updating comment:', err);
            setError(err.response?.data?.message || 'Failed to update comment');
            toast.error('Failed to update comment. Please try again.', {
                position: 'top-center',
                autoClose: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Edit Comment"
            className="fixed inset-0 flex items-center justify-center z-50"
            overlayClassName="fixed inset-0 bg-black/50 backdrop-blur"
        >
            <div className="bg-white p-6 rounded-lg w-full max-w-md mx-auto relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-black text-2xl"
                    disabled={isSubmitting}
                >
                    &times;
                </button>

                <h3 className="text-xl font-bold mb-4 text-gray-800">
                    Edit Your Comment
                </h3>
                
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
                        {error}
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
                                        (hoveredStar || editedStars) >= rating
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
                        <label htmlFor="editedComment" className="block text-gray-700 mb-2">
                            Your Comment
                        </label>
                        <textarea
                            id="editedComment"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            rows="4"
                            value={editedComment}
                            onChange={(e) => setEditedComment(e.target.value)}
                            placeholder="Share your thoughts about this product..."
                            disabled={isSubmitting}
                        ></textarea>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 rounded-md text-white ${
                                isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-red-500 hover:bg-red-600'
                            }`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Comment'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}