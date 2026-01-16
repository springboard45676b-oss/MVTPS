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
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route 
            path="/login" 
            element={
              authAPI.isAuthenticated() ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
                  <LoginRegister />
                </main>
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              authAPI.isAuthenticated() ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
                  <LoginRegister />
                </main>
              )
            } 
          />
          
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="/admin/dashboard" element={<Dashboard title="Admin Dashboard" />} />
            <Route path="/operator/dashboard" element={<Dashboard title="Operator Dashboard" />} />
            <Route path="/analyst/dashboard" element={<Dashboard title="Analyst Dashboard" />} />
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