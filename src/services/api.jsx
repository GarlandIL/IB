import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Projects API
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  getByCreator: (creatorId) => api.get(`/projects?creatorId=${creatorId}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Conversations API
export const conversationsAPI = {
  getAll: () => api.get('/conversations'),
  getById: (id) => api.get(`/conversations/${id}`),
  getByUser: (userId) => 
    api.get(`/conversations?investorId=${userId}`).then(res1 => 
      api.get(`/conversations?creatorId=${userId}`).then(res2 => ({
        data: [...res1.data, ...res2.data]
      }))
    ),
  create: (data) => api.post('/conversations', data),
  update: (id, data) => api.patch(`/conversations/${id}`, data),
  addMessage: (id, message) => 
    api.get(`/conversations/${id}`).then(res => {
      const conversation = res.data;
      conversation.messages.push(message);
      return api.patch(`/conversations/${id}`, conversation);
    }),
  markAsRead: (conversationId, userId) => 
  api.get(`/conversations/${conversationId}`).then(res => {
    const conv = res.data;
    conv.messages = conv.messages.map(m => 
      m.senderId !== userId ? { ...m, read: true } : m
    );
    return api.patch(`/conversations/${conversationId}`, conv);
  }),

// Add a document to conversation
addDocument: (conversationId, document) =>
  api.get(`/conversations/${conversationId}`).then(res => {
    const conv = res.data;
    conv.sharedDocuments = [...(conv.sharedDocuments || []), document];
    return api.patch(`/conversations/${conversationId}`, conv);
  }),
};

// Bookmarks API
export const bookmarksAPI = {
  getAll: () => api.get('/bookmarks'),
  getByInvestor: (investorId) => api.get(`/bookmarks?investorId=${investorId}`),
  create: (data) => api.post('/bookmarks', data),
  delete: (id) => api.delete(`/bookmarks/${id}`),
};

// NDA Requests API
export const ndaAPI = {
  getAll: () => api.get('/ndaRequests'),
  getByInvestor: (investorId) => api.get(`/ndaRequests?investorId=${investorId}`),
  getByProject: (projectId) => api.get(`/ndaRequests?projectId=${projectId}`),
  create: (data) => api.post('/ndaRequests', data),
  update: (id, data) => api.patch(`/ndaRequests/${id}`, data),
};

// Sectors API
export const sectorsAPI = {
  getAll: () => api.get('/sectors'),
};

// SDGs API
export const sdgsAPI = {
  getAll: () => api.get('/sdgs'),
};

// Messages API (for real-time simulation)
export const messagesAPI = {
  send: (conversationId, message) => 
    conversationsAPI.addMessage(conversationId, message),
};


export default api;