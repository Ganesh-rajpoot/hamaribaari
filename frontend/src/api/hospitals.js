import { api } from './client';

export const searchHospitals = (q = '') =>
  api.get('/hospitals', { params: q ? { q } : {} }).then((r) => r.data.hospitals);

export const getHospital = (id) =>
  api.get(`/hospitals/${id}`).then((r) => r.data.hospital);

export const getDepartments = (id) =>
  api.get(`/hospitals/${id}/departments`).then((r) => r.data.departments);

export const getDoctors = (id) =>
  api.get(`/hospitals/${id}/doctors`).then((r) => r.data.doctors);

export const getDoctorSessions = (doctorId, date) =>
  api.get(`/doctors/${doctorId}/sessions`, { params: date ? { date } : {} }).then((r) => r.data);