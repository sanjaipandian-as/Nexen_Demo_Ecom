
import express from 'express';
import {
    addProduct,
    getSellerProducts,
    bulkImportProducts,
    updateProduct,
    deleteProduct,
    getProductsForCustomers,
    filterProductsForCustomers
} from '../controllers/productController.js';
import { authenticate } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Seller routes (protected)
router.post('/add', authenticate, upload.array('images', 5), addProduct);
router.get('/my-products', authenticate, getSellerProducts);
router.post('/bulk-import', authenticate, bulkImportProducts);
router.put('/:productId', authenticate, upload.array('images', 5), updateProduct);
router.delete('/:productId', authenticate, deleteProduct);

// Customer routes (public)
router.get('/customer/page', getProductsForCustomers);
router.get('/customer/filter', filterProductsForCustomers);

export default router;
