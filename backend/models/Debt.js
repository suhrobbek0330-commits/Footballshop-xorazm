const mongoose = require('mongoose');

const debtSchema = mongoose.Schema({
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        productName: String,
        quantity: Number,
        price: Number
    }],
    totalAmount: { type: Number, required: true },
    deadline: { type: Date, required: true },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
    },
    remindersSent: { type: Number, default: 0 }
}, {
    timestamps: true,
});

const Debt = mongoose.model('Debt', debtSchema);
module.exports = Debt;
