// frontend/src/services/landingService.js
import apiClient from './apiClient';

export const fetchLandingPages = async () => {
  const { data } = await apiClient.get('/landing');
  return data;
};

export const fetchStats = async () => {
  const { data } = await apiClient.get('/landing/stats');
  return data;
};

export const fetchPageBySlug = async (slug) => {
  const { data } = await apiClient.get(`/landing/slug/${slug}`);
  return data;
};

export const fetchPageById = async (id) => {
  const { data } = await apiClient.get(`/landing/${id}`);
  return data;
};

export const createPage = async (pageData) => {
  const { data } = await apiClient.post('/landing', pageData);
  return data;
};

export const updatePage = async (id, pageData) => {
  const { data } = await apiClient.put(`/landing/${id}`, pageData);
  return data;
};

export const deletePage = async (id) => {
  const { data } = await apiClient.delete(`/landing/${id}`);
  return data;
};

export const generateSlug = async (channelName) => {
  const { data } = await apiClient.post('/landing/generate-slug', { channelName });
  return data;
};

export const checkSlugAvailable = async (slug) => {
  const { data } = await apiClient.get(`/landing/check-slug/${slug}`);
  return data;
};