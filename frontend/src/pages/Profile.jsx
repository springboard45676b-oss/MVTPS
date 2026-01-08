import React, { useState } from 'react';

const Profile = () => {
  // Mock user data - in real app this would come from auth context
  const [user, setUser] = useState({
    username: 'ankith_kanneboina',
    email: 'ankithakanneboina@gmail.com',
    role: 'Admin', // Change to 'User' to test non-admin view
    phoneNumber: '+91 9876543210'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if current user is admin
  const isAdmin = user.role === 'Admin';

  const handleEdit = () => {
    if (!isAdmin) {
      setMessage('Only administrators can edit profile information.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setIsEditing(true);
    setMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...user });
    setMessage('');
  };

  const handleSave = async () => {
    if (!isAdmin) {
      setMessage('Only administrators can save changes.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update user data
      setUser({ ...formData });
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      setLoading(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }, 500);
  };

  const handleDelete = () => {
    if (!isAdmin) {
      setMessage('Only administrators can delete accounts.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      setMessage('Account deleted successfully!');
      setTimeout(() => {
        // Reset to default user
        setUser({
          username: 'john_doe',
          email: 'john.doe@example.com',
          role: 'Admin',
          phoneNumber: '+1 (555) 123-4567'
        });
        setFormData({
          username: 'john_doe',
          email: 'john.doe@example.com',
          role: 'Admin',
          phoneNumber: '+1 (555) 123-4567'
        });
        setMessage('');
      }, 2000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleRole = () => {
    // Demo function to toggle between Admin and User for testing
    const newRole = user.role === 'Admin' ? 'User' : 'Admin';
    setUser(prev => ({ ...prev, role: newRole }));
    setFormData(prev => ({ ...prev, role: newRole }));
    setIsEditing(false);
    setMessage(`Role changed to ${newRole} for demo purposes`);
    setTimeout(() => setMessage(''), 3000);
  };

  // Get initials for avatar
  const getInitials = (username) => {
    return username.split('_').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Main Content */}
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Profile Settings</h1>
          {!isAdmin && (
            <div style={styles.warningBanner}>
              <span style={styles.warningIcon}>⚠️</span>
              View-only mode: Only administrators can edit profile information
            </div>
          )}
        </div>

        {message && (
          <div style={{
            ...styles.message,
            backgroundColor: message.includes('successfully') || message.includes('demo') ? '#d4edda' : '#f8d7da',
            color: message.includes('successfully') || message.includes('demo') ? '#155724' : '#721c24',
            borderColor: message.includes('successfully') || message.includes('demo') ? '#c3e6cb' : '#f5c6cb'
          }}>
            {message}
          </div>
        )}

        <div style={styles.profileCard}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            {isEditing ? (
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                style={styles.input}
                disabled={!isAdmin}
              />
            ) : (
              <div style={styles.value}>{user.username}</div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={styles.input}
                disabled={!isAdmin}
              />
            ) : (
              <div style={styles.value}>{user.email}</div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Role</label>
            <div style={styles.roleBadge}>
              {user.role}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                style={styles.input}
                disabled={!isAdmin}
              />
            ) : (
              <div style={styles.value}>{user.phoneNumber}</div>
            )}
          </div>

          <div style={styles.buttonGroup}>
            {!isEditing ? (
              <>
                <button
                  onClick={handleEdit}
                  style={{
                    ...styles.button,
                    ...styles.editButton,
                    ...(isAdmin ? {} : styles.disabledButton)
                  }}
                  disabled={!isAdmin}
                >
                  {isAdmin ? 'Edit Profile' : 'Edit (Admin Only)'}
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    ...styles.button,
                    ...styles.deleteButton,
                    ...(isAdmin ? {} : styles.disabledButton)
                  }}
                  disabled={!isAdmin}
                >
                  {isAdmin ? 'Delete Account' : 'Delete (Admin Only)'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  style={{...styles.button, ...styles.saveButton}}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  style={{...styles.button, ...styles.cancelButton}}
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Admin Access Info */}
        <div style={styles.infoBox}>
          <h3 style={styles.infoTitle}>Access Control Information</h3>
          <ul style={styles.infoList}>
            <li>✓ Admin users can edit all profile fields</li>
            <li>✓ Admin users can delete accounts</li>
            <li>✓ Admin users have full operational control</li>
            <li>✗ Non-admin users can only view profile information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'Arial, sans-serif'
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px',
    color: '#1f2937'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#1f2937'
  },
  warningBanner: {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#92400e',
    fontSize: '14px'
  },
  warningIcon: {
    fontSize: '20px'
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid',
    fontSize: '14px'
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
    border: '1px solid #e2e8f0'
  },
  formGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#374151'
  },
  value: {
    fontSize: '16px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    color: '#1f2937'
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  roleBadge: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '30px',
    flexWrap: 'wrap'
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flex: '1',
    minWidth: '150px'
  },
  editButton: {
    backgroundColor: '#3b82f6',
    color: '#fff'
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    color: '#fff'
  },
  saveButton: {
    backgroundColor: '#10b981',
    color: '#fff'
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    color: '#fff'
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
    cursor: 'not-allowed',
    opacity: '0.6'
  },
  infoBox: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  infoTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#1f2937'
  },
  infoList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    color: '#4b5563',
    lineHeight: '2'
  }
};

export default Profile;