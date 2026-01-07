const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const dataController = require('../controllers/dataController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/pools', dataController.getAllPools);

router.post('/stake', verifyToken, dataController.stakeTokens);
router.get('/my-stakes', verifyToken, dataController.getMyStakes);
router.post('/claim', verifyToken, dataController.claimReward);
router.put('/profile', verifyToken, authController.updateProfile);

router.post('/pools', [verifyToken, isAdmin], dataController.createPool);

module.exports = router;