const { api, login, auth } = require('./helpers');
const { makeHospital, makeUser, makeDepartment, makeDoctor, makeSession, PWD } = require('./factories');

describe('Patient cancel & PII isolation', () => {
  let sessionId, p1Tok, p1Id, p2Tok;

  beforeEach(async () => {
    const hospital = await makeHospital();
    const dept = await makeDepartment(hospital.id, 'GEN');
    const { profile } = await makeDoctor({ hospitalId: hospital.id, departmentId: dept.id, mobile: '9700000001' });
    const session = await makeSession(hospital.id, profile.id, { status: 'OPEN' });
    sessionId = session.id;

    const p1 = await makeUser({ mobile: '9700000010', password: PWD });
    const p2 = await makeUser({ mobile: '9700000011', password: PWD });
    p1Id = p1.id;
    p1Tok = await login(p1.mobile, PWD);
    p2Tok = await login(p2.mobile, PWD);
  });

  test('owner can cancel WAITING token', async () => {
    const r = await api().post('/api/v1/tokens').set(auth(p1Tok)).send({ sessionId });
    const tokenId = r.body.token.id;
    const c = await api().patch(`/api/v1/tokens/${tokenId}/cancel`).set(auth(p1Tok));
    expect(c.status).toBe(200);
    expect(c.body.token.status).toBe('CANCELLED');
  });

  test('non-owner cannot cancel', async () => {
    const r = await api().post('/api/v1/tokens').set(auth(p1Tok)).send({ sessionId });
    const tokenId = r.body.token.id;
    const c = await api().patch(`/api/v1/tokens/${tokenId}/cancel`).set(auth(p2Tok));
    expect(c.status).toBe(403);
  });

  test('GET /tokens/:id does not leak patient PII to non-owner patient', async () => {
    const r = await api().post('/api/v1/tokens').set(auth(p1Tok)).send({ sessionId });
    const tokenId = r.body.token.id;

    // Simulate an unrelated patient trying to read via staff-only view
    const other = await api().get(`/api/v1/tokens/${tokenId}`).set(auth(p2Tok));
    expect(other.status).toBe(403);
  });
});