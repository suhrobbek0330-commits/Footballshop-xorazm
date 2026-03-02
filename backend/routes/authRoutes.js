const express = require('express');
const router = express.Router();
const { login, register, getUsers, updateUserRole } = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/users', protect, authorize('superadmin'), getUsers);
router.put('/users/:id/role', protect, authorize('superadmin'), updateUserRole);

module.exports = router;
