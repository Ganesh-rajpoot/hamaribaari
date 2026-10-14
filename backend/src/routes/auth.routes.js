const { Router } = require('express');
const { register, login, me } = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const { registerRules, loginRules } = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.post('/register', validate(registerRules), register);
router.post('/login', validate(loginRules), login);
router.get('/me', authenticate, me);

module.exports = router;