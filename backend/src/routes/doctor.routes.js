// const { Router } = require('express');
// const c = require('../controllers/doctor.controller');
// const { authenticate, requireRole } = require('../middleware/auth');
// const { validate } = require('../middleware/validate');
// const { idParamRule, reasonRules } = require('../validators/token.validator');

// const router = Router();

// router.use(authenticate, requireRole('DOCTOR'));

// router.get('/today', c.today);
// router.get('/queue', c.queue);

// router.patch('/tokens/:id/start',    validate(idParamRule), c.start);
// router.patch('/tokens/:id/complete', validate(idParamRule), c.complete);
// router.patch('/tokens/:id/skip',     validate(idParamRule.concat(reasonRules)), c.skip);

// module.exports = router;


const { Router } = require('express');
const c = require('../controllers/doctor.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { idParamRule, reasonRules } = require('../validators/token.validator');

const router = Router();
const guard = [authenticate, requireRole('DOCTOR')];

router.get('/today', guard, c.today);
router.get('/queue', guard, c.queue);

router.patch('/tokens/:id/start',    guard, validate(idParamRule), c.start);
router.patch('/tokens/:id/complete', guard, validate(idParamRule), c.complete);
router.patch('/tokens/:id/skip',     guard, validate(idParamRule.concat(reasonRules)), c.skip);

module.exports = router;