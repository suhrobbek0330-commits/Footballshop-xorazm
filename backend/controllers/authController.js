const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');
const User = require('../models/User');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const userData = await authService.loginUser(email, password);
    res.json(userData);
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
    const userData = await authService.registerUser(req.body);
    res.status(201).json(userData);
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/SuperAdmin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// @desc    Update user role
// @route   PUT /api/auth/users/:id/role
// @access  Private/SuperAdmin
const updateUserRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.role = req.body.role || user.role;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = { login, register, getUsers, updateUserRole };
