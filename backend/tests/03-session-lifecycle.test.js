const { api, login, auth } = require('./helpers');
const { makeHospital, makeUser, makeDepartment, makeDoctor, makeSession } = require('./factories');

describe('Session lifecycle', () => {
  let receptTok, session, hosp;

  beforeEach(async () => {
    hosp = await makeHospital();
    await makeUser({ role: 'RECEPTIONIST', hospitalId: hosp.id, mobile: '9200000001', password: 'Recp1234' });
    const dept = await makeDepartment(hosp.id, 'GEN');
    const { profile } = await makeDoctor({ hospitalId: hosp.id, departmentId: dept.id, mobile: '9200000002' });
    session = await makeSession(hosp.id, profile.id, { status: 'SCHEDULED' });
    receptTok = await login('9200000001', 'Recp1234');
  });

  test('open → pause → resume → close', async () => {
    let r = await api().post(`/api/v1/sessions/${session.id}/open`).set(auth(receptTok));
    expect(r.status).toBe(200);
    expect(r.body.session.status).toBe('OPEN');

    r = await api().post(`/api/v1/sessions/${session.id}/pause`).set(auth(receptTok));
    expect(r.body.session.status).toBe('PAUSED');

    r = await api().post(`/api/v1/sessions/${session.id}/resume`).set(auth(receptTok));
    expect(r.body.session.status).toBe('OPEN');

    r = await api().post(`/api/v1/sessions/${session.id}/close`).set(auth(receptTok));
    expect(r.body.session.status).toBe('CLOSED');
  });

  test('illegal transition returns 409', async () => {
    await api().post(`/api/v1/sessions/${session.id}/open`).set(auth(receptTok)).expect(200);
    await api().post(`/api/v1/sessions/${session.id}/close`).set(auth(receptTok)).expect(200);
    const r = await api().post(`/api/v1/sessions/${session.id}/open`).set(auth(receptTok));
    expect(r.status).toBe(409);
  });

  test('cancel requires reason and preserves history', async () => {
    await api().post(`/api/v1/sessions/${session.id}/open`).set(auth(receptTok)).expect(200);

    // no reason
    let r = await api().post(`/api/v1/sessions/${session.id}/cancel`).set(auth(receptTok)).send({});
    expect(r.status).toBe(400);

    r = await api().post(`/api/v1/sessions/${session.id}/cancel`).set(auth(receptTok))
      .send({ reason: 'Doctor emergency' });
    expect(r.status).toBe(200);
    expect(r.body.session.status).toBe('CANCELLED');
    expect(r.body.session.cancelReason).toBe('Doctor emergency');
  });
});