import { api } from './client';

/* Patient */
// export const joinQueue       = (sessionId)          => api.post('/tokens', { sessionId }).then((r) => r.data.token);
export const joinQueue       = (sessionId)           =>api.post('/tokens', { sessionId }).then((r) => r.data.token);
export const getMyTokens     = ()                    => api.get('/tokens/my').then((r) => r.data.tokens);
export const getToken        = (id)                  => api.get(`/tokens/${id}`).then((r) => r.data.token);
export const cancelMyToken   = (id)                  => api.patch(`/tokens/${id}/cancel`).then((r) => r.data.token);

/* Receptionist */
export const getSessionQueue = (sessionId)           => api.get(`/sessions/${sessionId}/queue`).then((r) => r.data);
export const createWalkIn    = (sessionId, payload)  => api.post(`/sessions/${sessionId}/walk-in`, payload).then((r) => r.data);
export const arriveToken     = (id)                  => api.patch(`/tokens/${id}/arrive`).then((r) => r.data.token);
export const callToken       = (id)                  => api.patch(`/tokens/${id}/call`).then((r) => r.data.token);
export const startToken      = (id)                  => api.patch(`/tokens/${id}/start`).then((r) => r.data.token);
export const completeToken   = (id)                  => api.patch(`/tokens/${id}/complete`).then((r) => r.data.token);
export const skipToken       = (id, reason)          => api.patch(`/tokens/${id}/skip`, { reason }).then((r) => r.data.token);
export const recallToken     = (id)                  => api.patch(`/tokens/${id}/recall`).then((r) => r.data.token);
export const putAtEnd        = (id)                  => api.patch(`/tokens/${id}/put-at-end`).then((r) => r.data.token);
export const noShowToken     = (id, reason)          => api.patch(`/tokens/${id}/no-show`, { reason }).then((r) => r.data.token);