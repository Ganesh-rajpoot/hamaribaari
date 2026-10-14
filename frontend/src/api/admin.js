import { api } from './client';

export const getMyHospital = () => api.get('/admin/hospital').then((r) => r.data.hospital);
export const patchMyHospital = (data) => api.patch('/admin/hospital', data).then((r) => r.data.hospital);

export const listDepartments = () => api.get('/admin/departments').then((r) => r.data.departments);
export const createDepartment = (data) => api.post('/admin/departments', data).then((r) => r.data.department);
export const updateDepartment = (id, data) => api.patch(`/admin/departments/${id}`, data).then((r) => r.data.department);
export const deleteDepartment = (id) => api.delete(`/admin/departments/${id}`).then((r) => r.data);

export const listDoctors = () => api.get('/admin/doctors').then((r) => r.data.doctors);
export const createDoctor = (data) => api.post('/admin/doctors', data).then((r) => r.data);
export const updateDoctor = (id, data) => api.patch(`/admin/doctors/${id}`, data).then((r) => r.data.doctor);

export const listSchedules = (doctorId) => api.get(`/admin/doctors/${doctorId}/schedules`).then((r) => r.data.schedules);
export const addSchedule = (doctorId, data) => api.post(`/admin/doctors/${doctorId}/schedules`, data).then((r) => r.data.schedule);
export const deleteSchedule = (doctorId, sid) => api.delete(`/admin/doctors/${doctorId}/schedules/${sid}`).then((r) => r.data);

export const createStaff = (data) => api.post('/admin/staff', data).then((r) => r.data.user);

export const ensureTodaySessions = () => api.post('/admin/sessions/ensure').then((r) => r.data);
export const listSessionsByDate = (date) => api.get('/admin/sessions', { params: { date } }).then((r) => r.data.sessions);