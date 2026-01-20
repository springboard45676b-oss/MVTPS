import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const RealTimeSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    subscription_type: 'global',
    notification_types: ['position_update', 'status_change'],
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    update_frequency: 5,
    vessel_ids: [],
    min_latitude: '',
    max_latitude: '',
    min_longitude: '',
    max_longitude: '',
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchVessels();
    fetchStats();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/vessels/realtime-subscriptions/');
      setSubscriptions(response.data.subscriptions || []);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      toast.error('Failed to load subscriptions');
    }
  };

  const fetchVessels = async () => {
    try {
      const response = await api.get('/vessels/');
      setVessels(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch vessels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/vessels/realtime-subscriptions/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    
    try {
      const payload = { ...formData };
      
      // Clean up payload based on subscription type
      if (payload.subscription_type !== 'region') {
        delete payload.min_latitude;
        delete payload.max_latitude;
        delete payload.min_longitude;
        delete payload.max_longitude;
      }
      
      if (payload.subscription_type !== 'vessel_specific') {
        delete payload.vessel_ids;
      }

      const response = await api.post('/vessels/realtime-subscriptions/', payload);
      
      toast.success('Real-time subscription created successfully!');
      setShowCreateForm(false);
      setFormData({
        subscription_type: 'global',
        notification_types: ['position_update', 'status_change'],
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        update_frequency: 5,
        vessel_ids: [],
        min_latitude: '',
        max_latitude: '',
        min_longitude: '',
        max_longitude: '',
      });
      
      fetchSubscriptions();
      fetchStats();
      
    } catch (error) {
      console.error('Failed to create subscription:', error);
      const errorMessage = error.response?.data?.detail || 
                          Object.values(error.response?.data || {}).flat().join(', ') ||
                          'Failed to create subscription';
      toast.error(errorMessage);
    }
  };

  const handleToggleSubscription = async (subscriptionId) => {
    try {
      const response = await api.post(`/vessels/realtime-subscriptions/${subscriptionId}/toggle/`);
      toast.success(response.data.message);
      fetchSubscriptions();
      fetchStats();
    } catch (error) {
      toast.error('Failed to toggle subscription');
    }
  };

  const handleDeleteSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    try {
      await api.delete(`/vessels/realtime-subscriptions/${subscriptionId}/`);
      toast.success('Subscription deleted successfully');
      fetchSubscriptions();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete subscription');
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'notification_types') {
        const updatedTypes = checked
          ? [...formData.notification_types, value]
          : formData.notification_types.filter(type => type !== value);
        setFormData({ ...formData, notification_types: updatedTypes });
      } else {
        setFormData({ ...formData, [name]: checked });
      }
    } else if (name === 'vessel_ids') {
      const selectedVessels = Array.from(e.target.selectedOptions, option => parseInt(option.value));
      setFormData({ ...formData, vessel_ids: selectedVessels });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const getSubscriptionTypeDisplay = (type) => {
    const types = {
      'global': 'Global Coverage',
      'region': 'Regional Coverage',
      'vessel_specific': 'Specific Vessels'
    };
    return types[type] || type;
  };

  const getNotificationTypesDisplay = (types) => {
    const typeMap = {
      'position_update': 'Position Updates',
      'status_change': 'Status Changes',
      'port_arrival': 'Port Arrivals',
      'port_departure': 'Port Departures',
      'emergency': 'Emergency Alerts',
      'all': 'All Updates'
    };
    return types.map(type => typeMap[type] || type).join(', ');
  };

  if (loading) {
    return <div className="loading">Loading subscriptions...</div>;
  }

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <div className="page-header">
        <h1>🔔 Real-Time Data Subscriptions</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Create Subscription'}
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="card">
          <h3>📊 Subscription Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="stat-item">
              <h4>{stats.total_subscriptions}</h4>
              <p>Total Subscriptions</p>
            </div>
            <div className="stat-item">
              <h4>{stats.active_subscriptions}</h4>
              <p>Active Subscriptions</p>
            </div>
            <div className="stat-item">
              <h4>{stats.notification_preferences.email}</h4>
              <p>Email Notifications</p>
            </div>
            <div className="stat-item">
              <h4>{stats.notification_preferences.push}</h4>
              <p>Push Notifications</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Subscription Form */}
      {showCreateForm && (
        <div className="card">
          <h3>Create New Real-Time Subscription</h3>
          <form onSubmit={handleCreateSubscription}>
            <div className="form-group">
              <label>Subscription Type</label>
              <select
                name="subscription_type"
                className="form-control"
                value={formData.subscription_type}
                onChange={handleFormChange}
                required
              >
                <option value="global">Global Coverage - All vessels worldwide</option>
                <option value="region">Regional Coverage - Specific geographic area</option>
                <option value="vessel_specific">Specific Vessels - Selected vessels only</option>
              </select>
            </div>

            {/* Regional bounds */}
            {formData.subscription_type === 'region' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Min Latitude</label>
                  <input
                    type="number"
                    name="min_latitude"
                    className="form-control"
                    value={formData.min_latitude}
                    onChange={handleFormChange}
                    step="0.0001"
                    placeholder="-90 to 90"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Max Latitude</label>
                  <input
                    type="number"
                    name="max_latitude"
                    className="form-control"
                    value={formData.max_latitude}
                    onChange={handleFormChange}
                    step="0.0001"
                    placeholder="-90 to 90"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Min Longitude</label>
                  <input
                    type="number"
                    name="min_longitude"
                    className="form-control"
                    value={formData.min_longitude}
                    onChange={handleFormChange}
                    step="0.0001"
                    placeholder="-180 to 180"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Max Longitude</label>
                  <input
                    type="number"
                    name="max_longitude"
                    className="form-control"
                    value={formData.max_longitude}
                    onChange={handleFormChange}
                    step="0.0001"
                    placeholder="-180 to 180"
                    required
                  />
                </div>
              </div>
            )}

            {/* Vessel selection */}
            {formData.subscription_type === 'vessel_specific' && (
              <div className="form-group">
                <label>Select Vessels (hold Ctrl to select multiple)</label>
                <select
                  name="vessel_ids"
                  className="form-control"
                  multiple
                  value={formData.vessel_ids}
                  onChange={handleFormChange}
                  style={{ height: '150px' }}
                  required
                >
                  {vessels.map(vessel => (
                    <option key={vessel.id} value={vessel.id}>
                      {vessel.name} ({vessel.mmsi}) - {vessel.vessel_type}
                    </option>
                  ))}
                </select>
                <small className="form-text text-muted">
                  Selected: {formData.vessel_ids.length} vessels
                </small>
              </div>
            )}

            {/* Notification types */}
            <div className="form-group">
              <label>Notification Types</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {[
                  { value: 'position_update', label: 'Position Updates' },
                  { value: 'status_change', label: 'Status Changes' },
                  { value: 'port_arrival', label: 'Port Arrivals' },
                  { value: 'port_departure', label: 'Port Departures' },
                  { value: 'emergency', label: 'Emergency Alerts' },
                  { value: 'all', label: 'All Updates' }
                ].map(type => (
                  <label key={type.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="notification_types"
                      value={type.value}
                      checked={formData.notification_types.includes(type.value)}
                      onChange={handleFormChange}
                    />
                    <span className="checkmark"></span>
                    {type.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Notification preferences */}
            <div className="form-group">
              <label>Notification Preferences</label>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="email_notifications"
                    checked={formData.email_notifications}
                    onChange={handleFormChange}
                  />
                  <span className="checkmark"></span>
                  Email Notifications
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="push_notifications"
                    checked={formData.push_notifications}
                    onChange={handleFormChange}
                  />
                  <span className="checkmark"></span>
                  Push Notifications
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="sms_notifications"
                    checked={formData.sms_notifications}
                    onChange={handleFormChange}
                  />
                  <span className="checkmark"></span>
                  SMS Notifications
                </label>
              </div>
            </div>

            {/* Update frequency */}
            <div className="form-group">
              <label>Update Frequency (minutes)</label>
              <select
                name="update_frequency"
                className="form-control"
                value={formData.update_frequency}
                onChange={handleFormChange}
              >
                <option value={1}>1 minute (High frequency)</option>
                <option value={5}>5 minutes (Recommended)</option>
                <option value={15}>15 minutes (Standard)</option>
                <option value={30}>30 minutes (Low frequency)</option>
                <option value={60}>1 hour (Minimal)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Subscription
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subscriptions List */}
      <div className="card">
        <h3>Your Real-Time Subscriptions ({subscriptions.length})</h3>
        
        {subscriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>No real-time subscriptions yet.</p>
            <p>Create your first subscription to start receiving live vessel data updates!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {subscriptions.map(subscription => (
              <div
                key={subscription.id}
                style={{
                  padding: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: subscription.is_active ? '#f8f9fa' : '#f5f5f5'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {getSubscriptionTypeDisplay(subscription.subscription_type)}
                      <span className={`status-badge ${subscription.is_active ? 'active' : 'inactive'}`}>
                        {subscription.is_active ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                      <div>
                        <strong>Notification Types:</strong><br />
                        <span style={{ fontSize: '0.9em', color: '#666' }}>
                          {getNotificationTypesDisplay(subscription.notification_types)}
                        </span>
                      </div>
                      
                      <div>
                        <strong>Update Frequency:</strong><br />
                        <span style={{ fontSize: '0.9em', color: '#666' }}>
                          Every {subscription.update_frequency} minutes
                        </span>
                      </div>
                      
                      <div>
                        <strong>Notification Methods:</strong><br />
                        <span style={{ fontSize: '0.9em', color: '#666' }}>
                          {[
                            subscription.email_notifications && 'Email',
                            subscription.push_notifications && 'Push',
                            subscription.sms_notifications && 'SMS'
                          ].filter(Boolean).join(', ') || 'None'}
                        </span>
                      </div>
                    </div>

                    {/* Additional info based on type */}
                    {subscription.subscription_type === 'region' && (
                      <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
                        <strong>Coverage Area:</strong> 
                        Lat: {subscription.min_latitude}° to {subscription.max_latitude}°, 
                        Lon: {subscription.min_longitude}° to {subscription.max_longitude}°
                      </div>
                    )}
                    
                    {subscription.subscription_type === 'vessel_specific' && (
                      <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
                        <strong>Vessels:</strong> {subscription.vessels?.length || 0} selected vessels
                      </div>
                    )}
                    
                    <div style={{ fontSize: '0.8em', color: '#999' }}>
                      Created: {new Date(subscription.created_at).toLocaleString()}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    <button
                      className={`btn ${subscription.is_active ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleToggleSubscription(subscription.id)}
                      style={{ minWidth: '100px' }}
                    >
                      {subscription.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteSubscription(subscription.id)}
                      style={{ minWidth: '100px' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="card">
        <h3>ℹ️ About Real-Time Subscriptions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h4>🌍 Global Coverage</h4>
            <p>Receive updates for all vessels worldwide. Best for comprehensive maritime monitoring.</p>
          </div>
          <div>
            <h4>📍 Regional Coverage</h4>
            <p>Monitor vessels within specific geographic boundaries. Ideal for port authorities and regional operators.</p>
          </div>
          <div>
            <h4>🚢 Specific Vessels</h4>
            <p>Track selected vessels only. Perfect for fleet operators and cargo owners.</p>
          </div>
        </div>
        
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
          <strong>💡 Pro Tip:</strong> Start with a regional subscription to test the system, then upgrade to global coverage as needed. 
          You can have multiple active subscriptions with different notification preferences.
        </div>
      </div>
    </div>
  );
};

export default RealTimeSubscriptions;