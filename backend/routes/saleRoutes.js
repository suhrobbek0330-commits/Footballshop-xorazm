const express = require('express');
const router = express.Router();
const { createSale, getSalesStats } = require('../controllers/saleController');
const { protect, admin, authorize } = require('../middlewares/authMiddleware');

router.route('/').post(createSale);
router.route('/stats').get(protect, authorize('admin', 'superadmin'), getSalesStats);

module.exports = router;
