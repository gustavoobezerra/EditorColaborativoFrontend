import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Adicionar token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Documents
export const getDocuments = (params) => api.get('/documents', { params });
export const getDocument = (id) => api.get(`/documents/${id}`);
export const createDocument = (data) => api.post('/documents', data);
export const updateDocument = (id, data) => api.put(`/documents/${id}`, data);
export const deleteDocument = (id) => api.delete(`/documents/${id}`);

// Compartilhamento
export const generateShareLink = (id, permission) => api.post(`/documents/${id}/share`, { permission });
export const disableShareLink = (id) => api.delete(`/documents/${id}/share`);
export const getSharedDocument = (shareLink) => api.get(`/documents/shared/${shareLink}`);

// Colaboradores
export const addCollaborator = (id, email, permission) => api.post(`/documents/${id}/collaborators`, { email, permission });
export const removeCollaborator = (id, userId) => api.delete(`/documents/${id}/collaborators/${userId}`);

// Versões
export const getVersions = (id) => api.get(`/documents/${id}/versions`);
export const restoreVersion = (id, versionId) => api.post(`/documents/${id}/versions/${versionId}/restore`);

// Ações
export const duplicateDocument = (id) => api.post(`/documents/${id}/duplicate`);
export const toggleStar = (id) => api.post(`/documents/${id}/star`);

export default api;
