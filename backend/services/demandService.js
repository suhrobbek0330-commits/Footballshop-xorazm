const Demand = require('../models/Demand');

const createDemand = async (demandData) => {
    return await Demand.create(demandData);
};

const getDemands = async () => {
    return await Demand.find({ fulfilled: false });
};

const markFulfilled = async (id) => {
    const demand = await Demand.findById(id);
    if (demand) {
        demand.fulfilled = true;
        return await demand.save();
    } else {
        throw new Error('Demand request not found');
    }
};

module.exports = { createDemand, getDemands, markFulfilled };
