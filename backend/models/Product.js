const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    size: { type: String, default: '' },   // "XS", "S", "M", "L", "XL", "XXL", "40", "41" ...
    color: { type: String, default: '' },  // "Oq", "Qora", "Ko'k" ...
    quantity: { type: Number, default: 0 }
}, { _id: false });

const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    // Eski fieldlar — orqaga muvofiqlik uchun saqlanadi
    color: { type: String, default: '' },
    size: { type: String, default: '' },
    // Yangi variantlar
    variants: { type: [variantSchema], default: [] },
    // Jami miqdor — variantlar yig'indisi (yoki oddiy quantity)
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
