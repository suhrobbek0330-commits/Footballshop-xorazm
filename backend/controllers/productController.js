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

// Helper: parse variants from form data
const parseVariants = (body) => {
    if (body.variants) {
        try {
            const parsed = typeof body.variants === 'string'
                ? JSON.parse(body.variants)
                : body.variants;
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
    return [];
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    console.log('--- CREATE PRODUCT ---');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const productData = { ...req.body };
    if (req.file) {
        productData.image = `/uploads/${req.file.filename}`;
    }

    // Parse variants JSON
    productData.variants = parseVariants(req.body);

    // Jami miqdorni variantlardan hisoblash
    if (productData.variants.length > 0) {
        productData.quantity = productData.variants.reduce(
            (sum, v) => sum + (Number(v.quantity) || 0), 0
        );
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

    // Parse variants JSON
    productData.variants = parseVariants(req.body);

    // Jami miqdorni variantlardan hisoblash
    if (productData.variants.length > 0) {
        productData.quantity = productData.variants.reduce(
            (sum, v) => sum + (Number(v.quantity) || 0), 0
        );
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
