import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds for large image uploads
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
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
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Booking service
export const bookingService = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getUserBookings: () => api.get('/bookings/my-bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
  // Admin endpoints
  getAll: () => api.get('/bookings/admin/all?limit=1000'),
  updateStatus: (id, statusData) => api.put(`/bookings/admin/${id}/status`, statusData),
  getStats: () => api.get('/bookings/admin/stats'),
};

// Tattoo Design service
export const tattooDesignService = {
  create: (designData) => api.post('/tattoo-designs/user/save', designData),
  getAll: () => api.get('/tattoo-designs?limit=1000'),
  getById: (id) => api.get(`/tattoo-designs/${id}`),
  getUserDesigns: () => api.get('/tattoo-designs/user'),
  update: (id, data) => api.put(`/tattoo-designs/admin/${id}`, data),
  delete: (id) => api.delete(`/tattoo-designs/user/${id}`),
  generateAI: (prompt) => api.post('/tattoo-designs/ai-generate', prompt),
  // Admin methods
  adminCreate: (designData) => api.post('/tattoo-designs/admin', designData),
  adminDelete: (id) => api.delete(`/tattoo-designs/admin/${id}`),
};

// Chat service
export const chatService = {
  sendMessage: (messageData) => api.post('/chat', messageData),
  getHistory: () => api.get('/chat/history'),
  deleteHistory: () => api.delete('/chat/history'),
  getAnalytics: (dateRange) => api.get(`/chat/admin/analytics?range=${dateRange}`),
};

// Admin services
export const adminService = {
  // Dashboard stats
  getStats: (timeFilter = 'week') => api.get(`/admin/stats?timeFilter=${timeFilter}`),
  
  // User management
  getUsers: () => api.get('/admin/users'),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Chat analytics
  getChatAnalytics: () => api.get('/chat/admin/analytics'),
  getChatMessages: (params) => api.get('/chat/admin/messages', { params }),
};

// Review service
export const reviewService = {
  create: (reviewData) => api.post('/reviews', reviewData),
  getAll: (params) => api.get('/reviews', { params }),
  getById: (id) => api.get(`/reviews/${id}`),
  getByUser: (userId) => api.get(`/reviews/user/${userId}`),
  getByBooking: (bookingId) => api.get(`/reviews/booking/${bookingId}`),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  getStats: () => api.get('/reviews/stats'),
};

export default api;