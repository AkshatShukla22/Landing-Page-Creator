const User = require('../models/userModel');

// @desc    Get all users (admin only)
// @route   GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending approval requests (admin only)
// @route   GET /api/users/pending
const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user', approvalStatus: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a user (admin only)
// @route   PUT /api/users/:id/approve
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot modify admin' });

    user.isApproved = true;
    user.approvalStatus = 'approved';
    user.approvedAt = new Date();
    user.approvedBy = req.user._id;
    user.rejectionReason = '';
    await user.save();

    res.json({ success: true, message: 'User approved successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a user (admin only)
// @route   PUT /api/users/:id/reject
const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot modify admin' });

    user.isApproved = false;
    user.approvalStatus = 'rejected';
    user.rejectionReason = req.body.reason || '';
    await user.save();

    res.json({ success: true, message: 'User rejected', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, getPendingUsers, approveUser, rejectUser, deleteUser };