const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');
const {
  createUser, getUsers, getUser, updateUser, resetPassword, deleteUser,
} = require('../controllers/userController');

router.post('/', authenticate, authorize('user:manage'), createUser);
router.get('/', authenticate, getUsers);
router.get('/:id', authenticate, getUser);
router.put('/:id', authenticate, authorize('user:manage'), updateUser);
router.put('/:id/reset-password', authenticate, authorize('user:manage'), resetPassword);
router.delete('/:id', authenticate, authorize('user:manage'), deleteUser);

module.exports = router;
