const express = require('express');
const router = express.Router();
const { createDemand, getDemands, markFulfilled } = require('../controllers/demandController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .post(createDemand)
    .get(protect, getDemands);

router.route('/:id/fulfill').put(protect, markFulfilled);

module.exports = router;
