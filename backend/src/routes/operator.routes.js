const { Router } = require('express');
const c = require('../controllers/operator.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/requireSuperAdmin');
const { validate } = require('../middleware/validate');
const {
  createHospitalRules, patchHospitalRules, createStaffRules,
  resetPasswordRules, toggleActiveRules, listQueryRules,
  idParam, userIdParam,
} = require('../validators/operator.validator');

const router = Router();

// Every operator route requires SUPER_ADMIN.
router.use(authenticate, requireRole('SUPER_ADMIN'), requireSuperAdmin);

router.get('/stats', c.stats);

router.get('/hospitals', validate(listQueryRules), c.listHospitals);
router.post('/hospitals', validate(createHospitalRules), c.createHospital);
router.get('/hospitals/:id', validate(idParam), c.getHospital);
router.patch('/hospitals/:id', validate(idParam.concat(patchHospitalRules)), c.patchHospital);
router.patch('/hospitals/:id/status', validate(idParam), c.setStatus);
router.post('/hospitals/:id/staff', validate(idParam.concat(createStaffRules)), c.createStaff);

router.patch('/users/:userId/password', validate(userIdParam.concat(resetPasswordRules)), c.resetPassword);
router.patch('/users/:userId/active', validate(userIdParam.concat(toggleActiveRules)), c.toggleActive);

module.exports = router;