import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';

// Placeholder components for different user dashboards
const AdminDashboard = () => <div className="p-8">Admin Dashboard</div>;
const OperatorDashboard = () => <div className="p-8">Operator Dashboard</div>;
const AnalystDashboard = () => <div className="p-8">Analyst Dashboard</div>;

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
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/operator/dashboard" element={<OperatorDashboard />} />
        <Route path="/analyst/dashboard" element={<AnalystDashboard />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;