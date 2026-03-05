const express = require('express');
const router = express.Router();
const { getAllUsers, getPendingUsers, approveUser, rejectUser, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/', getAllUsers);
router.get('/pending', getPendingUsers);
router.put('/:id/approve', approveUser);
router.put('/:id/reject', rejectUser);
router.delete('/:id', deleteUser);

module.exports = router;