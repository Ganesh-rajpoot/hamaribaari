const { api, login, auth } = require('./helpers');
const { makeHospital, makeUser, makeDepartment, makeDoctor, makeSession, PWD } = require('./factories');

describe('Doctor flow', () => {
  let sessionId, docToken, receptTok;

  beforeEach(async () => {
    const hospital = await makeHospital();
    await makeUser({ role: 'RECEPTIONIST', hospitalId: hospital.id, mobile: '9800000001', password: 'Recp1234' });
    const dept = await makeDepartment(hospital.id, 'GEN');
    const { user, profile } = await makeDoctor({ hospitalId: hospital.id, departmentId: dept.id, mobile: '9800000002' });
    const session = await makeSession(hospital.id, profile.id, { status: 'OPEN' });
    sessionId = session.id;

    // doctor login uses factory PWD
    docToken = await login('9800000002', PWD);
    receptTok = await login('9800000001', 'Recp1234');
  });

  test('doctor can start a CALLED token', async () => {
    const pt = await makeUser({ mobile: '9800000010', password: PWD });
    const ptTok = await login(pt.mobile, PWD);
    const r = await api().post('/api/v1/tokens').set(auth(ptTok)).send({ sessionId });
    const tokenId = r.body.token.id;

    await api().patch(`/api/v1/tokens/${tokenId}/call`).set(auth(receptTok)).expect(200);

    const s = await api().patch(`/api/v1/doctor/tokens/${tokenId}/start`).set(auth(docToken));
    expect(s.status).toBe(200);
    expect(s.body.token.status).toBe('IN_CONSULTATION');

    const c = await api().patch(`/api/v1/doctor/tokens/${tokenId}/complete`).set(auth(docToken));
    expect(c.body.token.status).toBe('COMPLETED');
  });

  test('doctor cannot complete a WAITING token', async () => {
    const pt = await makeUser({ mobile: '9800000011', password: PWD });
    const ptTok = await login(pt.mobile, PWD);
    const r = await api().post('/api/v1/tokens').set(auth(ptTok)).send({ sessionId });
    const tokenId = r.body.token.id;
    const c = await api().patch(`/api/v1/doctor/tokens/${tokenId}/complete`).set(auth(docToken));
    expect(c.status).toBe(409);
  });

  test('GET /doctor/queue returns session and next up', async () => {
    const r = await api().get('/api/v1/doctor/queue').set(auth(docToken));
    expect(r.status).toBe(200);
    expect(r.body.session.id).toBe(sessionId);
    expect(Array.isArray(r.body.nextUp)).toBe(true);
  });
});