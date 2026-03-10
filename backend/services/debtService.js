const Product = require('../models/Product');
const Debt = require('../models/Debt');
const mongoose = require('mongoose');

const createDebt = async (debtData) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { products } = debtData;

        for (const item of products) {
            if (item.product) {
                const product = await Product.findById(item.product).session(session);
                if (product) {
                    if (product.quantity < item.quantity) {
                        throw new Error(`Mahsulot yetarli emas: ${product.name}`);
                    }
                    product.quantity -= item.quantity;
                    product.soldHistory.push({
                        soldPrice: item.price,
                        quantity: item.quantity,
                        date: new Date()
                    });
                    await product.save({ session });
                }
            }
        }

        const debt = await Debt.create([debtData], { session });

        await session.commitTransaction();
        session.endSession();
        return debt[0];
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const getDebts = async (filters) => {
    const keyword = filters.keyword ? {
        customerName: {
            $regex: filters.keyword,
            $options: 'i',
        },
    } : {};

    return await Debt.find({ ...keyword }).sort({ deadline: 1 });
};

const updateDebtStatus = async (id, status) => {
    const debt = await Debt.findById(id);

    if (debt) {
        if (debt.status !== 'paid' && status === 'paid') {
            // Qarz to'langanda uni savdoga qo'shish
            const Sale = require('../models/Sale');
            await Sale.create({
                items: debt.products.map(p => ({
                    product: p.product,
                    productName: p.productName,
                    quantity: p.quantity,
                    price: p.price,
                    subtotal: p.quantity * p.price
                })),
                totalAmount: debt.totalAmount,
                paymentMethod: 'cash', // Odatiy naqd pul
                cashier: null // Qarz to'lashda kassa noma'lum bo'lishi mumkin
            });
        }
        debt.status = status;
        return await debt.save();
    } else {
        throw new Error('Debt not found');
    }
};

const updateDebtAmount = async (id, amount) => {
    const debt = await Debt.findById(id);
    if (!debt) {
        throw new Error('Debt not found');
    }
    debt.totalAmount = amount;
    return await debt.save();
};

const checkOverdueDebts = async () => {
    const now = new Date();
    await Debt.updateMany(
        { deadline: { $lt: now }, status: 'pending' },
        { status: 'overdue' }
    );
};

module.exports = { createDebt, getDebts, updateDebtStatus, updateDebtAmount, checkOverdueDebts };
