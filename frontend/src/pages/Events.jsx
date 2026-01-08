import { useState, useEffect } from "react";
import { Calendar, Plus, Eye, Edit, Trash2, Search, Filter, AlertTriangle, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { getEvents, deleteEvent, createEvent } from '../api/events';
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from '../hooks/useWebSocket';
import toast from 'react-hot-toast';
import "../styles/Notifications.css";

const Events = () => {
  const { user, token } = useAuth();
  const { subscribeToAlerts } = useWebSocket('ws://localhost:8000/ws/vessels/alerts/');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    event_type: 'status'
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!token) return;

    const unsubscribeAlerts = subscribeToAlerts((alert) => {
      // Show toast notification for vessel alerts
      if (alert.vessel_id && alert.alert_type) {
        const alertMessage = `Vessel Alert: ${alert.vessel_name} - ${alert.alert_type.toUpperCase()}`;
        
        toast.success(alertMessage, {
          duration: 5000,
          position: 'top-right',
        });
        
        console.log('Vessel Alert received:', alert);
      }
    });

    return () => {
      unsubscribeAlerts();
    };
  }, [token]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getEvents();
        setItems(data);
      } catch (err) {
        setError('Failed to fetch events');
        console.error("Failed to fetch events", err);
      } finally {
        setLoading(false);
      }
    };
    
    load();
    
    if (token) {
      const unsubscribe = subscribeToAlerts((alert) => {
        // Show toast notification for vessel-related events
        if (alert.alert_type === 'speed') {
          toast.error(`⚠️ Speed Alert: ${alert.vessel_name}`, {
            duration: 5000,
            position: 'top-right'
          });
        } else if (alert.alert_type === 'port') {
          toast.success(`🚢 Port Activity: ${alert.vessel_name}`, {
            duration: 4000,
            position: 'top-right'
          });
        } else if (alert.alert_type === 'status') {
          toast(`📊 Status Update: ${alert.vessel_name}`, {
            duration: 3000,
            position: 'top-right'
          });
        }
        
        // Refresh events list if it's a vessel-related event
        setItems(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          if (!existingIds.has(alert.vessel_id) && alert.alert_type !== 'status') {
            return [{
              id: alert.id,
              name: alert.vessel_name,
              description: alert.message,
              event_type: alert.alert_type,
              created_at: alert.created_at,
              is_new: true
            }, ...prev];
          }
          return prev;
        });
      });
    }
    
    return unsubscribe;
  }, [token, subscribeToAlerts]);

  const handleAdd = () => {
    setShowAddModal(true);
    setNewEvent({
      name: '',
      description: '',
      event_type: 'status'
    });
  };

  const handleCreateEvent = async () => {
    if (!newEvent.name.trim()) {
      setError('Event name is required');
      return;
    }

    setIsCreating(true);
    try {
      const event = await createEvent(newEvent);
      setItems(prev => [event, ...prev]);
      setShowAddModal(false);
      setNewEvent({
        name: '',
        description: '',
        event_type: 'status'
      });
      toast.success('Event created successfully!');
    } catch (err) {
      setError('Failed to create event');
      console.error("Failed to create event", err);
      toast.error('Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
    setNewEvent({
      name: '',
      description: '',
      event_type: 'status'
    });
    setError(null);
  };

  const handleView = (id) => {
    console.log("View event", id);
  };

  const handleEdit = (id) => {
    console.log("Edit event", id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(id);
        setItems(items.filter((item) => item.id !== id));
      } catch (err) {
        setError('Failed to delete event');
        console.error("Failed to delete event", err);
      }
    }
  };

  const canAdd = user?.role === "Admin";
  const canEdit = user?.role === "Admin" || user?.role === "Analyst";
  const canDelete = user?.role === "Admin";

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'speed':
        return <AlertTriangle style={{ width: '16px', height: '16px', color: '#ef4444' }} />;
      case 'port':
        return <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />;
      case 'status':
        return <Info style={{ width: '16px', height: '16px', color: '#3b82f6' }} />;
      default:
        return <Calendar style={{ width: '16px', height: '16px', color: '#64748b' }} />;
    }
  };

  const getEventStyle = (eventType, isNew) => ({
    backgroundColor: isNew ? '#fef3c7' : 'transparent',
    borderLeft: isNew ? `3px solid ${
      eventType === 'speed' ? '#ef4444' :
      eventType === 'port' ? '#10b981' :
      eventType === 'status' ? '#3b82f6' : '#64748b'
    }` : 'none',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{ 
      width: '100%', 
      minHeight: 'calc(100vh - 64px)',
      backgroundColor: '#f8fafc',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              backgroundColor: '#3b82f6', 
              padding: '8px', 
              borderRadius: '8px' 
            }}>
              <Calendar style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: 0
            }}>
              Events Management
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              title="Refresh events"
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              Refresh
            </button>
            {canAdd && (
              <button
                onClick={handleAdd}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Add Event
              </button>
            )}
          </div>
        </div>
        <p style={{ 
          color: '#64748b', 
          fontSize: '14px',
          margin: 0 
        }}>
          Manage and track maritime events and activities
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: showFilters ? '16px' : 0 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              width: '20px',
              height: '20px'
            }} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '40px',
                paddingRight: '16px',
                paddingTop: '8px',
                paddingBottom: '8px',
                backgroundColor: '#f8fafc',
                color: '#1f2937',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: showFilters ? '#3b82f6' : '#f1f5f9',
              color: showFilters ? 'white' : '#475569',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <Filter style={{ width: '16px', height: '16px' }} />
            Filters
          </button>
        </div>
      </div>

      <div style={{ color: '#64748b', marginBottom: '16px', fontSize: '14px' }}>
        Showing {filteredItems.length} of {items.length} events
      </div>

      {/* Events Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: 'center', color: '#64748b' }}>
            Loading events...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  color: '#1f2937',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  ID
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  color: '#1f2937',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  Name
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  color: '#1f2937',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  Description
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  color: '#1f2937',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  Event Type
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  color: '#1f2937',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  Created At
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'center', 
                  color: '#1f2937',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} style={{ 
                    borderBottom: '1px solid #e2e8f0',
                    ...getEventStyle(item.event_type, item.is_new)
                  }}>
                    <td style={{ 
                      padding: '12px', 
                      color: '#64748b',
                      fontSize: '14px'
                    }}>
                      {item.id}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      color: '#1f2937',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {getEventIcon(item.event_type)}
                      {item.name}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      color: '#64748b',
                      fontSize: '14px'
                    }}>
                      {item.description || "-"}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      color: '#64748b',
                      fontSize: '14px',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: item.event_type === 'speed' ? '#fee2e2' :
                                         item.event_type === 'port' ? '#d1fae5' :
                                         item.event_type === 'status' ? '#dbeafe' : '#f3f4f6',
                        color: item.event_type === 'speed' ? '#991b1b' :
                                item.event_type === 'port' ? '#065f46' :
                                item.event_type === 'status' ? '#1e40af' : '#64748b',
                        fontSize: '11px'
                      }}>
                        {item.event_type || "-"}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      color: '#64748b',
                      fontSize: '14px'
                    }}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'center'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        justifyContent: 'center'
                      }}>
                        <button
                          onClick={() => handleView(item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          <Eye style={{ width: '14px', height: '14px' }} />
                          View
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(item.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 12px',
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            <Edit style={{ width: '14px', height: '14px' }} />
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 12px',
                              backgroundColor: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ 
                    textAlign: "center", 
                    padding: "40px", 
                    color: "#64748b",
                    fontSize: '14px'
                  }}>
                    {searchTerm ? 'No events found matching your search' : 'No events available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
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
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Create New Event
              </h2>
              <button
                onClick={handleCancelAdd}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ×
              </button>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Event Name *
              </label>
              <input
                type="text"
                value={newEvent.name}
                onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter event name..."
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Description
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                placeholder="Enter event description..."
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Event Type
              </label>
              <select
                value={newEvent.event_type}
                onChange={(e) => setNewEvent(prev => ({ ...prev, event_type: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: 'white'
                }}
              >
                <option value="status">Status</option>
                <option value="speed">Speed Alert</option>
                <option value="port">Port Activity</option>
                <option value="maintenance">Maintenance</option>
                <option value="weather">Weather</option>
              </select>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleCancelAdd}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={isCreating || !newEvent.name.trim()}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  backgroundColor: isCreating || !newEvent.name.trim() ? '#9ca3af' : '#10b981',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: isCreating || !newEvent.name.trim() ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  opacity: isCreating || !newEvent.name.trim() ? 0.7 : 1
                }}
              >
                {isCreating ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;