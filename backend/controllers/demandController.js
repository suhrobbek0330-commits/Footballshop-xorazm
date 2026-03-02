const asyncHandler = require('express-async-handler');
const demandService = require('../services/demandService');

// @desc    Create new demand
// @route   POST /api/demands
// @access  Private
const createDemand = asyncHandler(async (req, res) => {
    const demand = await demandService.createDemand(req.body);
    res.status(201).json(demand);
});

// @desc    Get unfulfilled demands
// @route   GET /api/demands
// @access  Private
const getDemands = asyncHandler(async (req, res) => {
    const demands = await demandService.getDemands();
    res.json(demands);
});

// @desc    Mark demand as fulfilled
// @route   PUT /api/demands/:id/fulfill
// @access  Private
const markFulfilled = asyncHandler(async (req, res) => {
    const demand = await demandService.markFulfilled(req.params.id);
    res.json(demand);
});

module.exports = { createDemand, getDemands, markFulfilled };
