import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import LoginRegister from './pages/LoginRegister';
import VesselsPage from './pages/Vessels';
import PortsPage from './pages/Ports';
import VoyagesPage from './pages/Voyages';
import EventsPage from './pages/Events';
import NotificationsPage from './pages/Notifications';
import LiveTrackingPage from './pages/LiveTracking';
import ProfilePage from './pages/Profile';
import ProfileEditPage from './pages/ProfileEdit';
import AppLayout from './components/AppLayout';
import { authAPI } from './services/api';

const Dashboard = ({ title }) => {
  const cards = [
    { title: 'Vessels', desc: 'Fleet overview and positions', to: '/vessels' },
    { title: 'Ports', desc: 'Port stats & congestion', to: '/ports' },
    { title: 'Voyages', desc: 'Schedules and statuses', to: '/voyages' },
    { title: 'Events', desc: 'Operational events', to: '/events' },
    { title: 'Notifications', desc: 'Alerts and updates', to: '/notifications' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-500">Welcome</p>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-600 mt-1">Navigate key operational areas below.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <a
            key={card.to}
            href={card.to}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{card.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  if (!authAPI.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children || <Outlet />;
};

// Update document title on route change
const PageTitleUpdater = () => {
  const location = useLocation();
  
  useEffect(() => {
    document.title = 'MVTPS Platform';
  }, [location.pathname]);
  
  return null;
};

const App = () => {
  return (
    <Router>
      <PageTitleUpdater />
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
        
        {/* Protected routes */}
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
          <Route path="/events" element={<EventsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/live-tracking" element={<LiveTrackingPage />} />
          
          {/* Profile routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;