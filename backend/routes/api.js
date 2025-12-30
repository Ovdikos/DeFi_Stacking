const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const dataController = require('../controllers/dataController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/pools', dataController.getAllPools);

// Protected Routes (Logged in users)
router.post('/stake', verifyToken, dataController.stakeTokens);
router.get('/my-stakes', verifyToken, dataController.getMyStakes);

// Admin Routes
router.post('/pools', [verifyToken, isAdmin], dataController.createPool);

module.exports = router;