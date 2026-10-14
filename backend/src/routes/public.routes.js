const { Router } = require('express');
const hospital = require('../controllers/hospital.controller');
const { dateQueryRule } = require('../validators/session.validator');

const router = Router();

router.get('/hospitals', hospital.list);
router.get('/hospitals/:id', hospital.getById);
router.get('/hospitals/:id/departments', hospital.departments);
router.get('/hospitals/:id/doctors', hospital.doctors);
router.get('/doctors/:id/sessions', dateQueryRule, hospital.doctorSessions);

module.exports = router;