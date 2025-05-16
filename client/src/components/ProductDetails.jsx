import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import Modal from 'react-modal';
import ProductComments from './ProductComments';
import { nanoid } from 'nanoid';
import getSelectedProduct from '../helpers/getSelectedProducts';
import axios from 'axios';
import { toast } from 'react-toastify';
import loginMe from '../helpers/loginMe';
import url from '../helpers/getURL';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [allImages, setAllImages] = useState([]);

    const [quantity, setQuantity] = useState(1);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [buyLoading, setBuyLoading] = useState(false);
    const [buyError, setBuyError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const productData = await getSelectedProduct(id);
                setProduct(productData);
                console.log(productData);
                setSelectedImage(productData?.image_url);
            } catch (error) {
                console.log(error.message);
            }
        };

        const fetchAllImages = async () => {
            try {
                const res = await axios.get(url(`images/d/product${id}`));
                const urls = res.data.data.map((img) =>
                    typeof img === 'string'
                        ? url(`images/d/product${id}/${img}`)
                        : img.url
                );
                setAllImages(
                    res.data.data.length ? res.data.data : [product?.image_url]
                );
                if (urls.length && !selectedImage) setSelectedImage(urls[0]);
            } catch (e) {
                setAllImages([product?.image_url]);
            }
        };

        const checkLoginStatus = async () => {
            try {
                const userResponse = await loginMe();

                if (userResponse?.data?.status === 'success') {
                    console.log('User is logged in:', userResponse.data);
                    setIsLoggedIn(true);
                } else {
                    console.log('User is not logged in');
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error('Login status check failed:', error);
                setIsLoggedIn(false);
            }
        };

        fetchProduct();
        fetchAllImages();
        checkLoginStatus();
    }, [id]);

    if (!product) {
        return (
            <div className="text-center p-8 ">Loading...</div>
        );
    }

    const stockStatus =
        product.amount_in_stock > 5
            ? 'In Stock'
            : product.amount_in_stock > 0
              ? 'Low in stock'
              : 'Out of stock';

    const stockClass =
        product.amount_in_stock > 5
            ? 'text-green-500'
            : product.amount_in_stock > 0
              ? 'text-yellow-500'
              : 'text-red-500';

    const openModal = () => setModalIsOpen(true);
    const closeModal = () => setModalIsOpen(false);


    const handleThumbnailClick = (url) => {
        setSelectedImage(url);
    };

    const currentIndex = allImages.findIndex((img) => img === selectedImage);

    const handlePrevImage = (e) => {
        e.stopPropagation();
        if (allImages.length > 0) {
            const prevIndex =
                (currentIndex - 1 + allImages.length) % allImages.length;
            setSelectedImage(allImages[prevIndex]);
        }
    };

    const handleNextImage = (e) => {
        e.stopPropagation();
        if (allImages.length > 0) {
            const nextIndex = (currentIndex + 1) % allImages.length;
            setSelectedImage(allImages[nextIndex]);
        }
    };

    const handleBuyClick = () => {
        console.log('Buy button clicked, isLoggedIn:', isLoggedIn);

        if (!isLoggedIn) {
            toast.info('Please log in to make a purchase', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            navigate('/signup');
            return;
        }

        setShowBuyModal(true);
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value <= product.amount_in_stock) {
            setQuantity(value);
        }
    };

    const handleConfirmPurchase = async () => {
        try {
            setBuyLoading(true);
            setBuyError(null);

            // Contact seller logic would go here
            setShowBuyModal(false);
            toast.success('Purchase request sent to seller');
            
        } catch (err) {
            setBuyError(
                err.response?.data?.message || 'Failed to complete purchase'
            );
        } finally {
            setBuyLoading(false);
        }
    };

    const handleCancelPurchase = () => {
        setShowBuyModal(false);
    };

    return (
        <div className="container mx-auto p-4  transition-colors duration-300">
            <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden transition-colors duration-300">
                {/* LEFT SIDE: Main Image and Thumbnails */}
                <div className="w-full md:w-1/2 flex flex-col items-center p-4">
                    {/* Main Image with pretty arrows and swipe */}
                    <div className="relative w-full max-w-2xl h-[600px] flex items-center justify-center overflow-hidden rounded-2xl bg-gray-100 object-cover  shadow-lg">
                        {/* Left Arrow */}
                        {!modalIsOpen && allImages.length > 1 && (
                            <button
                                onClick={handlePrevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-3 rounded-full shadow hover:bg-gray-200 flex items-center justify-center border border-gray-300"
                                aria-label="Previous image"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-gray-700"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                            </button>
                        )}

                        {/* Main Image */}
                        <img
                            src={selectedImage}
                            alt={product.name}
                            className=" w-full object-cover mx-auto  transition-transform duration-300 ease-in-out cursor-pointer"
                            onClick={openModal}
                        />

                        {/* Right Arrow */}
                        {!modalIsOpen && allImages.length > 1 && (
                            <button
                                onClick={handleNextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-3 rounded-full shadow hover:bg-gray-200 flex items-center justify-center border border-gray-300"
                                aria-label="Next image"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-gray-700"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Thumbnails (no arrows here) */}
                    {allImages.length > 1 && (
                        <div className="w-full max-w-md mt-4 flex space-x-2 overflow-x-auto px-8 scrollbar-hide">
                            {allImages.map((img, index) => (
                                <img
                                    key={img}
                                    src={img}
                                    alt={`Thumbnail ${index}`}
                                    onClick={() => handleThumbnailClick(img)}
                                    className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${
                                        selectedImage === img
                                            ? 'border-red-500'
                                            : 'border-transparent'
                                    } hover:border-red-400 transition`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE */}
                <div className="w-full md:w-1/2 p-6 md:p-8">
                    <h1 className="text-3xl font-bold mb-4 text-gray-800 ">
                        {product.name}
                    </h1>

                    <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, index) => (
                            <svg
                                key={nanoid()}
                                className={`w-6 h-6 ${
                                    index < Math.round(product.avgRating)
                                        ? 'text-yellow-500'
                                        : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 .587l3.668 7.568L24 9.423l-6 5.847 1.42 8.293L12 18.897l-7.42 4.666L6 15.27 0 9.423l8.332-1.268z" />
                            </svg>
                        ))}
                        <span className="ml-2 text-gray-600">
                            {product.avgRating} ({product.ratingCount} reviews)
                        </span>
                    </div>

                    <p className="text-2xl font-bold text-red-500 mb-4">
                        ${Number(product.price).toFixed(2)}
                    </p>

                    <p className="text-lg mb-4 text-gray-600">
                        {product.description}
                    </p>

                    <p className={`text-lg font-bold mb-4 ${stockClass}`}>
                        {stockStatus}
                    </p>

                    <p className="text-lg mb-2 text-gray-700">
                        Seller:{' '}
                        <Link
                            to={`/users/${product.User.username}`}
                            className="text-blue-500 hover:underline"
                        >
                            {product.User.username}
                        </Link>
                    </p>

                    <p className="text-lg mb-4 text-gray-700">
                        Contact: {product.User.contacts}
                    </p>

                    {!isLoggedIn && (
                        <p className="text-sm text-red-500 mb-4">
                            Login required to buy
                        </p>
                    )}

                    {product.amount_in_stock > 0 && (
                        <button
                            onClick={handleBuyClick}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-300"
                        >
                            Buy Now
                        </button>
                    )}
                </div>
            </div>

            {/* Product Image Modal */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Product Image Zoom"
                className="fixed inset-0 flex items-center justify-center mt-25"
                overlayClassName="fixed inset-0 bg-black/25 bg-opacity-50 backdrop-blur"
            >
                <div className="bg-white p-4 rounded-lg max-w-4xl mx-auto relative transition-colors duration-300">
                    {/* Close Button */}
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 text-black  text-2xl"
                    >
                        &times;
                    </button>

                    {/* Left Arrow */}
                    {allImages.length > 1 && (
                        <button
                            onClick={handlePrevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-3 rounded-full shadow hover:bg-gray-200 flex items-center justify-center border border-gray-300"
                            aria-label="Previous image"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-gray-700"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                    )}

                    {/* Main Image */}
                    <img
                        src={selectedImage}
                        alt="Zoomed"
                        className="w-full h-auto max-h-screen object-contain rounded-md"
                    />

                    {/* Right Arrow */}
                    {allImages.length > 1 && (
                        <button
                            onClick={handleNextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-3 rounded-full shadow hover:bg-gray-200 flex items-center justify-center border border-gray-300"
                            aria-label="Next image"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-gray-700"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            </Modal>

            {/* Purchase Confirmation Modal */}
            <Modal
                isOpen={showBuyModal}
                onRequestClose={handleCancelPurchase}
                contentLabel="Confirm Purchase"
                className="fixed inset-0 z-50 flex items-center justify-center"
                overlayClassName="fixed z- inset-0 bg-black/50 bg-opacity-50 backdrop-blur"
            >
                <div className="bg-white p-6 rounded-lg w-full max-w-md mx-auto relative transition-colors duration-300">
                    <button
                        onClick={handleCancelPurchase}
                        className="absolute top-4 right-4 text-black  text-2xl"
                        disabled={buyLoading}
                    >
                        &times;
                    </button>

                    <h3 className="text-xl font-bold mb-4 text-gray-800 ">
                        Confirm Purchase
                    </h3>

                    {buyError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {buyError}
                        </div>
                    )}

                    <div className="mb-4">
                        <label
                            htmlFor="quantity"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Quantity
                        </label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            min="1"
                            max={product.amount_in_stock}
                            value={quantity}
                            onChange={handleQuantityChange}
                            className="border border-gray-300 rounded-md px-3 py-2 w-full"
                            disabled={buyLoading}
                        />
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            You are about to purchase:
                        </p>
                        <p className="font-semibold mt-2 text-gray-800 ">
                            {product.name}
                        </p>

                        <div className="flex justify-between mt-2 text-gray-700">
                            <p>Quantity:</p>
                            <p>{quantity}</p>
                        </div>

                        <div className="flex justify-between text-gray-700">
                            <p>Price per item:</p>
                            <p>${Number(product.price).toFixed(2)}</p>
                        </div>

                        <div className="flex justify-between font-bold mt-2 pt-2 border-t text-gray-800 ">
                            <p>Total:</p>
                            <p>${(product.price * quantity).toFixed(2)}</p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                        This will send a purchase request to the seller. You'll be able to arrange payment and delivery details directly with them.
                    </p>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={handleCancelPurchase}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                            disabled={buyLoading}
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleConfirmPurchase}
                            className={`px-4 py-2 rounded-md text-white ${
                                buyLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-red-500 hover:bg-red-600'
                            }`}
                            disabled={buyLoading}
                        >
                            {buyLoading ? 'Processing...' : 'Confirm Purchase'}
                        </button>
                    </div>
                </div>
            </Modal>

            <ProductComments productId={id} />
        </div>
    );
};

export default ProductDetails;