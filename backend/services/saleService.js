const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Debt = require('../models/Debt');
const mongoose = require('mongoose');

const createSale = async (saleData, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { items, totalAmount, paymentMethod } = saleData;
        let finalItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product).session(session);

            if (!product) {
                throw new Error(`Product not found: ${item.productName}`);
            }

            if (product.quantity < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}`);
            }

            product.quantity -= item.quantity;
            product.soldHistory.push({
                soldPrice: item.price,
                quantity: item.quantity,
                date: new Date()
            });

            await product.save({ session });

            finalItems.push({
                product: product._id,
                productName: product.name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.quantity * item.price
            });
        }

        const sale = await Sale.create([{
            items: finalItems,
            totalAmount,
            paymentMethod,
            cashier: userId || null
        }], { session });

        await session.commitTransaction();
        session.endSession();

        return sale[0];
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const getSalesStats = async (period = 'daily') => {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);

    if (period === 'daily') {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    } else if (period === 'weekly') {
        // Last 7 days
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    } else if (period === 'monthly') {
        // Last 30 days
        start.setDate(now.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }

    // Pipeline to calculate stats from Sales (Paid)
    const saleStatsPipeline = [
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $unwind: '$items' },
        {
            $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'productInfo'
            }
        },
        { $unwind: '$productInfo' },
        {
            $project: {
                totalAmount: 1,
                quantity: '$items.quantity',
                revenue: '$items.subtotal',
                cost: { $multiply: ['$productInfo.originalPrice', '$items.quantity'] },
                category: '$productInfo.category'
            }
        },
        {
            $group: {
                _id: null,
                paidRevenue: { $sum: '$revenue' },
                paidCount: { $sum: 1 },
                paidItemsSold: { $sum: '$quantity' },
                paidCost: { $sum: '$cost' }
            }
        }
    ];

    // Pipeline to calculate stats from Debts (Unpaid/Pending)
    const debtStatsPipeline = [
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $unwind: '$products' },
        {
            $lookup: {
                from: 'products',
                localField: 'products.product',
                foreignField: '_id',
                as: 'productInfo'
            }
        },
        { $unwind: '$productInfo' },
        {
            $project: {
                quantity: '$products.quantity',
                revenue: { $multiply: ['$products.price', '$products.quantity'] },
                cost: { $multiply: ['$productInfo.originalPrice', '$products.quantity'] },
                status: 1
            }
        },
        {
            $group: {
                _id: null,
                debtRevenue: { $sum: '$revenue' },
                debtItemsSold: { $sum: '$quantity' },
                debtCost: { $sum: '$cost' },
                pendingDebtSum: {
                    $sum: { $cond: [{ $ne: ['$status', 'paid'] }, '$revenue', 0] }
                }
            }
        }
    ];

    const [saleStats] = await Sale.aggregate(saleStatsPipeline);
    const [debtStats] = await Debt.aggregate(debtStatsPipeline);

    const s = saleStats || { paidRevenue: 0, paidCount: 0, paidItemsSold: 0, paidCost: 0 };
    const d = debtStats || { debtRevenue: 0, debtItemsSold: 0, debtCost: 0, pendingDebtSum: 0 };

    const totalRevenue = s.paidRevenue; // Actual money in
    const totalVolume = s.paidRevenue + d.debtRevenue; // Total value of goods gone
    const totalItemsSold = s.paidItemsSold + d.debtItemsSold;
    const totalCost = s.paidCost + d.debtCost;
    const totalProfit = totalVolume - totalCost;

    // Category Stats from Sales
    const saleCategoryStats = await Sale.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $unwind: '$items' },
        {
            $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'productInfo'
            }
        },
        { $unwind: '$productInfo' },
        {
            $group: {
                _id: '$productInfo.category',
                totalRevenue: { $sum: '$items.subtotal' },
                count: { $sum: '$items.quantity' }
            }
        }
    ]);

    // Category Stats from Debts
    const debtCategoryStats = await Debt.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $unwind: '$products' },
        {
            $lookup: {
                from: 'products',
                localField: 'products.product',
                foreignField: '_id',
                as: 'productInfo'
            }
        },
        { $unwind: '$productInfo' },
        {
            $group: {
                _id: '$productInfo.category',
                totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
                count: { $sum: '$products.quantity' }
            }
        }
    ]);

    // Combine Category Stats
    const combinedCategories = {};
    [...saleCategoryStats, ...debtCategoryStats].forEach(item => {
        const catId = item._id || 'Noma\'lum';
        if (!combinedCategories[catId]) {
            combinedCategories[catId] = { _id: catId, totalRevenue: 0, count: 0 };
        }
        combinedCategories[catId].totalRevenue += item.totalRevenue;
        combinedCategories[catId].count += item.count;
    });

    // Trend Stats (Daily grouping)
    const trendStats = await Sale.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                revenue: { $sum: "$totalAmount" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const debtTrendStats = await Debt.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                revenue: { $sum: "$totalAmount" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Combine Trend
    const trendMap = {};
    trendStats.forEach(item => {
        trendMap[item._id] = (trendMap[item._id] || 0) + item.revenue;
    });
    debtTrendStats.forEach(item => {
        trendMap[item._id] = (trendMap[item._id] || 0) + item.revenue;
    });

    const trend = Object.keys(trendMap).sort().map(dateStr => ({
        date: dateStr,
        revenue: trendMap[dateStr]
    }));

    return {
        summary: {
            totalRevenue,
            totalVolume,
            totalProfit,
            totalItemsSold,
            totalSalesCount: s.paidCount,
            pendingDebts: d.pendingDebtSum
        },
        categories: Object.values(combinedCategories),
        trend
    };
};

module.exports = { createSale, getSalesStats };
