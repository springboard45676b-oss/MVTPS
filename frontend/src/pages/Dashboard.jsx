// pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Activity, TrendingUp, BarChart3, Clock, Ship, Anchor, MapPin, AlertTriangle, ArrowUp, ArrowDown, Minus, Globe, Compass, Navigation } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ 
      width: '100%', 
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', 
                padding: '12px', 
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)'
              }}>
                <Activity style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '32px', 
                  fontWeight: 'bold', 
                  color: '#1f2937',
                  margin: 0,
                  textShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  Dashboard
                </h1>
                <p style={{ 
                  fontSize: '16px', 
                  color: '#64748b', 
                  margin: '4px 0 0 0'
                }}>
                  Maritime Vessel Tracking System Overview
                </p>
              </div>
            </div>
            
            {/* Live Clock */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                    SYSTEM TIME
                  </div>
                  <div style={{ fontSize: '16px', color: '#1f2937', fontWeight: '600', fontFamily: 'monospace' }}>
                    {currentTime.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          color: 'white'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                padding: '12px', 
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <Ship style={{ width: '24px', height: '24px' }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '600' }}>Active Vessels</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>98</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                padding: '12px', 
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <Anchor style={{ width: '24px', height: '24px' }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '600' }}>Docked</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>27</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                padding: '12px', 
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <Navigation style={{ width: '24px', height: '24px' }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '600' }}>In Transit</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>71</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                padding: '12px', 
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <Globe style={{ width: '24px', height: '24px' }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '600' }}>Active Ports</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>18</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                padding: '12px', 
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <Compass style={{ width: '24px', height: '24px' }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '600' }}>Completed</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>189</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                padding: '12px', 
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <AlertTriangle style={{ width: '24px', height: '24px' }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '600' }}>Active Alerts</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>5</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Stats Cards - 3 Column Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '24px', 
          marginBottom: '32px'
        }}>
          
          {/* Vessels Card */}
          <div 
            onClick={() => navigate('/vessels')}
            style={{ 
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)', 
              padding: '32px',
              cursor: 'pointer',
              height: '220px',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(147, 51, 234, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
            }}
          >
            {/* Background Decoration */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '250px',
              height: '250px',
              background: 'linear-gradient(135deg, #f3e8ff 0%, transparent 100%)',
              borderRadius: '50%',
              opacity: 0.6
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '12px', marginTop: 0, letterSpacing: '0.5px' }}>
                    VESSELS
                  </p>
                  <p style={{ fontSize: '56px', fontWeight: 'bold', color: '#111827', margin: 0, lineHeight: 1 }}>
                    125
                  </p>
                </div>
                <div style={{ 
                  background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)', 
                  padding: '18px', 
                  borderRadius: '18px', 
                  flexShrink: 0,
                  boxShadow: '0 4px 16px rgba(147, 51, 234, 0.2)'
                }}>
                  <Activity style={{ width: '36px', height: '36px', color: '#9333ea', display: 'block' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#2563eb', fontWeight: '600', fontSize: '15px' }}>
                  View details →
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowUp style={{ width: '16px', height: '16px', color: '#10b981' }} />
                  <span style={{ fontSize: '14px', color: '#10b981', fontWeight: '600' }}>
                    +12%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ports Card */}
          <div 
            onClick={() => navigate('/ports')}
            style={{ 
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)', 
              padding: '32px',
              cursor: 'pointer',
              height: '220px',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(236, 72, 153, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
            }}
          >
            {/* Background Decoration */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '250px',
              height: '250px',
              background: 'linear-gradient(135deg, #fce7f3 0%, transparent 100%)',
              borderRadius: '50%',
              opacity: 0.6
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '12px', marginTop: 0, letterSpacing: '0.5px' }}>
                    PORTS
                  </p>
                  <p style={{ fontSize: '56px', fontWeight: 'bold', color: '#111827', margin: 0, lineHeight: 1 }}>
                    354
                  </p>
                </div>
                <div style={{ 
                  background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', 
                  padding: '18px', 
                  borderRadius: '18px', 
                  flexShrink: 0,
                  boxShadow: '0 4px 16px rgba(236, 72, 153, 0.2)'
                }}>
                  <TrendingUp style={{ width: '36px', height: '36px', color: '#ec4899', display: 'block' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#2563eb', fontWeight: '600', fontSize: '15px' }}>
                  View details →
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowUp style={{ width: '16px', height: '16px', color: '#10b981' }} />
                  <span style={{ fontSize: '14px', color: '#10b981', fontWeight: '600' }}>
                    +8%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Voyages Card */}
          <div 
            onClick={() => navigate('/voyages')}
            style={{ 
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)', 
              padding: '32px',
              cursor: 'pointer',
              height: '220px',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(6, 182, 212, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
            }}
          >
            {/* Background Decoration */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '250px',
              height: '250px',
              background: 'linear-gradient(135deg, #cffafe 0%, transparent 100%)',
              borderRadius: '50%',
              opacity: 0.6
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '12px', marginTop: 0, letterSpacing: '0.5px' }}>
                    VOYAGES
                  </p>
                  <p style={{ fontSize: '56px', fontWeight: 'bold', color: '#111827', margin: 0, lineHeight: 1 }}>
                    266
                  </p>
                </div>
                <div style={{ 
                  background: 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)', 
                  padding: '18px', 
                  borderRadius: '18px', 
                  flexShrink: 0,
                  boxShadow: '0 4px 16px rgba(6, 182, 212, 0.2)'
                }}>
                  <BarChart3 style={{ width: '36px', height: '36px', color: '#06b6d4', display: 'block' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#2563eb', fontWeight: '600', fontSize: '15px' }}>
                  View details →
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Minus style={{ width: '16px', height: '16px', color: '#64748b' }} />
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                    0%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Two Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px'
        }}>
          {/* Recent Activity Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: '600', 
              color: '#1f2937', 
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Activity style={{ width: '22px', height: '22px', color: '#3b82f6' }} />
              Recent Activity
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { type: 'vessel', action: 'Vessel MV Ocean Star departed from Port of Singapore', time: '5 minutes ago', color: '#9333ea' },
                { type: 'port', action: 'Port of Shanghai congestion level updated to High', time: '15 minutes ago', color: '#ec4899' },
                { type: 'voyage', action: 'Voyage #VOY-2024-156 completed successfully', time: '32 minutes ago', color: '#06b6d4' },
                { type: 'alert', action: 'Weather alert issued for Gulf of Aden region', time: '1 hour ago', color: '#f97316' },
                { type: 'vessel', action: 'MV Pacific Pearl arrived at Port of Los Angeles', time: '2 hours ago', color: '#9333ea' },
              ].map((activity, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  background: 'rgba(248, 250, 252, 0.5)',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(248, 250, 252, 0.5)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                >
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: activity.color,
                    boxShadow: `0 0 10px ${activity.color}40`,
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: '#1f2937', fontSize: '14px', fontWeight: '500' }}>
                      {activity.action}
                    </p>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '12px' }}>
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: '600', 
              color: '#1f2937', 
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Globe style={{ width: '22px', height: '22px', color: '#3b82f6' }} />
              System Status
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { name: 'Tracking System', status: 'Operational', percentage: 100, color: '#10b981' },
                { name: 'Weather Integration', status: 'Operational', percentage: 100, color: '#10b981' },
                { name: 'Port Management', status: 'Operational', percentage: 98, color: '#10b981' },
                { name: 'Alert System', status: 'Active', percentage: 95, color: '#3b82f6' },
                { name: 'Data Sync', status: 'Syncing', percentage: 87, color: '#f59e0b' },
              ].map((system, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: system.color,
                        boxShadow: `0 0 8px ${system.color}40`
                      }} />
                      <span style={{ color: '#1f2937', fontSize: '14px', fontWeight: '500' }}>
                        {system.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#64748b', fontSize: '13px' }}>
                        {system.status}
                      </span>
                      <span style={{ color: system.color, fontSize: '13px', fontWeight: '600' }}>
                        {system.percentage}%
                      </span>
                    </div>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${system.percentage}%`,
                      height: '100%',
                      background: system.color,
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;