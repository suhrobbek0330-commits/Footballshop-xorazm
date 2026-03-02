const asyncHandler = require('express-async-handler');
const saleService = require('../services/saleService');

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
const createSale = asyncHandler(async (req, res) => {
    const sale = await saleService.createSale(req.body, req.user?._id);
    res.status(201).json(sale);
});

// @desc    Get sales statistics
// @route   GET /api/sales/stats
// @access  Private/Admin
const getSalesStats = asyncHandler(async (req, res) => {
    const period = req.query.period || 'daily';
    const stats = await saleService.getSalesStats(period);
    res.json(stats);
});

module.exports = { createSale, getSalesStats };
