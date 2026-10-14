const { api, login, auth } = require('./helpers');
const { makeHospital, makeUser, makeDepartment, makeDoctor, makeSession, PWD } = require('./factories');

describe('Hospital isolation & role guards', () => {
  let hospA, hospB, adminA, receptA, doctorA, doctorB, sessionA;

  beforeEach(async () => {
    hospA = await makeHospital({ name: 'H-A', city: 'X' });
    hospB = await makeHospital({ name: 'H-B', city: 'Y' });
    adminA  = await makeUser({ role: 'HOSPITAL_ADMIN', hospitalId: hospA.id, mobile: '9100000001', password: 'Admin123' });
    receptA = await makeUser({ role: 'RECEPTIONIST',   hospitalId: hospA.id, mobile: '9100000002', password: 'Recep123' });
    const deptA = await makeDepartment(hospA.id, 'A1');
    const deptB = await makeDepartment(hospB.id, 'B1');
    doctorA = await makeDoctor({ hospitalId: hospA.id, departmentId: deptA.id, mobile: '9100000003' });
    doctorB = await makeDoctor({ hospitalId: hospB.id, departmentId: deptB.id, mobile: '9100000004' });
    sessionA = await makeSession(hospA.id, doctorA.profile.id, { status: 'OPEN' });
  });

  test('patient cannot list admin endpoints', async () => {
    const pt = await makeUser({ mobile: '9100000100', password: 'Pat12345' });
    const token = await login(pt.mobile, 'Pat12345');
    const res = await api().get('/api/v1/admin/doctors').set(auth(token));
    expect(res.status).toBe(403);
  });

  test('receptionist from A cannot touch session from B', async () => {
    const deptB = await makeDepartment(hospB.id, 'B2');
    const d2 = await makeDoctor({ hospitalId: hospB.id, departmentId: deptB.id, mobile: '9100000200' });
    const sessionB = await makeSession(hospB.id, d2.profile.id, { status: 'OPEN' });
    const token = await login('9100000002', 'Recep123');
    const res = await api().post(`/api/v1/sessions/${sessionB.id}/pause`).set(auth(token));
    expect(res.status).toBe(403);
  });

  test('doctor cannot act on another doctor\'s token', async () => {
    // create a patient + token in session A
    const pt = await makeUser({ mobile: '9100000300', password: 'Pat12345' });
    const ptTok = await login(pt.mobile, 'Pat12345');
    const join = await api().post('/api/v1/tokens').set(auth(ptTok)).send({ sessionId: sessionA.id });
    expect(join.status).toBe(201);
    const tokenId = join.body.token.id;

    // call it as receptionist
    const recTok = await login('9100000002', 'Recep123');
    await api().patch(`/api/v1/tokens/${tokenId}/call`).set(auth(recTok)).expect(200);

    // doctor B attempts to start it
    // NOTE: made with factories default PWD
    const { PWD } = require('./factories');
    const docBReal = await login('9100000004', PWD);
    // const docBReal = await login('9100000004', require('./factories').PWD);
    const res = await api().patch(`/api/v1/doctor/tokens/${tokenId}/start`).set(auth(docBReal));
    expect(res.status).toBe(403);
  });
});