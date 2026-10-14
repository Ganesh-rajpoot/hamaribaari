const { Router } = require('express');
const c = require('../controllers/receptionist.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const { requireHospital } = require('../middleware/requireHospital');
const { validate } = require('../middleware/validate');
const { cancelRules } = require('../validators/session.validator');
const { walkInRules, reasonRules } = require('../validators/token.validator');
const { param } = require('express-validator');

const router = Router();

// Guard applied per-route (NOT router.use) so it doesn't leak into other routers.
const guard = [authenticate, requireRole('RECEPTIONIST', 'HOSPITAL_ADMIN'), requireHospital];

// Define idParamRule locally here to avoid cross-import clashes.
const idParamRule = [param('id').isUUID()];

// Session lifecycle
router.get('/receptionist/today', guard, c.today);
router.get('/sessions/:id', guard, validate(idParamRule), c.getSession);

router.post('/sessions/:id/open',        guard, validate(idParamRule), c.open);
router.post('/sessions/:id/pause',       guard, validate(idParamRule), c.pause);
router.post('/sessions/:id/resume',      guard, validate(idParamRule), c.resume);
router.post('/sessions/:id/close',       guard, validate(idParamRule), c.close);
router.post('/sessions/:id/unavailable', guard, validate(idParamRule), c.unavailable);
router.post('/sessions/:id/cancel',
  guard,
  validate(idParamRule.concat(cancelRules)),
  c.cancel,
);

// Queue reads
router.get('/sessions/:id/queue', guard, validate(idParamRule), c.getQueue);

// Walk-in
router.post('/sessions/:id/walk-in',
  guard,
  validate(idParamRule.concat(walkInRules)),
  c.createWalkIn,
);

// Token actions
const tokenGuard = (chain = []) => [guard, validate(idParamRule.concat(chain))];

router.patch('/tokens/:id/arrive',     ...tokenGuard(), c.arrive);
router.patch('/tokens/:id/call',       ...tokenGuard(), c.call);
router.patch('/tokens/:id/start',      ...tokenGuard(), c.start);
router.patch('/tokens/:id/complete',   ...tokenGuard(), c.complete);
router.patch('/tokens/:id/skip',       ...tokenGuard(reasonRules), c.skip);
router.patch('/tokens/:id/recall',     ...tokenGuard(), c.recall);
router.patch('/tokens/:id/put-at-end', ...tokenGuard(), c.putAtEnd);
router.patch('/tokens/:id/no-show',    ...tokenGuard(reasonRules), c.noShow);

module.exports = router;