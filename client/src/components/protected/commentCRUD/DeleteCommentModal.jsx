import { useState } from 'react';
import axios from 'axios';
import url from '../../../helpers/getURL';
import { toast } from 'react-toastify';
import Modal from 'react-modal';

export default function DeleteCommentModal({ 
    isOpen, 
    onClose, 
    commentId, 
    onCommentDeleted 
}) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            setError(null);

            // Send the delete request to the server
            const response = await axios.delete(
                url(`comments/comment/${commentId}`),
                {
                    withCredentials: true
                }
            );

            if (response.data.status === 'success') {
                toast.success('Comment deleted successfully!', {
                    position: 'top-center',
                    autoClose: 3000,
                });
                
                // Close the modal
                onClose();
                
                // Notify parent component to refresh comments
                if (onCommentDeleted) {
                    onCommentDeleted();
                }
            }
        } catch (err) {
            console.error('Error deleting comment:', err);
            setError(err.response?.data?.message || 'Failed to delete comment');
            toast.error('Failed to delete comment. Please try again.', {
                position: 'top-center',
                autoClose: 3000,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Delete Comment"
            className="fixed inset-0 flex items-center justify-center z-50"
            overlayClassName="fixed inset-0 bg-black/50 backdrop-blur"
        >
            <div className="bg-white p-6 rounded-lg w-full max-w-md mx-auto relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-black text-2xl"
                    disabled={isDeleting}
                >
                    &times;
                </button>

                <h3 className="text-xl font-bold mb-4 text-gray-800">
                    Delete Comment
                </h3>
                
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
                        {error}
                    </div>
                )}
                
                <p className="mb-6 text-gray-700">
                    Are you sure you want to delete this comment? This action cannot be undone.
                </p>
                
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className={`px-4 py-2 rounded-md text-white ${
                            isDeleting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600'
                        }`}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Comment'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}