const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    color: { type: String },
    size: { type: String },
    quantity: { type: Number, required: true, default: 0 },
    originalPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    image: { type: String },
    lowStockThreshold: { type: Number, default: 5 },
    soldHistory: [{
        soldPrice: Number,
        quantity: Number,
        date: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
