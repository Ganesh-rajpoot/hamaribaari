const request = require('supertest');
const app = require('../src/app');

const api = () => request(app);

const login = async (mobile, password) => {
  const res = await api().post('/api/v1/auth/login').send({ mobile, password });
  if (res.status !== 200) throw new Error(`login failed: ${JSON.stringify(res.body)}`);
  return res.body.token;
};

const auth = (token) => ({ Authorization: `Bearer ${token}` });

module.exports = { api, login, auth };