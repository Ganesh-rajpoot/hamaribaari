const { api, login, auth } = require('./helpers');
const { makeHospital, makeUser, makeDepartment, makeDoctor, makeSession, PWD } = require('./factories');
const prisma = require('../src/config/prisma');

describe('Walk-in tokens', () => {
  let session, receptTok, hospital;

  beforeEach(async () => {
    hospital = await makeHospital();
    await makeUser({ role: 'RECEPTIONIST', hospitalId: hospital.id, mobile: '9400000001', password: 'Recp1234' });
    const dept = await makeDepartment(hospital.id, 'GEN');
    const { profile } = await makeDoctor({ hospitalId: hospital.id, departmentId: dept.id, mobile: '9400000002' });
    session = await makeSession(hospital.id, profile.id, { status: 'OPEN' });
    receptTok = await login('9400000001', 'Recp1234');
  });

  test('walk-in creates patient + token with ARRIVED', async () => {
    const r = await api().post(`/api/v1/sessions/${session.id}/walk-in`).set(auth(receptTok))
      .send({ patientName: 'Walkin One', patientMobile: '9500000001' });
    expect(r.status).toBe(201);
    expect(r.body.token.source).toBe('WALK_IN');
    expect(r.body.token.arrivalStatus).toBe('ARRIVED');

    const patient = await prisma.user.findUnique({ where: { mobile: '9500000001' } });
    expect(patient).toBeTruthy();
    expect(patient.role).toBe('PATIENT');
  });

  test('walk-in reuses existing patient by mobile', async () => {
    const patient = await makeUser({ mobile: '9500000002', password: PWD });
    const r = await api().post(`/api/v1/sessions/${session.id}/walk-in`).set(auth(receptTok))
      .send({ patientName: 'Different Name', patientMobile: '9500000002' });
    expect(r.status).toBe(201);
    const count = await prisma.user.count({ where: { mobile: '9500000002' } });
    expect(count).toBe(1);
    expect(r.body.token.patientId).toBe(patient.id);
  });

  test('shared counter: online then walk-in produces 1 then 2', async () => {
    const pt = await makeUser({ mobile: '9500000003', password: PWD });
    const ptTok = await login(pt.mobile, PWD);
    const online = await api().post('/api/v1/tokens').set(auth(ptTok)).send({ sessionId: session.id });
    expect(online.body.token.tokenNumber).toBe(1);

    const walk = await api().post(`/api/v1/sessions/${session.id}/walk-in`).set(auth(receptTok))
      .send({ patientName: 'W', patientMobile: '9500000004' });
    expect(walk.body.token.tokenNumber).toBe(2);
  });

  test('walk-in rejected on paused session', async () => {
    await prisma.oPDSession.update({ where: { id: session.id }, data: { status: 'PAUSED' } });
    const r = await api().post(`/api/v1/sessions/${session.id}/walk-in`).set(auth(receptTok))
      .send({ patientName: 'X', patientMobile: '9500000005' });
    expect(r.status).toBe(409);
  });
});