// Profile Component with Admin-Only Edit/Modify/Delete Access
import React, { useState, useEffect } from 'react';
const Profile = () => {
  // Get current user from localStorage or your auth system
  const [currentUser, setCurrentUser] = useState({
    username: 'ankitha',
    email: 'ankithakanneboina',
    role: 'Admin', // This would come from your authentication
    phoneNumber: '+91 9876543210'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...currentUser });
  const [message, setMessage] = useState('');

  // Check if current user is admin
  const isAdmin = currentUser.role === 'Admin';

  const handleEdit = () => {
    if (!isAdmin) {
      setMessage('Only administrators can edit profile information.');
      return;
    }
    setIsEditing(true);
    setMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...currentUser });
    setMessage('');
  };

  const handleSave = () => {
    if (!isAdmin) {
      setMessage('Only administrators can save changes.');
      return;
    }
    
    // Here you would make an API call to update the profile
    setCurrentUser({ ...formData });
    setIsEditing(false);
    setMessage('Profile updated successfully!');
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = () => {
    if (!isAdmin) {
      setMessage('Only administrators can delete accounts.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      // Here you would make an API call to delete the account
      setMessage('Account deleted successfully!');
      // Redirect to login or home page
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Profile</h1>
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
          backgroundColor: message.includes('successfully') ? '#d4edda' : '#f8d7da',
          color: message.includes('successfully') ? '#155724' : '#721c24',
          borderColor: message.includes('successfully') ? '#c3e6cb' : '#f5c6cb'
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
            <div style={styles.value}>{currentUser.username}</div>
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
            <div style={styles.value}>{currentUser.email}</div>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Role</label>
          <div style={styles.roleBadge}>
            {currentUser.role}
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
            <div style={styles.value}>{currentUser.phoneNumber}</div>
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
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                style={{...styles.button, ...styles.cancelButton}}
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
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#0a1929',
    minHeight: '100vh',
    color: '#fff'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#fff'
  },
  warningBanner: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '6px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#856404'
  },
  warningIcon: {
    fontSize: '20px'
  },
  message: {
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid',
    fontSize: '14px'
  },
  profileCard: {
    backgroundColor: '#1e293b',
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    marginBottom: '20px'
  },
  formGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#94a3b8'
  },
  value: {
    fontSize: '16px',
    padding: '12px',
    backgroundColor: '#0f172a',
    borderRadius: '6px',
    border: '1px solid #334155',
    color: '#e2e8f0'
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #475569',
    borderRadius: '6px',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
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
    borderRadius: '6px',
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
    backgroundColor: '#374151',
    cursor: 'not-allowed',
    opacity: '0.6'
  },
  infoBox: {
    backgroundColor: '#1e293b',
    borderRadius: '10px',
    padding: '20px',
    border: '1px solid #334155'
  },
  infoTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#fff'
  },
  infoList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  }
};

// Add this to make the list items styled
styles.infoList = {
  ...styles.infoList,
  lineHeight: '2'
};

export default Profile;