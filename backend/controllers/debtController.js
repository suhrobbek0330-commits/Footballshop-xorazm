const asyncHandler = require('express-async-handler');
const debtService = require('../services/debtService');

// @desc    Create new debt
// @route   POST /api/debts
// @access  Private
const createDebt = asyncHandler(async (req, res) => {
    const debt = await debtService.createDebt(req.body);
    res.status(201).json(debt);
});

// @desc    Get all debts
// @route   GET /api/debts
// @access  Private
const getDebts = asyncHandler(async (req, res) => {
    const debts = await debtService.getDebts(req.query);
    res.json(debts);
});

// @desc    Update debt status
// @route   PUT /api/debts/:id/pay
// @access  Private
const updateDebtStatus = asyncHandler(async (req, res) => {
    const debt = await debtService.updateDebtStatus(req.params.id, req.body.status);
    res.json(debt);
});

module.exports = { createDebt, getDebts, updateDebtStatus };
