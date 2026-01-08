// pages/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Activity, TrendingUp, BarChart3, Clock, Info } from 'lucide-react';
const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div style={{ 
      width: '100%', 
      minHeight: 'calc(100vh - 64px)',
      backgroundColor: '#f8fafc',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginBottom: '8px'
        }}>
          <div style={{ 
            backgroundColor: '#3b82f6', 
            padding: '8px', 
            borderRadius: '8px' 
          }}>
            <Activity style={{ width: '24px', height: '24px', color: 'white' }} />
          </div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            margin: 0
          }}>
            Dashboard
          </h1>
        </div>
        <p style={{ 
          fontSize: '16px', 
          color: '#64748b', 
          marginBottom: '32px', 
          marginTop: '8px'
        }}>
          Maritime Vessel Tracking System Overview
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px', 
          marginBottom: '24px'
        }}>
          
          {/* Vessels Card */}
          <div 
            onClick={() => navigate('/vessels')}
            style={{ 
              background: 'white', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
              padding: '24px',
              cursor: 'pointer',
              height: '160px',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', marginTop: 0 }}>
                  VESSELS
                </p>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', margin: 0, lineHeight: 1 }}>
                  125
                </p>
              </div>
              <div style={{ background: '#f3e8ff', padding: '16px', borderRadius: '16px', flexShrink: 0 }}>
                <Activity style={{ width: '32px', height: '32px', color: '#9333ea', display: 'block' }} />
              </div>
            </div>
            <span style={{ color: '#2563eb', fontWeight: '500', fontSize: '14px' }}>
              View details →
            </span>
          </div>

          {/* Ports Card */}
          <div 
            onClick={() => navigate('/ports')}
            style={{ 
              background: 'white', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
              padding: '24px',
              cursor: 'pointer',
              height: '160px',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', marginTop: 0 }}>
                  PORTS
                </p>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', margin: 0, lineHeight: 1 }}>
                  354
                </p>
              </div>
              <div style={{ background: '#fce7f3', padding: '16px', borderRadius: '16px', flexShrink: 0 }}>
                <TrendingUp style={{ width: '32px', height: '32px', color: '#ec4899', display: 'block' }} />
              </div>
            </div>
            <span style={{ color: '#2563eb', fontWeight: '500', fontSize: '14px' }}>
              View details →
            </span>
          </div>

          {/* Voyages Card */}
          <div 
            onClick={() => navigate('/voyages')}
            style={{ 
              background: 'white', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
              padding: '24px',
              cursor: 'pointer',
              height: '160px',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', marginTop: 0 }}>
                  VOYAGES
                </p>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', margin: 0, lineHeight: 1 }}>
                  266
                </p>
              </div>
              <div style={{ background: '#cffafe', padding: '16px', borderRadius: '16px', flexShrink: 0 }}>
                <BarChart3 style={{ width: '32px', height: '32px', color: '#06b6d4', display: 'block' }} />
              </div>
            </div>
            <span style={{ color: '#2563eb', fontWeight: '500', fontSize: '14px' }}>
              View details →
            </span>
          </div>

          {/* Events Card */}
          <div 
            onClick={() => navigate('/events')}
            style={{ 
              background: 'white', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
              padding: '24px',
              cursor: 'pointer',
              height: '160px',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', marginTop: 0 }}>
                  EVENTS
                </p>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', margin: 0, lineHeight: 1 }}>
                  121
                </p>
              </div>
              <div style={{ background: '#d1fae5', padding: '16px', borderRadius: '16px', flexShrink: 0 }}>
                <Clock style={{ width: '32px', height: '32px', color: '#10b981', display: 'block' }} />
              </div>
            </div>
            <span style={{ color: '#2563eb', fontWeight: '500', fontSize: '14px' }}>
              View details →
            </span>
          </div>

          {/* Notifications Card */}
          <div 
            onClick={() => navigate('/notifications')}
            style={{ 
              background: 'white', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
              padding: '24px',
              cursor: 'pointer',
              height: '160px',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px'}}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', marginTop: 0 }}>
                  NOTIFICATIONS
                </p>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', margin: 0, lineHeight: 1 }}>
                  123
                </p>
              </div>
              <div style={{ background: '#fed7aa', padding: '16px', borderRadius: '16px', flexShrink: 0 }}>
                <Info style={{ width: '32px', height: '32px', color: '#f97316', display: 'block' }} />
              </div>
            </div>
            <span style={{ color: '#2563eb', fontWeight: '500', fontSize: '14px' }}>
              View details →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;