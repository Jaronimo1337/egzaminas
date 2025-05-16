// @ts-check
import express from 'express';
import {
    getUserProductsSortedPaginated,
    getUserProductsByUserName,
    getRatedProductsByUserName,
    getProductById,
    getUserProducts,
    createProduct,
    editProduct,
    deleteProduct,
    getAllProducts,
    getSearchRegex,
    createBookmark,
    deleteBookmark,
    checkBookmarkStatus
} from '../controllers/productController.js';
import protect from '../validators/validateJWT.js';
import validate from '../middlewares/validate.js';
import validateSearchQuery from '../validators/validateSearch.js';
import validateCreateProduct from '../validators/validateCreateProduct.js';
import validateEditProduct from '../validators/validateEditProduct.js';
import { getPaginatedProducts } from '../controllers/paginatedProductController.js';

/**@type {express.Router}*/
const productRouter = express.Router();

productRouter.route('/').get(getPaginatedProducts);
productRouter
    .route('/search')
    .get(validateSearchQuery, validate, getAllProducts);

productRouter.route('/searchregex').get(getSearchRegex);
productRouter.route('/u/:username').get(getUserProductsByUserName);
productRouter.route('/rated/:username').get(getRatedProductsByUserName);
productRouter.route('/:id').get(getUserProducts);
productRouter.route('/selected/:id').get(getProductById);
productRouter.route('/user/:id').get(getUserProductsSortedPaginated);

// Protected routes - require authentication
productRouter.use(protect);

// Existing protected routes
productRouter
    .route('/user')
    .post(validateCreateProduct, validate, createProduct);
productRouter
    .route('/user/p/:productId')
    .patch(validateEditProduct, validate, editProduct)
    .delete(deleteProduct);

// New bookmark routes
productRouter.route('/bookmarks/:productId')
    .post(createBookmark)
    .delete(deleteBookmark)
    .get(checkBookmarkStatus);

export default productRouter;