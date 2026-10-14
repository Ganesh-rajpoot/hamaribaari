
const { Router } = require('express');
const c = require('../controllers/patient.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { idParamRule, createTokenRules } = require('../validators/token.validator');

const router = Router();
const guard = [authenticate, requireRole('PATIENT')];

router.post('/tokens',            guard, validate(createTokenRules), c.joinQueue);
router.get('/tokens/my',          guard, c.myTokens);
router.get('/tokens/:id',         guard, validate(idParamRule),      c.getToken);
router.patch('/tokens/:id/cancel', guard, validate(idParamRule),     c.cancelToken);

module.exports = router;