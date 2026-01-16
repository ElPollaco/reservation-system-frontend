import axios from 'axios';
import {API_BASE_URL, StaffRole, LOCAL_STORAGE_KEYS} from "../constants/constants.js";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    if (token)
      config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/api/Auth/');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) =>
    apiClient.post('/api/Auth/login', credentials),

  register: (staffMemberData) =>
    apiClient.post('/api/Auth/register', staffMemberData),
};

export const companyApi = {
  create: (companyData) =>
    apiClient.post('/api/Company', companyData),

  getById: (companyId) =>
    apiClient.get(`/api/Company/${companyId}`),

  update: (companyId, companyData) =>
    apiClient.put(`/api/Company/${companyId}`, companyData),

  delete: (companyId) =>
    apiClient.delete(`/api/Company/${companyId}`),

  markAsReception: (companyId) =>
    apiClient.patch(`/api/Company/${companyId}/markAsReception`),

  unmarkAsReception: (companyId) =>
    apiClient.patch(`/api/Company/${companyId}/unmarkAsReception`),

  addRelation: (companyId, relatedCompanyId) =>
    apiClient.post(`/api/Company/${companyId}/relation`, JSON.stringify(relatedCompanyId)),

  deleteRelation: (companyId) =>
    apiClient.delete(`/api/Company/${companyId}/relation`),

  getRelation: (companyId) =>
    apiClient.get(`/api/Company/${companyId}/relation`),

  updateBreakTimes: (companyId, breakTimesData) =>
    apiClient.put(`/api/Company/${companyId}/breakTimes`, breakTimesData),
};

export const eventScheduleApi = {
  getAll: (companyId, params = {}) =>
    apiClient.get(`/api/EventSchedule/${companyId}`, {params}),

  getById: (companyId, id) =>
    apiClient.get(`/api/EventSchedule/${companyId}/${id}`),

  create: (companyId, scheduleData) =>
    apiClient.post(`/api/EventSchedule/${companyId}`, scheduleData),

  update: (companyId, id, scheduleData) =>
    apiClient.put(`/api/EventSchedule/${companyId}/${id}`, scheduleData),

  delete: (companyId, id) =>
    apiClient.delete(`/api/EventSchedule/${companyId}/${id}`),
};

export const eventTypeApi = {
  getAll: (companyId, params = {}) =>
    apiClient.get(`/api/EventType/${companyId}`, {params}),

  getById: (companyId, id) =>
    apiClient.get(`/api/EventType/${companyId}/${id}`),

  create: (companyId, eventTypeData) =>
    apiClient.post(`/api/EventType/${companyId}`, eventTypeData),

  update: (companyId, id, eventTypeData) =>
    apiClient.put(`/api/EventType/${companyId}/${id}`, eventTypeData),

  delete: (companyId, id) =>
    apiClient.delete(`/api/EventType/${companyId}/${id}`),
};

export const participantApi = {
  getAll: (companyId, params = {}) =>
    apiClient.get(`/api/Participant/${companyId}`, {params}),

  getById: (companyId, participantId) =>
    apiClient.get(`/api/Participant/${companyId}/${participantId}`),

  create: (companyId, participantData) =>
    apiClient.post(`/api/Participant/${companyId}`, participantData),

  update: (companyId, participantId, participantData) =>
    apiClient.put(`/api/Participant/${companyId}/${participantId}`, participantData),

  delete: (companyId, participantId) =>
    apiClient.delete(`/api/Participant/${companyId}/${participantId}`),
};

export const reservationApi = {
  getAll: (companyId, params = {}) =>
    apiClient.get(`/api/Reservation/${companyId}`, {params}),

  getById: (companyId, id) =>
    apiClient.get(`/api/Reservation/${companyId}/${id}`),

  create: (companyId, reservationData) =>
    apiClient.post(`/api/Reservation/${companyId}`, reservationData),

  update: (companyId, id, reservationData) =>
    apiClient.put(`/api/Reservation/${companyId}/${id}`, reservationData),

  delete: (companyId, id) =>
    apiClient.delete(`/api/Reservation/${companyId}/${id}`),

  markAsPaid: (companyId, id) =>
    apiClient.patch(`/api/Reservation/${companyId}/${id}/markAsPaid`),

  unmarkAsPaid: (companyId, id) =>
    apiClient.patch(`/api/Reservation/${companyId}/${id}/unmarkAsPaid`),
};

export const specializationApi = {
  getAll: (companyId, params = {}) =>
    apiClient.get(`/api/Specialization/${companyId}`, {params}),

  getById: (companyId, id) =>
    apiClient.get(`/api/Specialization/${companyId}/${id}`),

  create: (companyId, specializationData) =>
    apiClient.post(`/api/Specialization/${companyId}`, specializationData),

  update: (companyId, id, specializationData) =>
    apiClient.put(`/api/Specialization/${companyId}/${id}`, specializationData),

  delete: (companyId, id) =>
    apiClient.delete(`/api/Specialization/${companyId}/${id}`),
};

export const staffMemberApi = {
  getAll: (companyId, params = {}) =>
    apiClient.get(`/api/StaffMember/${companyId}`, {params}),

  getById: (companyId, staffMemberId) =>
    apiClient.get(`/api/StaffMember/${companyId}/${staffMemberId}`),

  create: (companyId, staffMemberData) =>
    apiClient.post(`/api/StaffMember/${companyId}`, staffMemberData),

  update: (companyId, staffMemberId, staffMemberData) =>
    apiClient.put(`/api/StaffMember/${companyId}/${staffMemberId}`, staffMemberData),

  delete: (companyId, staffMemberId) =>
    apiClient.delete(`/api/StaffMember/${companyId}/${staffMemberId}`),

  addSpecialization: (companyId, data) =>
    apiClient.post(`/api/StaffMember/${companyId}/specialization`, data),

  removeSpecialization: (companyId, staffMemberSpecializationId) =>
    apiClient.delete(`/api/StaffMember/${companyId}/specialization/${staffMemberSpecializationId}`),

  getAvailability: (companyId, staffMemberId) =>
    apiClient.get(`/api/StaffMember/${companyId}/availability/${staffMemberId}`),

  addAvailability: (companyId, staffMemberId, availabilityData) =>
    apiClient.post(`/api/StaffMember/${companyId}/availability/${staffMemberId}`, availabilityData),

  removeAvailability: (companyId, availabilityId) =>
    apiClient.delete(`/api/StaffMember/${companyId}/availability/${availabilityId}`),

  getEventSchedules: (companyId, staffMemberId) =>
    apiClient.get(`/api/StaffMember/${companyId}/eventSchedules/${staffMemberId}`),

  assignToEventSchedule: (companyId, data) =>
    apiClient.post(`/api/StaffMember/${companyId}/eventSchedule`, data),

  removeFromEventSchedule: (companyId, eventScheduleStaffMemberId) =>
    apiClient.delete(`/api/StaffMember/${companyId}/eventSchedule/${eventScheduleStaffMemberId}`),
};

export const staffMemberCompanyApi = {
  getCompanies: () =>
    apiClient.get('/api/staffMember/companies'),

  addToCompany: (companyId, staffMemberId, targetCompanyId) =>
    apiClient.post(`/api/staffMember/${companyId}/${staffMemberId}/companies/${targetCompanyId}`),

  removeFromCompany: (companyId, staffMemberId, targetCompanyId) =>
    apiClient.delete(`/api/staffMember/${companyId}/${staffMemberId}/companies/${targetCompanyId}`),
};

export default {
  auth: authApi,
  company: companyApi,
  eventSchedule: eventScheduleApi,
  eventType: eventTypeApi,
  participant: participantApi,
  reservation: reservationApi,
  specialization: specializationApi,
  staffMember: staffMemberApi,
  staffMemberCompany: staffMemberCompanyApi,
  StaffRole,
};
