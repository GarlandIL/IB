import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';

// ============= PUBLIC PAGES =============
import Landing from './pages/Landing';
import Discover from './pages/Discover';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProjectDetails from './pages/ProjectDetails';

// ============= CREATOR PAGES =============
import CreatorDashboard from './pages/creator/CreatorDashboard';
import CreateProject from './pages/creator/CreateProject';
import EditProject from './pages/creator/EditProject';
import CreatorMessages from './pages/creator/CreatorMessages';

// ============= INVESTOR PAGES =============
import InvestorDashboard from './pages/investor/InvestorDashboard';
import InvestorBookmarks from './pages/investor/InvestorBookmarks';
import InvestorMessages from './pages/investor/InvestorMessages';

// ============= STYLES =============
import './App.css';

/**
 * Protected Route Component
 * - Blocks unauthenticated users
 * - Blocks users of wrong type (creator vs investor)
 * - Shows loading spinner while checking auth
 */
const ProtectedRoute = ({ children, requiredType }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="spinner w-12 h-12 border-4 border-neutral-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredType && user?.type !== requiredType) {
    // Redirect to home if wrong user type
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/" element={<Landing />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />

        {/* ===== CREATOR ROUTES (Protected) ===== */}
        <Route 
          path="/creator/dashboard" 
          element={
            <ProtectedRoute requiredType="creator">
              <CreatorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/creator/projects/new" 
          element={
            <ProtectedRoute requiredType="creator">
              <CreateProject />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/creator/projects/:id/edit" 
          element={
            <ProtectedRoute requiredType="creator">
              <EditProject />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/creator/messages" 
          element={
            <ProtectedRoute requiredType="creator">
              <CreatorMessages />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/creator/messages/:conversationId" 
          element={
            <ProtectedRoute requiredType="creator">
              <CreatorMessages />
            </ProtectedRoute>
          } 
        />

        {/* ===== INVESTOR ROUTES (Protected) ===== */}
        <Route 
          path="/investor/dashboard" 
          element={
            <ProtectedRoute requiredType="investor">
              <InvestorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/investor/bookmarks" 
          element={
            <ProtectedRoute requiredType="investor">
              <InvestorBookmarks />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/investor/messages" 
          element={
            <ProtectedRoute requiredType="investor">
              <InvestorMessages />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/investor/messages/:conversationId" 
          element={
            <ProtectedRoute requiredType="investor">
              <InvestorMessages />
            </ProtectedRoute>
          } 
        />

        {/* ===== 404 – Redirect to Home ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;