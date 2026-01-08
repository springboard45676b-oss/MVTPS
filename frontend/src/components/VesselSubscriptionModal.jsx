import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, X, Check, AlertTriangle } from 'lucide-react';
import { subscribeToVesselAlerts, unsubscribeFromVesselAlerts, getVesselSubscriptions } from '../api/vessels';

const VesselSubscriptionModal = ({ vessel, isOpen, onClose, user }) => {
  const [subscriptions, setSubscriptions] = useState({
    speed: false,
    port: false,
    status: false
  });
  const [speedThreshold, setSpeedThreshold] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && vessel) {
      // Reset form
      setSubscriptions({
        speed: false,
        port: false,
        status: false
      });
      setSpeedThreshold('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, vessel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!Object.values(subscriptions).some(v => v)) {
      setError('Please select at least one alert type');
      return;
    }

    if (subscriptions.speed && !speedThreshold) {
      setError('Please set a speed threshold for speed alerts');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const alertTypes = Object.keys(subscriptions).filter(key => subscriptions[key]);
      const subscriptionData = {
        alert_types: alertTypes,
        speed_threshold: subscriptions.speed ? parseFloat(speedThreshold) : null,
        is_active: true
      };

      await subscribeToVesselAlerts(vessel.id, subscriptionData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError('Failed to subscribe to alerts. Please try again.');
      console.error('Subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !vessel) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        border: '1px solid #334155'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'white',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Bell style={{ width: '20px', height: '20px' }} />
            Alert Subscription
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <div style={{
          backgroundColor: '#334155',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ color: 'white', fontWeight: '500', marginBottom: '4px' }}>
            {vessel.name}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>
            MMSI: {vessel.mmsi}
          </div>
        </div>

        {success && (
          <div style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Check style={{ width: '16px', height: '16px' }} />
            Successfully subscribed to alerts!
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle style={{ width: '16px', height: '16px' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '12px'
            }}>
              Alert Types
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'white',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={subscriptions.speed}
                  onChange={(e) => setSubscriptions({...subscriptions, speed: e.target.checked})}
                  style={{ width: '18px', height: '18px' }}
                />
                <div>
                  <div style={{ fontWeight: '500' }}>Speed Threshold</div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                    Alert when vessel exceeds specified speed
                  </div>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'white',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={subscriptions.port}
                  onChange={(e) => setSubscriptions({...subscriptions, port: e.target.checked})}
                  style={{ width: '18px', height: '18px' }}
                />
                <div>
                  <div style={{ fontWeight: '500' }}>Port Entry/Exit</div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                    Alert when vessel enters or exits a port
                  </div>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'white',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={subscriptions.status}
                  onChange={(e) => setSubscriptions({...subscriptions, status: e.target.checked})}
                  style={{ width: '18px', height: '18px' }}
                />
                <div>
                  <div style={{ fontWeight: '500' }}>Status Change</div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                    Alert when vessel status changes
                  </div>
                </div>
              </label>
            </div>
          </div>

          {subscriptions.speed && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: 'white',
                marginBottom: '8px'
              }}>
                Speed Threshold (knots)
              </label>
              <input
                type="number"
                value={speedThreshold}
                onChange={(e) => setSpeedThreshold(e.target.value)}
                placeholder="Enter speed threshold"
                step="0.1"
                min="0"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#334155',
                  color: 'white',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#334155',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: loading ? '#475569' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VesselSubscriptionModal;
