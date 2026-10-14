const { api, login, auth } = require('./helpers');
const { makeHospital, makeUser, makeDepartment, makeDoctor, makeSession, PWD } = require('./factories');
const prisma = require('../src/config/prisma');

describe('Token transitions (receptionist)', () => {
  let session, receptTok, tokenId;

  beforeEach(async () => {
    const hospital = await makeHospital();
    await makeUser({ role: 'RECEPTIONIST', hospitalId: hospital.id, mobile: '9600000001', password: 'Recp1234' });
    const dept = await makeDepartment(hospital.id, 'GEN');
    const { profile } = await makeDoctor({ hospitalId: hospital.id, departmentId: dept.id, mobile: '9600000002' });
    session = await makeSession(hospital.id, profile.id, { status: 'OPEN' });
    const pt = await makeUser({ mobile: '9600000010', password: PWD });
    const ptTok = await login(pt.mobile, PWD);
    const r = await api().post('/api/v1/tokens').set(auth(ptTok)).send({ sessionId: session.id });
    tokenId = r.body.token.id;
    receptTok = await login('9600000001', 'Recp1234');
  });

  test('WAITING → CALLED → IN_CONSULTATION → COMPLETED', async () => {
    let r = await api().patch(`/api/v1/tokens/${tokenId}/call`).set(auth(receptTok));
    expect(r.body.token.status).toBe('CALLED');

    r = await api().patch(`/api/v1/tokens/${tokenId}/start`).set(auth(receptTok));
    expect(r.body.token.status).toBe('IN_CONSULTATION');
    expect(r.body.token.arrivalStatus).toBe('ARRIVED');

    r = await api().patch(`/api/v1/tokens/${tokenId}/complete`).set(auth(receptTok));
    expect(r.body.token.status).toBe('COMPLETED');
  });

  test('illegal: complete a WAITING token → 409', async () => {
    const r = await api().patch(`/api/v1/tokens/${tokenId}/complete`).set(auth(receptTok));
    expect(r.status).toBe(409);
  });

  test('skip requires reason', async () => {
    let r = await api().patch(`/api/v1/tokens/${tokenId}/skip`).set(auth(receptTok)).send({});
    expect(r.status).toBe(400);

    r = await api().patch(`/api/v1/tokens/${tokenId}/skip`).set(auth(receptTok)).send({ reason: 'No show' });
    expect(r.body.token.status).toBe('SKIPPED');
  });

  test('recall skipped → WAITING', async () => {
    await api().patch(`/api/v1/tokens/${tokenId}/skip`).set(auth(receptTok)).send({ reason: 'Away' }).expect(200);
    const r = await api().patch(`/api/v1/tokens/${tokenId}/recall`).set(auth(receptTok));
    expect(r.body.token.status).toBe('WAITING');
  });

  test('put-at-end assigns a max position', async () => {
    const r = await api().patch(`/api/v1/tokens/${tokenId}/put-at-end`).set(auth(receptTok));
    expect(r.body.token.position).toBeGreaterThanOrEqual(1);
    const reread = await prisma.queueToken.findUnique({ where: { id: tokenId } });
    expect(reread.position).toBe(r.body.token.position);
  });

  test('audit log written for CALLED', async () => {
    await api().patch(`/api/v1/tokens/${tokenId}/call`).set(auth(receptTok)).expect(200);
    const log = await prisma.auditLog.findFirst({ where: { entityId: tokenId, action: 'TOKEN_CALLED' } });
    expect(log).toBeTruthy();
  });
});