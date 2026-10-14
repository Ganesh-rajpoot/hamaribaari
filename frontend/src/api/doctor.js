import { api } from './client';

export const getDoctorToday = () =>
  api.get('/doctor/today').then((r) => r.data);

export const getDoctorQueue = () =>
  api.get('/doctor/queue').then((r) => r.data);

export const doctorStart    = (id)         => api.patch(`/doctor/tokens/${id}/start`).then((r) => r.data.token);
export const doctorComplete = (id)         => api.patch(`/doctor/tokens/${id}/complete`).then((r) => r.data.token);
export const doctorSkip     = (id, reason) => api.patch(`/doctor/tokens/${id}/skip`, { reason }).then((r) => r.data.token);