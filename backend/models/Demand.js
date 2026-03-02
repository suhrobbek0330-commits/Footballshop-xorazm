const mongoose = require('mongoose');

const demandSchema = mongoose.Schema({
    productName: { type: String, required: true },
    requestedCount: { type: Number, default: 1 },
    customerContact: { type: String },
    fulfilled: { type: Boolean, default: false }
}, {
    timestamps: true,
});

const Demand = mongoose.model('Demand', demandSchema);
module.exports = Demand;
