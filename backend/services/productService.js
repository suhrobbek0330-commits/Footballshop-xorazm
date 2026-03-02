const Product = require('../models/Product');

const getProducts = async (filters) => {
    const keyword = filters.keyword ? {
        name: {
            $regex: filters.keyword,
            $options: 'i',
        },
    } : {};

    return await Product.find({ ...keyword });
};

const getProductById = async (id) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new Error('Product not found');
    }
    return product;
};

const createProduct = async (productData) => {
    return await Product.create(productData);
};

const updateProduct = async (id, productData) => {
    const product = await Product.findById(id);

    if (product) {
        Object.assign(product, productData);
        return await product.save();
    } else {
        throw new Error('Product not found');
    }
};

const deleteProduct = async (id) => {
    const product = await Product.findById(id);

    if (product) {
        await product.deleteOne();
        return { message: 'Product removed' };
    } else {
        throw new Error('Product not found');
    }
};

const restockProduct = async (id, quantity) => {
    const product = await Product.findById(id);
    if (product) {
        product.quantity += Number(quantity);
        return await product.save();
    } else {
        throw new Error('Product not found');
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    restockProduct
};
