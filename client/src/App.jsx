import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginRegister from './pages/LoginRegister';
import VesselsPage from './pages/Vessels';
import PortsPage from './pages/Ports';
import VoyagesPage from './pages/Voyages';
import NotificationsPage from './pages/Notifications';
import LiveTrackingPage from './pages/LiveTracking/LiveTracking';
import ProfilePage from './pages/Profile';
import ProfileEditPage from './pages/ProfileEdit';
import AppLayout from './components/AppLayout';
import LoadingAnimation from './components/LoadingAnimation';
import { authAPI } from './services/api';
import Dashboard from './pages/Dashboard/Dashboard.jsx';

const ProtectedRoute = ({ children }) => {
  if (!authAPI.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children || <Outlet />;
};

// Helper function to get dashboard route based on user role - SAFE VERSION
const getDashboardRoute = () => {
  try {
    const user = authAPI.getCurrentUser();
    
    // If no user found, return login
    if (!user) {
      console.warn('No authenticated user found');
      return '/login';
    }
    
    const role = user?.role?.toLowerCase();
    
    // Only admin gets /admin/dashboard
    if (role === 'admin') {
      console.log('Redirecting admin to /admin/dashboard');
      return '/admin/dashboard';
    }
    
    // All other roles (analyst, operator, etc.) get /dashboard
    console.log(`Redirecting ${role} to /dashboard`);
    return '/dashboard';
  } catch (error) {
    console.error('Error in getDashboardRoute:', error);
    return '/login';
  }
};

const PageTitleUpdater = () => {
  const location = useLocation();
  
  useEffect(() => {
    document.title = 'MVTPS Platform';
  }, [location.pathname]);
  
  return null;
};

const GlobalLoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {isLoading && <LoadingAnimation message="Loading Page" subtitle="Please wait..." />}
      {children}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <PageTitleUpdater />
      <GlobalLoadingProvider>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Login Route */}
          <Route 
            path="/login" 
            element={
              authAPI.isAuthenticated() ? (
                <Navigate to={getDashboardRoute()} replace />
              ) : (
                <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
                  <LoginRegister />
                </main>
              )
            } 
          />
          
          {/* Register Route */}
          <Route 
            path="/register" 
            element={
              authAPI.isAuthenticated() ? (
                <Navigate to={getDashboardRoute()} replace />
              ) : (
                <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
                  <LoginRegister />
                </main>
              )
            } 
          />
          
          {/* Protected Routes */}
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            {/* Admin-only dashboard route */}
            <Route path="/admin/dashboard" element={<Dashboard title="Admin Dashboard" />} />
            
            {/* General dashboard route for analyst, operator, and other non-admin users */}
            <Route path="/dashboard" element={<Dashboard title="Dashboard" />} />
            
            {/* Other protected routes */}
            <Route path="/vessels" element={<VesselsPage />} />
            <Route path="/ports" element={<PortsPage />} />
            <Route path="/voyages" element={<VoyagesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/live-tracking" element={<LiveTrackingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />
          </Route>
        </Routes>
      </GlobalLoadingProvider>
    </Router>
  );
};

export default App;