import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout components
import Layout from './components/Layout/Layout';
import AdminLayout from './components/Layout/AdminLayout';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Gallery from './pages/Gallery';
import Booking from './pages/Booking';
import AIDesignGenerator from './pages/AIDesignGenerator';
import Chat from './pages/Chat';
import Contact from './pages/Contact';
import Reviews from './pages/Reviews';

// User pages
import Dashboard from './pages/Dashboard';

// Admin pages
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import BookingManagement from './pages/Admin/BookingManagement';
import DesignManagement from './pages/Admin/DesignManagement';
import ChatAnalytics from './pages/Admin/ChatAnalytics';
import UsersManagement from './pages/Admin/UsersManagement';

// Protected route components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Error pages
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes with Layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="book" element={<Booking />} />
              <Route path="ai-design" element={<AIDesignGenerator />} />
              <Route path="chat" element={<Chat />} />
              <Route path="contact" element={<Contact />} />
            </Route>

            {/* Auth Routes (No Layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* User Protected Routes with Layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
            </Route>

            {/* Admin Auth Routes (No Layout) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Protected Routes with AdminLayout */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="bookings" element={<BookingManagement />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="designs" element={<DesignManagement />} />
              <Route path="chat-analytics" element={<ChatAnalytics />} />
            </Route>

            {/* Catch all - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;