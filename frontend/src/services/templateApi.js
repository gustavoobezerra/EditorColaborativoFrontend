import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api/templates`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Listar templates
export const getTemplates = (params = {}) => api.get('/', { params });

// Obter template por ID
export const getTemplate = (id) => api.get(`/${id}`);

// Criar template
export const createTemplate = (data) => api.post('/', data);

// Atualizar template
export const updateTemplate = (id, data) => api.put(`/${id}`, data);

// Deletar template
export const deleteTemplate = (id) => api.delete(`/${id}`);

// Usar template (criar documento)
export const useTemplate = (id, title) => api.post(`/${id}/use`, { title });

// Criar template de documento
export const createFromDocument = (documentId, data) =>
  api.post(`/from-document/${documentId}`, data);

export default {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  useTemplate,
  createFromDocument
};
