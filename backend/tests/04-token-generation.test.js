const { api, login, auth } = require('./helpers');
const { makeHospital, makeUser, makeDepartment, makeDoctor, makeSession } = require('./factories');
const prisma = require('../src/config/prisma');

describe('Token generation', () => {
  let session, patients = [], tokens = [], hosp;

  beforeEach(async () => {
    hosp = await makeHospital();
    const dept = await makeDepartment(hosp.id, 'GEN');
    const { profile } = await makeDoctor({ hospitalId: hosp.id, departmentId: dept.id, mobile: '9300000001' });
    session = await makeSession(hosp.id, profile.id, { status: 'OPEN', maxCapacity: 100 });

    for (let i = 0; i < 5; i++) {
      const u = await makeUser({ mobile: `930000000${i+2}`, password: 'Pat12345' });
      const t = await login(u.mobile, 'Pat12345');
      patients.push(u); tokens.push(t);
    }
  });

  test('single join creates token #1 with bookedCount=1', async () => {
    const r = await api().post('/api/v1/tokens').set(auth(tokens[0])).send({ sessionId: session.id });
    expect(r.status).toBe(201);
    expect(r.body.token.tokenNumber).toBe(1);

    const s = await prisma.oPDSession.findUnique({ where: { id: session.id } });
    expect(s.bookedCount).toBe(1);
    expect(s.nextTokenNumber).toBe(2);
  });

  test('duplicate active token rejected with 409', async () => {
    await api().post('/api/v1/tokens').set(auth(tokens[0])).send({ sessionId: session.id }).expect(201);
    const r = await api().post('/api/v1/tokens').set(auth(tokens[0])).send({ sessionId: session.id });
    expect(r.status).toBe(409);
  });

  test('closed session rejects join', async () => {
    await prisma.oPDSession.update({ where: { id: session.id }, data: { status: 'CLOSED' } });
    const r = await api().post('/api/v1/tokens').set(auth(tokens[0])).send({ sessionId: session.id });
    expect(r.status).toBe(409);
  });

  test('capacity full rejects join', async () => {
    await prisma.oPDSession.update({
      where: { id: session.id },
      data: { maxCapacity: 1, bookedCount: 1, nextTokenNumber: 2 },
    });
    const r = await api().post('/api/v1/tokens').set(auth(tokens[0])).send({ sessionId: session.id });
    expect(r.status).toBe(409);
  });

  test('CONCURRENCY: 5 parallel joins produce unique token numbers 1..5', async () => {
    const calls = tokens.map((tok) =>
      api().post('/api/v1/tokens').set(auth(tok)).send({ sessionId: session.id }));
    const results = await Promise.all(calls);
    expect(results.every((r) => r.status === 201)).toBe(true);

    const nums = results.map((r) => r.body.token.tokenNumber).sort((a, b) => a - b);
    expect(nums).toEqual([1, 2, 3, 4, 5]);

    const all = await prisma.queueToken.findMany({ where: { sessionId: session.id } });
    expect(all.length).toBe(5);
    expect(new Set(all.map((t) => t.tokenNumber)).size).toBe(5);

    const s = await prisma.oPDSession.findUnique({ where: { id: session.id } });
    expect(s.bookedCount).toBe(5);
    expect(s.nextTokenNumber).toBe(6);
  });
});