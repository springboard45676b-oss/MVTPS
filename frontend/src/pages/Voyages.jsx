import React, { useState, useEffect } from 'react';
import { Ship, Anchor, TrendingUp, AlertTriangle, Users, Settings, Download, Play, Pause, SkipBack, Database, Activity, MapPin, CheckCircle, XCircle, Clock, DollarSign, BarChart3, PieChart, Filter } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const Voyages = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('company');
  const [selectedVoyage, setSelectedVoyage] = useState(null);
  const [replayState, setReplayState] = useState({ playing: false, position: 0, speed: 1 });
  const [filters, setFilters] = useState({ dateRange: 'all', status: 'all', compliance: 'all' });
  const [apiSources, setApiSources] = useState([
    { id: 1, name: 'AIS Data Provider', status: 'active', lastSync: '2 min ago', rate: '99.8%' },
    { id: 2, name: 'Weather API', status: 'active', lastSync: '5 min ago', rate: '99.9%' },
    { id: 3, name: 'Port Authority API', status: 'warning', lastSync: '15 min ago', rate: '97.2%' },
    { id: 4, name: 'Customs Database', status: 'active', lastSync: '1 min ago', rate: '100%' }
  ]);

  const [voyages, setVoyages] = useState([
    {
      id: 'V001',
      vessel: 'MV Atlantic Star',
      route: 'Singapore → Rotterdam',
      status: 'in-transit',
      completion: 65,
      departure: '2026-01-10',
      eta: '2026-01-28',
      compliance: { imo: true, customs: true, safety: true, environmental: false },
      cargo: 'Electronics',
      value: '$2.4M',
      incidents: 1,
      positions: generatePositions(65)
    },
    {
      id: 'V002',
      vessel: 'SS Pacific Dream',
      route: 'Los Angeles → Tokyo',
      status: 'completed',
      completion: 100,
      departure: '2026-01-05',
      eta: '2026-01-15',
      compliance: { imo: true, customs: true, safety: true, environmental: true },
      cargo: 'Automobiles',
      value: '$5.1M',
      incidents: 0,
      positions: generatePositions(100)
    },
    {
      id: 'V003',
      vessel: 'MV Northern Wind',
      route: 'Hamburg → New York',
      status: 'delayed',
      completion: 45,
      departure: '2026-01-12',
      eta: '2026-01-30',
      compliance: { imo: true, customs: false, safety: true, environmental: true },
      cargo: 'Machinery',
      value: '$3.8M',
      incidents: 2,
      positions: generatePositions(45)
    }
  ]);

  function generatePositions(completion) {
    const positions = [];
    const totalPoints = 100;
    for (let i = 0; i <= Math.floor(totalPoints * completion / 100); i++) {
      positions.push({
        time: `Day ${Math.floor(i / 4)}`,
        lat: 1.3 + (i * 0.5),
        lng: 103.8 + (i * 0.8),
        speed: 12 + Math.random() * 3,
        weather: Math.random() > 0.8 ? 'rough' : 'calm'
      });
    }
    return positions;
  }

  const companyAnalytics = {
    totalVoyages: 156,
    activeVoyages: 23,
    completionRate: 94.2,
    avgDelay: 1.2,
    complianceScore: 96.5,
    revenueMonth: '$45.2M',
    trends: [
      { month: 'Aug', voyages: 18, revenue: 38.2, compliance: 94 },
      { month: 'Sep', voyages: 21, revenue: 42.1, compliance: 95 },
      { month: 'Oct', voyages: 19, revenue: 40.5, compliance: 93 },
      { month: 'Nov', voyages: 24, revenue: 46.8, compliance: 97 },
      { month: 'Dec', voyages: 22, revenue: 44.3, compliance: 96 },
      { month: 'Jan', voyages: 23, revenue: 45.2, compliance: 96.5 }
    ],
    cargoTypes: [
      { name: 'Electronics', value: 35 },
      { name: 'Automobiles', value: 25 },
      { name: 'Machinery', value: 20 },
      { name: 'Textiles', value: 12 },
      { name: 'Other', value: 8 }
    ]
  };

  const portAnalytics = {
    totalArrivals: 342,
    avgTurnaround: 18.5,
    berthUtilization: 87.3,
    revenueMonth: '$8.4M',
    arrivals: [
      { date: 'Jan 10', count: 12, revenue: 1.2 },
      { date: 'Jan 11', count: 15, revenue: 1.5 },
      { date: 'Jan 12', count: 11, revenue: 1.1 },
      { date: 'Jan 13', count: 18, revenue: 1.8 },
      { date: 'Jan 14', count: 14, revenue: 1.4 },
      { date: 'Jan 15', count: 16, revenue: 1.6 },
      { date: 'Jan 16', count: 13, revenue: 1.3 }
    ]
  };

  const insurerAnalytics = {
    activePolicies: 89,
    totalCoverage: '$890M',
    claimsMonth: 3,
    riskScore: 'Low',
    premiumCollected: '$12.3M',
    riskDistribution: [
      { category: 'Low Risk', count: 56, color: '#10b981' },
      { category: 'Medium Risk', count: 28, color: '#f59e0b' },
      { category: 'High Risk', count: 5, color: '#ef4444' }
    ]
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleReplay = (voyage) => {
    setSelectedVoyage(voyage);
    setReplayState({ playing: true, position: 0, speed: 1 });
  };

  useEffect(() => {
    if (replayState.playing && selectedVoyage) {
      const interval = setInterval(() => {
        setReplayState(prev => {
          if (prev.position >= selectedVoyage.positions.length - 1) {
            return { ...prev, playing: false };
          }
          return { ...prev, position: prev.position + 1 };
        });
      }, 1000 / replayState.speed);
      return () => clearInterval(interval);
    }
  }, [replayState.playing, replayState.speed, selectedVoyage]);

  const exportData = (format) => {
    const data = JSON.stringify(voyages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voyages-export-${Date.now()}.${format}`;
    a.click();
  };

  const ComplianceAudit = ({ voyage }) => {
    const checks = [
      { name: 'IMO Compliance', status: voyage.compliance.imo, severity: 'high' },
      { name: 'Customs Clearance', status: voyage.compliance.customs, severity: 'high' },
      { name: 'Safety Standards', status: voyage.compliance.safety, severity: 'medium' },
      { name: 'Environmental Regulations', status: voyage.compliance.environmental, severity: 'medium' }
    ];

    return (
      <div className="vms-compliance-card">
        <h3 className="vms-compliance-title">
          <CheckCircle className="vms-icon-sm vms-text-blue" />
          Compliance Audit - {voyage.id}
        </h3>
        <div className="vms-compliance-checks">
          {checks.map((check, idx) => (
            <div key={idx} className="vms-check-item">
              <div className="vms-check-left">
                {check.status ? (
                  <CheckCircle className="vms-icon-sm vms-text-green" />
                ) : (
                  <XCircle className="vms-icon-sm vms-text-red" />
                )}
                <span className="vms-check-name">{check.name}</span>
                <span className={`vms-severity-badge ${check.severity === 'high' ? 'vms-severity-high' : 'vms-severity-medium'}`}>
                  {check.severity}
                </span>
              </div>
              <span className={check.status ? 'vms-text-green' : 'vms-text-red'}>
                {check.status ? 'Passed' : 'Failed'}
              </span>
            </div>
          ))}
        </div>
        <div className="vms-audit-summary">
          <div className="vms-summary-content">
            <AlertTriangle className="vms-icon-sm vms-summary-icon" />
            <div>
              <p className="vms-summary-title">Audit Summary</p>
              <p className="vms-summary-text">
                {checks.filter(c => c.status).length} of {checks.length} compliance checks passed. 
                {checks.filter(c => !c.status).length > 0 && ' Action required for failed items.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const VoyageReplay = ({ voyage }) => {
    const currentPos = voyage.positions[replayState.position];

    return (
      <div className="vms-replay-container">
        <div className="vms-replay-header">
          <h3 className="vms-replay-title">
            <Play className="vms-icon-sm vms-text-blue" />
            Voyage History Replay - {voyage.id}
          </h3>
          <div className="vms-replay-controls">
            <button onClick={() => setReplayState(prev => ({ ...prev, position: 0 }))} className="vms-control-btn">
              <SkipBack className="vms-icon-xs" />
            </button>
            <button onClick={() => setReplayState(prev => ({ ...prev, playing: !prev.playing }))} className="vms-control-btn-primary">
              {replayState.playing ? <Pause className="vms-icon-xs" /> : <Play className="vms-icon-xs" />}
            </button>
            <select value={replayState.speed} onChange={(e) => setReplayState(prev => ({ ...prev, speed: Number(e.target.value) }))} className="vms-speed-select">
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={4}>4x</option>
            </select>
          </div>
        </div>

        <div className="vms-position-info">
          <div className="vms-info-grid">
            <div className="vms-info-item">
              <span className="vms-info-label">Position:</span>
              <span className="vms-info-value">{currentPos?.time}</span>
            </div>
            <div className="vms-info-item">
              <span className="vms-info-label">Speed:</span>
              <span className="vms-info-value">{currentPos?.speed.toFixed(1)} knots</span>
            </div>
            <div className="vms-info-item">
              <span className="vms-info-label">Weather:</span>
              <span className="vms-info-value vms-capitalize">{currentPos?.weather}</span>
            </div>
            <div className="vms-info-item">
              <span className="vms-info-label">Progress:</span>
              <span className="vms-info-value">{Math.round((replayState.position / voyage.positions.length) * 100)}%</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={voyage.positions.slice(0, replayState.position + 1)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="speed" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>

        <div className="vms-replay-slider">
          <input type="range" min="0" max={voyage.positions.length - 1} value={replayState.position} onChange={(e) => setReplayState(prev => ({ ...prev, position: Number(e.target.value) }))} className="vms-slider" />
        </div>
      </div>
    );
  };

  const CompanyDashboard = () => (
    <div className="vms-dashboard-space">
      <div className="vms-stats-grid">
        <div className="vms-stat-card">
          <div className="vms-stat-content">
            <div>
              <p className="vms-stat-label">Total Voyages</p>
              <p className="vms-stat-value">{companyAnalytics.totalVoyages}</p>
            </div>
            <Ship className="vms-stat-icon vms-icon-blue" />
          </div>
        </div>
        <div className="vms-stat-card">
          <div className="vms-stat-content">
            <div>
              <p className="vms-stat-label">Active Voyages</p>
              <p className="vms-stat-value">{companyAnalytics.activeVoyages}</p>
            </div>
            <Activity className="vms-stat-icon vms-icon-green" />
          </div>
        </div>
        <div className="vms-stat-card">
          <div className="vms-stat-content">
            <div>
              <p className="vms-stat-label">Compliance Score</p>
              <p className="vms-stat-value">{companyAnalytics.complianceScore}%</p>
            </div>
            <CheckCircle className="vms-stat-icon vms-icon-purple" />
          </div>
        </div>
        <div className="vms-stat-card">
          <div className="vms-stat-content">
            <div>
              <p className="vms-stat-label">Monthly Revenue</p>
              <p className="vms-stat-value">{companyAnalytics.revenueMonth}</p>
            </div>
            <DollarSign className="vms-stat-icon vms-icon-yellow" />
          </div>
        </div>
      </div>

      <div className="vms-charts-grid">
        <div className="vms-chart-card">
          <h3 className="vms-chart-title">Voyage & Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={companyAnalytics.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="voyages" stroke="#3b82f6" name="Voyages" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue ($M)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="vms-chart-card">
          <h3 className="vms-chart-title">Cargo Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie data={companyAnalytics.cargoTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {companyAnalytics.cargoTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const PortDashboard = () => (
    <div className="vms-dashboard-space">
      <div className="vms-stats-grid">
        <div className="vms-stat-card">
          <div className="vms-stat-content">
            <div>
              <p className="vms-stat-label">Total Arrivals</p>
              <p className="vms-stat-value">{portAnalytics.totalArrivals}</p>
            </div>
            <Anchor className="vms-stat-icon vms-icon-blue" />
          </div>
        </div>
        <div className="vms-stat-card">
          <div className="vms-stat-content">
            <div>
              <p className="vms-stat-label">Avg Turnaround</p>
              <p className="vms-stat-value">{portAnalytics.avgTurnaround}h</p>
            </div>
            <Clock className="vms-stat-icon vms-icon-green" />
          </div>
        </div>
        <div className="vms-stat-card">
          <div className="vms-stat-content">
            <div>
              <p className="vms-stat-label">Berth Utilization</p>
              <p className="vms-stat-value">{portAnalytics.berthUtilization}%</p>
            </div>
            <TrendingUp className="vms-stat-icon vms-icon-purple" />
          </div>
        </div>
        <div className="vms-stat-card">
          <div className="vms-stat-content">
            <div>
              <p className="vms-stat-label">Monthly Revenue</p>
              <p className="vms-stat-value">{portAnalytics.revenueMonth}</p>
            </div>
            <DollarSign className="vms-stat-icon vms-icon-yellow" />
          </div>
        </div>
      </div>

      <div className="vms-full-chart-card">
        <h3 className="vms-chart-title">Daily Arrivals & Revenue</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={portAnalytics.arrivals}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Arrivals" />
            <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue ($M)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const InsurerDashboard = () => (
    <div className="vms-dashboard-space">
      <div className="vms-stats-grid">
        <div className="vms-stat-card">
          <div className="vms-stat-content">
            <div>
              <p className="vms-stat-label">Active Policies</p>
              <p className="vms-stat-value">{insurerAnalytics.activePolicies}</p>
            </div>
            <Users className="vms-stat-icon vms-icon-blue" />
          </div>
        </div>
        <div className="vms-stat-card">
          <div className="vms-stat-content">
            <div>
              <p className="vms-stat-label">Total Coverage</p>
              <p className="vms-stat-value">{insurerAnalytics.totalCoverage}</p>
            </div>
            <DollarSign className="vms-stat-icon vms-icon-green" />
          </div>
        </div>
        <div className="vms-stat-card">
          <div className="vms-stat-content">
            <div>
              <p className="vms-stat-label">Claims (Month)</p>
              <p className="vms-stat-value">{insurerAnalytics.claimsMonth}</p>
            </div>
            <AlertTriangle className="vms-stat-icon vms-icon-yellow" />
          </div>
        </div>
        <div className="vms-stat-card">
          <div className="vms-stat-content">
            <div>
              <p className="vms-stat-label">Risk Score</p>
              <p className="vms-stat-value">{insurerAnalytics.riskScore}</p>
            </div>
            <CheckCircle className="vms-stat-icon vms-icon-purple" />
          </div>
        </div>
      </div>

      <div className="vms-full-chart-card">
        <h3 className="vms-chart-title">Risk Distribution</h3>
        <div className="vms-risk-grid">
          {insurerAnalytics.riskDistribution.map((risk, idx) => (
            <div key={idx} className="vms-risk-card" style={{ borderColor: risk.color }}>
              <div className="vms-risk-header">
                <span className="vms-risk-category">{risk.category}</span>
                <span className="vms-risk-count">{risk.count}</span>
              </div>
              <div className="vms-progress-bar-bg">
                <div className="vms-progress-bar-fill" style={{ width: `${(risk.count / insurerAnalytics.activePolicies) * 100}%`, backgroundColor: risk.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AdminPanel = () => (
    <div className="vms-dashboard-space">
      <div className="vms-admin-section">
        <div className="vms-section-header">
          <h3 className="vms-section-title">
            <Database className="vms-icon-sm vms-text-blue" />
            API Source Management
          </h3>
          <button className="vms-btn-primary">
            <Download className="vms-icon-xs" />
            Add Source
          </button>
        </div>

        <div className="vms-api-list">
          {apiSources.map(source => (
            <div key={source.id} className="vms-api-item">
              <div className="vms-api-left">
                <div className={`vms-status-dot ${source.status === 'active' ? 'vms-status-active' : 'vms-status-warning'}`} />
                <div>
                  <p className="vms-api-name">{source.name}</p>
                  <p className="vms-api-sync">Last sync: {source.lastSync}</p>
                </div>
              </div>
              <div className="vms-api-right">
                <div className="vms-api-uptime">
                  <p className="vms-uptime-label">Uptime</p>
                  <p className="vms-uptime-value">{source.rate}</p>
                </div>
                <button className="vms-settings-btn">
                  <Settings className="vms-icon-xs" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="vms-admin-section">
        <h3 className="vms-section-title">
          <Download className="vms-icon-sm vms-text-blue" />
          Data Export
        </h3>
        <div className="vms-export-grid">
          <button onClick={() => exportData('json')} className="vms-export-btn vms-export-json">Export JSON</button>
          <button onClick={() => exportData('csv')} className="vms-export-btn vms-export-csv">Export CSV</button>
          <button onClick={() => exportData('xml')} className="vms-export-btn vms-export-xml">Export XML</button>
        </div>
      </div>

      <div className="vms-admin-section">
        <h3 className="vms-section-title">System Monitoring</h3>
        <div className="vms-monitor-grid">
          <div className="vms-monitor-card vms-monitor-green">
            <p className="vms-monitor-label">Database Status</p>
            <p className="vms-monitor-value">Operational</p>
          </div>
          <div className="vms-monitor-card vms-monitor-blue">
            <p className="vms-monitor-label">Active Connections</p>
            <p className="vms-monitor-value">1,247</p>
          </div>
          <div className="vms-monitor-card vms-monitor-purple">
            <p className="vms-monitor-label">API Response Time</p>
            <p className="vms-monitor-value">142ms</p>
          </div>
          <div className="vms-monitor-card vms-monitor-yellow">
            <p className="vms-monitor-label">Server Load</p>
            <p className="vms-monitor-value">34%</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="vms-app">
      <style>{`
        .vms-app {
          min-height: 100vh;
          background-color: #f9fafb;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .vms-header {
          background-color: white;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .vms-header-content {
          max-width: 1280px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .vms-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .vms-logo-icon {
          width: 32px;
          height: 32px;
          color: #3b82f6;
        }

        .vms-app-title {
          font-size: 24px;
          font-weight: bold;
          color: #111827;
          margin: 0;
        }

        .vms-header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .vms-role-select {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background-color: white;
          cursor: pointer;
          font-size: 14px;
        }

        .vms-settings-icon-btn {
          padding: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 8px;
          transition: background-color 0.2s;
        }

        .vms-settings-icon-btn:hover {
          background-color: #f3f4f6;
        }

        .vms-main-content {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px;
        }

        .vms-tabs-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          margin-bottom: 24px;
        }

        .vms-tabs {
          display: flex;
          gap: 4px;
          padding: 8px;
        }

        .vms-tab {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .vms-tab:hover {
          background-color: #f3f4f6;
        }

        .vms-tab-active {
          background-color: #3b82f6;
          color: white;
        }

        .vms-dashboard-space {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .vms-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .vms-stat-card {
          background-color: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .vms-stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .vms-stat-label {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .vms-stat-value {
          font-size: 32px;
          font-weight: bold;
          margin-top: 4px;
          color: #111827;
        }

        .vms-stat-icon {
          width: 40px;
          height: 40px;
        }

        .vms-icon-blue { color: #3b82f6; }
        .vms-icon-green { color: #10b981; }
        .vms-icon-purple { color: #8b5cf6; }
        .vms-icon-yellow { color: #f59e0b; }
        .vms-icon-red { color: #ef4444; }
        .vms-icon-sm { width: 20px; height: 20px; }
        .vms-icon-xs { width: 16px; height: 16px; }

        .vms-text-blue { color: #3b82f6; }
        .vms-text-green { color: #10b981; }
        .vms-text-red { color: #ef4444; }

        .vms-charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .vms-chart-card {
          background-color: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .vms-chart-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #111827;
        }

        .vms-full-chart-card {
          background-color: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .vms-risk-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .vms-risk-card {
          padding: 16px;
          border: 2px solid;
          border-radius: 8px;
        }

        .vms-risk-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .vms-risk-category {
          font-weight: 500;
          font-size: 14px;
        }

        .vms-risk-count {
          font-size: 24px;
          font-weight: bold;
        }

        .vms-progress-bar-bg {
          width: 100%;
          background-color: #e5e7eb;
          border-radius: 9999px;
          height: 8px;
          overflow: hidden;
        }

        .vms-progress-bar-fill {
          height: 8px;
          border-radius: 9999px;
          transition: width 0.3s;
        }

        .vms-admin-section {
          background-color: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .vms-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .vms-section-title {
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #111827;
          margin: 0;
        }

        .vms-btn-primary {
          padding: 10px 16px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background-color 0.2s;
        }

        .vms-btn-primary:hover {
          background-color: #2563eb;
        }

        .vms-api-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .vms-api-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          transition: background-color 0.2s;
        }

        .vms-api-item:hover {
          background-color: #f9fafb;
        }

        .vms-api-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .vms-status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .vms-status-active {
          background-color: #10b981;
        }

        .vms-status-warning {
          background-color: #f59e0b;
        }

        .vms-api-name {
          font-weight: 500;
          margin-bottom: 2px;
          color: #111827;
        }

        .vms-api-sync {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .vms-api-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .vms-api-uptime {
          text-align: right;
        }

        .vms-uptime-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 2px;
        }

        .vms-uptime-value {
          font-weight: 500;
          color: #111827;
          margin: 0;
        }

        .vms-settings-btn {
          padding: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .vms-settings-btn:hover {
          background-color: #f3f4f6;
        }

        .vms-export-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .vms-export-btn {
          padding: 16px;
          border: 2px solid;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          background-color: white;
          transition: all 0.2s;
        }

        .vms-export-json {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .vms-export-json:hover {
          background-color: #eff6ff;
        }

        .vms-export-csv {
          border-color: #10b981;
          color: #10b981;
        }

        .vms-export-csv:hover {
          background-color: #f0fdf4;
        }

        .vms-export-xml {
          border-color: #8b5cf6;
          color: #8b5cf6;
        }

        .vms-export-xml:hover {
          background-color: #faf5ff;
        }

        .vms-monitor-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .vms-monitor-card {
          padding: 16px;
          border-radius: 8px;
          border: 1px solid;
        }

        .vms-monitor-green {
          background-color: #f0fdf4;
          border-color: #bbf7d0;
        }

        .vms-monitor-blue {
          background-color: #eff6ff;
          border-color: #bfdbfe;
        }

        .vms-monitor-purple {
          background-color: #faf5ff;
          border-color: #e9d5ff;
        }

        .vms-monitor-yellow {
          background-color: #fefce8;
          border-color: #fef08a;
        }

        .vms-monitor-label {
          font-size: 14px;
          margin-bottom: 4px;
        }

        .vms-monitor-green .vms-monitor-label { color: #166534; }
        .vms-monitor-blue .vms-monitor-label { color: #1e40af; }
        .vms-monitor-purple .vms-monitor-label { color: #6b21a8; }
        .vms-monitor-yellow .vms-monitor-label { color: #854d0e; }

        .vms-monitor-value {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }

        .vms-monitor-green .vms-monitor-value { color: #14532d; }
        .vms-monitor-blue .vms-monitor-value { color: #1e3a8a; }
        .vms-monitor-purple .vms-monitor-value { color: #581c87; }
        .vms-monitor-yellow .vms-monitor-value { color: #713f12; }

        .vms-filter-bar {
          background-color: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .vms-filter-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .vms-filter-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background-color: white;
          cursor: pointer;
        }

        .vms-voyage-list {
          display: grid;
          gap: 16px;
        }

        .vms-voyage-item {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          padding: 24px;
        }

        .vms-voyage-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .vms-voyage-title-block h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #111827;
        }

        .vms-voyage-route {
          color: #6b7280;
          margin: 0;
        }

        .vms-voyage-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .vms-status-badge {
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 500;
        }

        .vms-status-completed {
          background-color: #d1fae5;
          color: #065f46;
        }

        .vms-status-delayed {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .vms-status-transit {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .vms-replay-btn {
          padding: 8px 16px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .vms-replay-btn:hover {
          background-color: #2563eb;
        }

        .vms-voyage-details {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }

        .vms-detail-block p:first-child {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 4px 0;
        }

        .vms-detail-block p:last-child {
          font-weight: 500;
          color: #111827;
          margin: 0;
        }

        .vms-voyage-progress {
          margin-bottom: 12px;
        }

        .vms-progress-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .vms-progress-label {
          color: #6b7280;
        }

        .vms-progress-percent {
          font-weight: 500;
          color: #111827;
        }

        .vms-progress-track {
          width: 100%;
          background-color: #e5e7eb;
          border-radius: 9999px;
          height: 8px;
          overflow: hidden;
        }

        .vms-progress-indicator {
          background-color: #3b82f6;
          height: 8px;
          border-radius: 9999px;
          transition: width 0.3s;
        }

        .vms-compliance-badges {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .vms-compliance-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
        }

        .vms-capitalize {
          text-transform: capitalize;
        }

        .vms-compliance-card {
          background-color: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .vms-compliance-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #111827;
        }

        .vms-compliance-checks {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .vms-check-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background-color: #f9fafb;
          border-radius: 6px;
        }

        .vms-check-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .vms-check-name {
          font-weight: 500;
          color: #111827;
        }

        .vms-severity-badge {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .vms-severity-high {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .vms-severity-medium {
          background-color: #fef3c7;
          color: #92400e;
        }

        .vms-audit-summary {
          margin-top: 24px;
          padding: 16px;
          background-color: #eff6ff;
          border-radius: 6px;
          border: 1px solid: #bfdbfe;
        }

        .vms-summary-content {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .vms-summary-icon {
          color: #3b82f6;
          margin-top: 2px;
        }

        .vms-summary-title {
          font-weight: 500;
          color: #1e3a8a;
          margin: 0 0 4px 0;
        }

        .vms-summary-text {
          font-size: 14px;
          color: #1e40af;
          margin: 0;
        }

        .vms-replay-container {
          background-color: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .vms-replay-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .vms-replay-title {
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #111827;
        }

        .vms-replay-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .vms-control-btn {
          padding: 8px;
          background-color: #f3f4f6;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .vms-control-btn:hover {
          background-color: #e5e7eb;
        }

        .vms-control-btn-primary {
          padding: 8px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .vms-control-btn-primary:hover {
          background-color: #2563eb;
        }

        .vms-speed-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background-color: white;
          cursor: pointer;
        }

        .vms-position-info {
          margin-bottom: 16px;
          padding: 16px;
          background-color: #f9fafb;
          border-radius: 6px;
        }

        .vms-info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          font-size: 14px;
        }

        .vms-info-item {
          display: flex;
          flex-direction: column;
        }

        .vms-info-label {
          color: #6b7280;
          margin-bottom: 2px;
        }

        .vms-info-value {
          font-weight: 500;
          color: #111827;
          margin-left: 4px;
        }

        .vms-replay-slider {
          margin-top: 16px;
        }

        .vms-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e5e7eb;
          outline: none;
          cursor: pointer;
        }

        .vms-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 24px;
        }

        .vms-modal {
          background-color: white;
          border-radius: 8px;
          max-width: 1024px;
          width: 100%;
          max-height: 90vh;
          overflow: auto;
        }

        .vms-modal-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          background-color: white;
        }

        .vms-modal-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
          color: #111827;
        }

        .vms-close-btn {
          padding: 8px 16px;
          background-color: #e5e7eb;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .vms-close-btn:hover {
          background-color: #d1d5db;
        }

        .vms-modal-content {
          padding: 24px;
        }
      `}</style>

      <div className="vms-header">
        <div className="vms-header-content">
          <div className="vms-logo">
            <Ship className="vms-logo-icon" />
            <h1 className="vms-app-title">Voyages</h1>
          </div>
          <div className="vms-header-actions">
            <select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="vms-role-select">
              <option value="company">Company View</option>
              <option value="port">Port Authority</option>
              <option value="insurer">Insurer View</option>
              <option value="admin">Admin Panel</option>
            </select>
            <button className="vms-settings-icon-btn">
              <Settings className="vms-icon-sm" />
            </button>
          </div>
        </div>
      </div>

      <div className="vms-main-content">
        <div className="vms-tabs-container">
          <div className="vms-tabs">
            <button onClick={() => setActiveTab('dashboard')} className={`vms-tab ${activeTab === 'dashboard' ? 'vms-tab-active' : ''}`}>
              <BarChart3 className="vms-icon-xs" />
              Dashboard
            </button>
            <button onClick={() => setActiveTab('voyages')} className={`vms-tab ${activeTab === 'voyages' ? 'vms-tab-active' : ''}`}>
              <Ship className="vms-icon-xs" />
              Voyages
            </button>
            <button onClick={() => setActiveTab('compliance')} className={`vms-tab ${activeTab === 'compliance' ? 'vms-tab-active' : ''}`}>
              <CheckCircle className="vms-icon-xs" />
              Compliance
            </button>
            {userRole === 'admin' && (
              <button onClick={() => setActiveTab('admin')} className={`vms-tab ${activeTab === 'admin' ? 'vms-tab-active' : ''}`}>
                <Settings className="vms-icon-xs" />
                Admin
              </button>
            )}
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {userRole === 'company' && <CompanyDashboard />}
            {userRole === 'port' && <PortDashboard />}
            {userRole === 'insurer' && <InsurerDashboard />}
            {userRole === 'admin' && <AdminPanel />}
          </>
        )}

        {activeTab === 'voyages' && (
          <div className="vms-dashboard-space">
            <div className="vms-filter-bar">
              <div className="vms-filter-content">
                <Filter className="vms-icon-sm" style={{ color: '#6b7280' }} />
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="vms-filter-select">
                  <option value="all">All Status</option>
                  <option value="in-transit">In Transit</option>
                  <option value="completed">Completed</option>
                  <option value="delayed">Delayed</option>
                </select>
                <select value={filters.compliance} onChange={(e) => setFilters({ ...filters, compliance: e.target.value })} className="vms-filter-select">
                  <option value="all">All Compliance</option>
                  <option value="compliant">Compliant</option>
                  <option value="issues">Has Issues</option>
                </select>
              </div>
            </div>

            <div className="vms-voyage-list">
              {voyages.map(voyage => (
                <div key={voyage.id} className="vms-voyage-item">
                  <div className="vms-voyage-header">
                    <div className="vms-voyage-title-block">
                      <h3>{voyage.vessel}</h3>
                      <p className="vms-voyage-route">{voyage.route}</p>
                    </div>
                    <div className="vms-voyage-actions">
                      <span className={`vms-status-badge ${voyage.status === 'completed' ? 'vms-status-completed' : voyage.status === 'delayed' ? 'vms-status-delayed' : 'vms-status-transit'}`}>
                        {voyage.status}
                      </span>
                      <button onClick={() => handleReplay(voyage)} className="vms-replay-btn">
                        <Play className="vms-icon-xs" />
                        Replay
                      </button>
                    </div>
                  </div>

                  <div className="vms-voyage-details">
                    <div className="vms-detail-block">
                      <p>Voyage ID</p>
                      <p>{voyage.id}</p>
                    </div>
                    <div className="vms-detail-block">
                      <p>Cargo</p>
                      <p>{voyage.cargo}</p>
                    </div>
                    <div className="vms-detail-block">
                      <p>Value</p>
                      <p>{voyage.value}</p>
                    </div>
                    <div className="vms-detail-block">
                      <p>Departure</p>
                      <p>{voyage.departure}</p>
                    </div>
                    <div className="vms-detail-block">
                      <p>ETA</p>
                      <p>{voyage.eta}</p>
                    </div>
                  </div>

                  <div className="vms-voyage-progress">
                    <div className="vms-progress-header">
                      <span className="vms-progress-label">Progress</span>
                      <span className="vms-progress-percent">{voyage.completion}%</span>
                    </div>
                    <div className="vms-progress-track">
                      <div className="vms-progress-indicator" style={{ width: `${voyage.completion}%` }} />
                    </div>
                  </div>

                  <div className="vms-compliance-badges">
                    {Object.entries(voyage.compliance).map(([key, value]) => (
                      <div key={key} className="vms-compliance-item">
                        {value ? <CheckCircle className="vms-icon-xs vms-text-green" /> : <XCircle className="vms-icon-xs vms-text-red" />}
                        <span className="vms-capitalize">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="vms-dashboard-space">
            {voyages.map(voyage => (
              <ComplianceAudit key={voyage.id} voyage={voyage} />
            ))}
          </div>
        )}

        {activeTab === 'admin' && userRole === 'admin' && <AdminPanel />}

        {selectedVoyage && (
          <div className="vms-modal-overlay">
            <div className="vms-modal">
              <div className="vms-modal-header">
                <h2 className="vms-modal-title">Voyage Replay</h2>
                <button onClick={() => setSelectedVoyage(null)} className="vms-close-btn">Close</button>
              </div>
              <div className="vms-modal-content">
                <VoyageReplay voyage={selectedVoyage} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Voyages;