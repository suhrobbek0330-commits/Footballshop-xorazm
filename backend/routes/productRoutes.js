const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
    .get(getProducts)
    .post(upload.single('image'), protect, admin, createProduct);

router.route('/:id')
    .get(getProductById)
    .put(upload.single('image'), protect, admin, updateProduct) // Optional image update
    .delete(protect, admin, deleteProduct);

module.exports = router;
