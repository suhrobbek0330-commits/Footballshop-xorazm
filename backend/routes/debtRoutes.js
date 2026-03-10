const express = require('express');
const router = express.Router();
const { createDebt, getDebts, updateDebtStatus, updateDebtAmount } = require('../controllers/debtController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .post(createDebt)
    .get(protect, getDebts);

router.route('/:id/pay').put(protect, admin, updateDebtStatus);
router.route('/:id/amount').put(protect, admin, updateDebtAmount);

module.exports = router;
