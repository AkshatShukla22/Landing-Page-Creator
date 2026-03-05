// frontend/src/services/authService.js
import apiClient from './apiClient';

export const loginUser = async (credentials) => {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data;
};

export const registerUser = async (userData) => {
  const { data } = await apiClient.post('/auth/register', userData);
  return data;
};

export const fetchMe = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data;
};

export const fetchAllUsers = async () => {
  const { data } = await apiClient.get('/users');
  return data;
};

export const removeUser = async (id) => {
  const { data } = await apiClient.delete(`/users/${id}`);
  return data;
};

export const fetchPendingUsers = async () => {
  const { data } = await apiClient.get('/users/pending');
  return data;
};

export const approveUser = async (id) => {
  const { data } = await apiClient.put(`/users/${id}/approve`);
  return data;
};

export const rejectUser = async (id, reason = '') => {
  const { data } = await apiClient.put(`/users/${id}/reject`, { reason });
  return data;
};

export default apiClient;