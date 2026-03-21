import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/admin/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  adminLogin: (email, password) => api.post('/auth/admin/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
  verifyToken: () => api.get('/auth/verify'),
};

// Booking API functions
export const bookingAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getUserBookings: (params = {}) => api.get('/bookings/my-bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  update: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
  cancel: (id) => api.delete(`/bookings/${id}`),
  
  // Admin functions
  getAll: (params = {}) => api.get('/bookings/admin/all', { params }),
  updateStatus: (id, statusData) => api.put(`/bookings/admin/${id}/status`, statusData),
  getStats: () => api.get('/bookings/admin/stats'),
};

// Tattoo Design API functions
export const tattooDesignAPI = {
  getAll: (params = {}) => api.get('/tattoo-designs', { params }),
  getById: (id) => api.get(`/tattoo-designs/${id}`),
  generateAI: (prompt, style, size, bodyPlacement) => 
    api.post('/tattoo-designs/ai-generate', { prompt, style, size, bodyPlacement }),
  toggleLike: (id) => api.post(`/tattoo-designs/${id}/like`),
  
  // Admin functions
  create: (designData) => api.post('/tattoo-designs/admin', designData),
  update: (id, designData) => api.put(`/tattoo-designs/admin/${id}`, designData),
  delete: (id) => api.delete(`/tattoo-designs/admin/${id}`),
};

// Chat API functions
export const chatAPI = {
  sendMessage: (message, sessionId) => api.post('/chat', { message, sessionId }),
  getChatHistory: (sessionId, params = {}) => 
    api.get(`/chat/history/${sessionId}`, { params }),
  rateResponse: (messageId, helpful) => 
    api.post(`/chat/${messageId}/rate`, { helpful }),
  getQuickReplies: () => api.get('/chat/suggestions'),
  getUserSessions: (params = {}) => api.get('/chat/my-sessions', { params }),
  
  // Admin functions
  getAnalytics: () => api.get('/chat/admin/analytics'),
  getAllMessages: (params = {}) => api.get('/chat/admin/messages', { params }),
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data.message || 'An error occurred',
      status: error.response.status,
      errors: error.response.data.errors || null
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      errors: null
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      errors: null
    };
  }
};

// Format API response for consistent handling
export const formatApiResponse = (response) => {
  return {
    success: response.data.success || true,
    message: response.data.message || 'Operation successful',
    data: response.data.data || response.data,
    pagination: response.data.pagination || null,
    meta: response.data.meta || null
  };
};

// Default export
export default api;