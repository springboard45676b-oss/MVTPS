import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import VesselsPage from './pages/Vessels';
import PortsPage from './pages/Ports';
import VoyagesPage from './pages/Voyages';
import EventsPage from './pages/Events';
import NotificationsPage from './pages/Notifications';
import LiveTrackingPage from './pages/LiveTracking';
import AppLayout from './components/AppLayout';

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

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route 
          path="/login" 
          element={
            <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
              <LoginRegister />
            </main>
          } 
        />
        <Route 
          path="/register" 
          element={
            <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
              <LoginRegister />
            </main>
          } 
        />
        <Route element={<AppLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard title="Admin Dashboard" />} />
          <Route path="/operator/dashboard" element={<Dashboard title="Operator Dashboard" />} />
          <Route path="/analyst/dashboard" element={<Dashboard title="Analyst Dashboard" />} />
          <Route path="/vessels" element={<VesselsPage />} />
          <Route path="/ports" element={<PortsPage />} />
          <Route path="/voyages" element={<VoyagesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/live-tracking" element={<LiveTrackingPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;