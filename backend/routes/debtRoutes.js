const express = require('express');
const router = express.Router();
const { createDebt, getDebts, updateDebtStatus } = require('../controllers/debtController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .post(createDebt)
    .get(protect, getDebts);

router.route('/:id/pay').put(protect, updateDebtStatus);

module.exports = router;
