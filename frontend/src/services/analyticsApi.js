import api from './api';

export const analyticsApi = {
  trackActivity: async (data) => {
    return api.post('/analytics/track', data);
  },

  getSummary: async (period = 'week') => {
    return api.get(`/analytics/summary?period=${period}`);
  },

  getMostEditedDocuments: async (limit = 10) => {
    return api.get(`/analytics/documents?limit=${limit}`);
  },

  getReadabilityScore: async (documentId) => {
    return api.get(`/analytics/readability/${documentId}`);
  }
};

export default analyticsApi;
