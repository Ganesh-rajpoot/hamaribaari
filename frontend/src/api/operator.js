import { api } from './client';

export const getStats          = ()                     => api.get('/operator/stats').then(r => r.data.stats);
export const listHospitals     = (params = {})          => api.get('/operator/hospitals', { params }).then(r => r.data.hospitals);
export const getHospital       = (id)                   => api.get(`/operator/hospitals/${id}`).then(r => r.data.hospital);
export const createHospital    = (payload)              => api.post('/operator/hospitals', payload).then(r => r.data);
export const patchHospital     = (id, payload)          => api.patch(`/operator/hospitals/${id}`, payload).then(r => r.data.hospital);
export const setHospitalStatus = (id, status)           => api.patch(`/operator/hospitals/${id}/status`, { status }).then(r => r.data.hospital);
export const createStaff       = (id, payload)          => api.post(`/operator/hospitals/${id}/staff`, payload).then(r => r.data.user);
export const resetUserPassword = (userId, newPassword)  => api.patch(`/operator/users/${userId}/password`, { newPassword }).then(r => r.data);
export const toggleUserActive  = (userId, isActive)     => api.patch(`/operator/users/${userId}/active`, { isActive }).then(r => r.data.user);