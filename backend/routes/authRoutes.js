const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getAllUsers, updateProfile, updatePassword, deleteAccount, deleteUser, updateRole, addToTeam } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/users', protect, getAllUsers);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.delete('/account', protect, deleteAccount);
router.delete('/users/:id', protect, deleteUser);
router.put('/users/:id/role', protect, updateRole);
router.post('/add-to-team', protect, addToTeam);

module.exports = router;
