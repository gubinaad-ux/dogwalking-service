import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getBookings = () => api.get('/bookings/');
export const updateBooking = (id, data) => api.put(`/bookings/${id}`, data);
export const getClients = () => api.get('/clients/');
export const getDogwalkers = () => api.get('/dogwalkers/');
export const getReport = (params) => api.get('/reports/activity', { params });