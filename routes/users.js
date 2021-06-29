const router = require('express').Router();

const validation = require('../middlewares/validation');

const {
  getUsers,
  getUserById,
  updateProfile,
  updateAvatar,
  getUserInfo,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getUserInfo);

router.get('/:userId',
  validation('params', ['userId']),
  getUserById);

router.patch('/me',
  validation('body', ['name', 'about']),
  updateProfile);

router.patch('/me/avatar',
  validation('body', ['avatar']),
  updateAvatar);

module.exports = router;
