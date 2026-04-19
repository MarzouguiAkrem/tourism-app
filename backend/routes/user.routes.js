const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { paginate } = require('../middleware/pagination.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');
const {
  updateProfileSchema,
  updatePreferencesSchema,
  changePasswordSchema,
  updateUserAdminSchema,
} = require('../validators/user.validator');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  updatePreferences,
  changePassword,
  updateAvatar,
} = require('../controllers/user.controller');

// All routes below require authentication
router.use(protect);

// ── Self profile routes ─────────────────────
router.get('/profile/me', getProfile);
router.put('/profile/me', validate(updateProfileSchema), updateProfile);
router.put('/profile/me/preferences', validate(updatePreferencesSchema), updatePreferences);
router.put('/profile/me/password', validate(changePasswordSchema), changePassword);
router.put('/profile/me/avatar', uploadSingle('avatar'), updateAvatar);

// ── Admin routes ────────────────────────────
router.get('/', authorize('admin'), paginate, getUsers);
router.get('/:id', authorize('admin'), getUser);
router.put('/:id', authorize('admin'), validate(updateUserAdminSchema), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
