import { useState, useEffect } from "react";
import { Route, Plus, Eye, Edit, Trash2, Search, Filter, AlertTriangle, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { getVoyages, deleteVoyage, createVoyage } from '../api/voyages';
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from '../hooks/useWebSocket';
import toast from 'react-hot-toast';
import "../styles/Notifications.css";

const Voyages = () => {
  const { user, token } = useAuth();
  const webSocket = useWebSocket('ws://localhost:8000/ws/vessels/alerts/');
  const [items, setItems] = useState([]); // ✅ Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || !webSocket?.subscribeToAlerts) return;

    const unsubscribeAlerts = webSocket.subscribeToAlerts((alert) => {
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
  }, [token, webSocket]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getVoyages();
        
        // ✅ Debug: Check what API returns
        console.log('API returned:', data);
        console.log('Is Array?', Array.isArray(data));
        
        // ✅ Handle different response structures
        if (Array.isArray(data)) {
          setItems(data);
        } else if (data && Array.isArray(data.results)) {
          setItems(data.results);
        } else if (data && Array.isArray(data.voyages)) {
          setItems(data.voyages);
        } else if (data && typeof data === 'object') {
          console.warn('Unexpected data structure:', data);
          setItems([]);
        } else {
          setItems([]);
        }
      } catch (err) {
        setError('Failed to fetch voyages');
        console.error("Failed to fetch voyages", err);
        setItems([]); // ✅ Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = () => {
    console.log("Add voyage");
  };

  const handleView = (id) => {
    console.log("View voyage", id);
  };

  const handleEdit = (id) => {
    console.log("Edit voyage", id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this voyage?")) {
      try {
        await deleteVoyage(id);
        setItems(prevItems => Array.isArray(prevItems) ? prevItems.filter((item) => item.id !== id) : []);
      } catch (err) {
        setError('Failed to delete voyage');
        console.error("Failed to delete voyage", err);
      }
    }
  };

  const canAdd = user?.role === "Admin";
  const canEdit = user?.role === "Admin" || user?.role === "Analyst";
  const canDelete = user?.role === "Admin";

  // ✅ Safety check: ensure items is always an array
  const filteredItems = (items || []).filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Route style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: 0
            }}>
              Voyages Management
            </h1>
          </div>
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
              Add Voyage
            </button>
          )}
        </div>
        <p style={{ 
          color: '#64748b', 
          fontSize: '14px',
          margin: 0 
        }}>
          Manage and track maritime voyages and routes
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
              placeholder="Search voyages..."
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
        Showing {filteredItems.length} of {items.length} voyages
      </div>

      {/* Voyages Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: 'center', color: '#64748b' }}>
            Loading voyages...
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
                  Status
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
                    '&:hover': { backgroundColor: '#f8fafc' }
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
                      fontWeight: '500'
                    }}>
                      {item.name}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      color: '#64748b',
                      fontSize: '14px'
                    }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        Active
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
                  <td colSpan={5} style={{ 
                    textAlign: "center", 
                    padding: "40px", 
                    color: "#64748b",
                    fontSize: '14px'
                  }}>
                    {searchTerm ? 'No voyages found matching your search' : 'No voyages available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Voyages;