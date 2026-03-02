const asyncHandler = require('express-async-handler');
const productService = require('../services/productService');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const products = await productService.getProducts(req.query);
    res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    console.log('--- CREATE PRODUCT ---');
    console.log('Headers:', req.headers['content-type']);
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const productData = { ...req.body };
    if (req.file) {
        productData.image = `/uploads/${req.file.filename}`;
    }

    try {
        const product = await productService.createProduct(productData);
        return res.status(201).json(product);
    } catch (error) {
        console.error('Service Error:', error);
        res.status(400);
        throw error;
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const productData = { ...req.body };
    if (req.file) {
        productData.image = `/uploads/${req.file.filename}`;
    }
    const updatedProduct = await productService.updateProduct(req.params.id, productData);
    return res.json(updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const message = await productService.deleteProduct(req.params.id);
    res.json(message);
});

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
