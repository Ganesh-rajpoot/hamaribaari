import { api } from './client';

export const getReceptionistToday = () =>
  api.get('/receptionist/today').then((r) => r.data.sessions);

export const getSession = (id) =>
  api.get(`/sessions/${id}`).then((r) => r.data);

export const openSession       = (id) => api.post(`/sessions/${id}/open`).then((r) => r.data.session);
export const pauseSession      = (id) => api.post(`/sessions/${id}/pause`).then((r) => r.data.session);
export const resumeSession     = (id) => api.post(`/sessions/${id}/resume`).then((r) => r.data.session);
export const closeSession      = (id) => api.post(`/sessions/${id}/close`).then((r) => r.data.session);
export const unavailableSession= (id) => api.post(`/sessions/${id}/unavailable`).then((r) => r.data.session);
export const cancelSession     = (id, reason) =>
  api.post(`/sessions/${id}/cancel`, { reason }).then((r) => r.data.session);