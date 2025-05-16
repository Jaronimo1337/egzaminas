import { useEffect, useState } from "react";
import { Link } from "react-router";
import { FaStar, FaEdit, FaTrashAlt } from "react-icons/fa";
import { nanoid } from "nanoid";
import moment from "moment";
import { getProductCommentsById } from "../helpers/getProductComments";
import axios from "axios";
import url from "../helpers/getURL";
import CommentForm from "./protected/commentCRUD/CommentForm";
import EditCommentModal from "./protected/commentCRUD/EditCommentModal";
import DeleteCommentModal from "./protected/commentCRUD/DeleteCommentModal";
import loginMe from "../helpers/loginMe";

export default function ProductComments({ productId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getProductCommentsById(productId);

      if (response.data) {
        setAvgRating(response.data.avgRating || 0);
        setTotalRatings(response.data.totalRatings || 0);
      }

      const rawComments = response.data.data || [];

      const commentsWithImages = await Promise.all(
        rawComments.map(async (comment) => {
          try {
            const imgResponse = await axios.get(
              url(`images/c/comment${comment.id}`)
            );

            if (imgResponse.status === 200) {
              return {
                ...comment,
                images: imgResponse.data.data || [],
              };
            } else {
              return { ...comment, images: [] };
            }
          } catch (err) {
            if (err.response?.status === 404) {
              return { ...comment, images: [] };
            } else {
              console.error(`Other error getting comment ${comment.id}:`, err);
              return { ...comment, images: [] };
            }
          }
        })
      );

      setComments(commentsWithImages);
      setLoading(false);
    } catch (err) {
      setError("Failed to load comments");
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComments();

    const checkLoginStatus = async () => {
      try {
        const userResponse = await loginMe();
        const isLoggedInUser = userResponse?.data?.status === "success";
        setIsLoggedIn(isLoggedInUser);

        if (isLoggedInUser && userResponse.data.user) {
          setCurrentUser(userResponse.data.user);
        }
      } catch (error) {
        console.error("Login status check failed:", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, [productId]);

  const handleCommentAdded = () => {
    fetchComments();
  };

  const handleEditClick = (comment) => {
    setSelectedComment(comment);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (comment) => {
    setSelectedComment(comment);
    setDeleteModalOpen(true);
  };

  const canModifyComment = (username) => {
    return isLoggedIn && currentUser && currentUser.username === username;
  };

  if (loading)
    return (
      <div className="text-center p-4 text-gray-800">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500 mx-auto"></div>
        <p className="mt-2">Loading comments...</p>
      </div>
    );
  if (error)
    return (
      <div className="text-center p-4 text-red-500">
        {error}
        <button
          onClick={fetchComments}
          className="ml-2 text-blue-500 underline"
        >
          Try again
        </button>
      </div>
    );

  return (
    <section className="px-4 bg-white  shadow-lg rounded-2xl my-8">
      <h2 className="text-3xl font-semibold text-center mb-4 text-gray-800 pb-2">
        Reviews
      </h2>

      {/* Rating summary */}
      <div className="flex justify-center items-center gap-4 mb-6 border-b  pb-4">
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <FaStar
              key={index}
              className={`text-2xl ${
                index < Math.round(avgRating)
                  ? "text-yellow-500"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <div className="text-xl font-semibold text-gray-800">
          {avgRating.toFixed(1)}
        </div>
        <div className="text-gray-500">
          ({totalRatings} {totalRatings === 1 ? "review" : "reviews"})
        </div>
      </div>

      {/* Add the CommentForm component */}
      <CommentForm
        productId={productId}
        onCommentAdded={handleCommentAdded}
        isLoggedIn={isLoggedIn}
      />

      <h3 className="text-xl font-semibold my-6 text-gray-800">
        Customer Reviews
      </h3>

      {comments.length > 0 ? (
        <div className="space-y-6 mb-6">
          {comments.map((comment) => (
            <div
              key={nanoid(64)}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-5"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-bold flex items-center gap-3 text-gray-800">
                  <span>
                    <Link
                      to={`/users/${comment.username}`}
                      className="hover:underline"
                    >
                      {comment.username}
                    </Link>
                  </span>
                  <div className="flex items-center">
                    {[...Array(comment.stars)].map(() => (
                      <FaStar key={nanoid(64)} className="text-yellow-500" />
                    ))}
                  </div>
                </h2>

                {/* Edit and Delete buttons */}
                {canModifyComment(comment.username) && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(comment)}
                      className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                      aria-label="Edit comment"
                    >
                      <FaEdit className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(comment)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      aria-label="Delete comment"
                    >
                      <FaTrashAlt className="text-lg" />
                    </button>
                  </div>
                )}
              </div>

              <div className="text-gray-500 text-sm mt-1">
                {moment(comment.timestamp).format("MMMM D, YYYY, h:mm a")}
              </div>

              <p className="mt-3 text-gray-700 max-w-full break-words">
                {comment.comment}
              </p>

              {/* Comment images */}
              {comment.images && comment.images.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {comment.images.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`Comment ${comment.id} image ${index + 1}`}
                      className="w-32 h-32 object-cover rounded-md cursor-pointer"
                      onClick={() => setSelectedImage(imageUrl)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-6 mb-6">
          This product doesn't have any reviews yet. Be the first to review!
        </p>
      )}

      {/* Image preview modal */}
      {selectedImage && (
        <div
          className="fixed bottom-0 left-0 bg-black/50 flex items-center justify-center z-50 h-svh w-screen"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Preview image"
            className="max-w-100 max-h-100 rounded-lg shadow-2xl flex items-center justify-center"
          />
        </div>
      )}

      {/* Edit Comment Modal */}
      {selectedComment && (
        <EditCommentModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          comment={selectedComment}
          productId={productId}
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
    </section>
  );
}
