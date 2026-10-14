// const { Router } = require('express');
// const authRoutes = require('./auth.routes');
// const publicRoutes = require('./public.routes');
// const adminRoutes = require('./admin.routes');
// const receptionistRoutes = require('./receptionist.routes');

// const router = Router();

// router.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
// router.use('/auth', authRoutes);
// router.use('/', publicRoutes);
// router.use('/admin', adminRoutes);
// router.use('/', receptionistRoutes);

// module.exports = router;

// const { Router } = require('express');
// const authRoutes = require('./auth.routes');
// const publicRoutes = require('./public.routes');
// const adminRoutes = require('./admin.routes');
// const receptionistRoutes = require('./receptionist.routes');
// const patientRoutes = require('./patient.routes');

// const router = Router();

// router.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
// router.use('/auth', authRoutes);
// router.use('/', publicRoutes);
// router.use('/admin', adminRoutes);
// router.use('/', receptionistRoutes);
// router.use('/', patientRoutes);

// module.exports = router;


const { Router } = require('express');
const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const publicRoutes = require('./public.routes');
const adminRoutes = require('./admin.routes');
const receptionistRoutes = require('./receptionist.routes');
const doctorRoutes = require('./doctor.routes'); // NEW
const operatorRoutes = require('./operator.routes'); // NEW


const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
router.use('/operator', operatorRoutes);
router.use('/auth', authRoutes);
router.use('/', publicRoutes);
router.use('/', patientRoutes);
router.use('/admin', adminRoutes);
router.use('/', receptionistRoutes);
router.use('/doctor', doctorRoutes); // NEW — /doctor/today, /doctor/queue, /doctor/tokens/:id/*

module.exports = router;