const { api, login } = require('./helpers');
const { makeUser, PWD, makeHospital } = require('./factories');

describe('Auth', () => {
  test('register creates a patient and returns token', async () => {
    const res = await api().post('/api/v1/auth/register').send({
      fullName: 'Alice', mobile: '9876500001', password: PWD, confirmPassword: PWD,
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('PATIENT');
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.token).toBeTruthy();
  });

  test('rejects duplicate mobile', async () => {
    await makeUser({ mobile: '9876500002' });
    const res = await api().post('/api/v1/auth/register').send({
      fullName: 'Bob', mobile: '9876500002', password: PWD, confirmPassword: PWD,
    });
    expect(res.status).toBe(409);
  });

  test('login succeeds with correct creds', async () => {
    await makeUser({ mobile: '9876500003', password: 'Secret123' });
    const res = await api().post('/api/v1/auth/login').send({ mobile: '9876500003', password: 'Secret123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  test('login fails with wrong password', async () => {
    await makeUser({ mobile: '9876500004' });
    const res = await api().post('/api/v1/auth/login').send({ mobile: '9876500004', password: 'nope' });
    expect(res.status).toBe(401);
  });

  test('GET /auth/me requires token', async () => {
    const res = await api().get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /auth/me returns current user', async () => {
    await makeUser({ mobile: '9876500005', password: 'Xyz12345' });
    const token = await login('9876500005', 'Xyz12345');
    const res = await api().get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.mobile).toBe('9876500005');
  });
});