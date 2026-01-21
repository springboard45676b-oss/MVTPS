import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

function Requests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { isAuthenticated } = useAuth();

  // --- 1. Fetch Both Request Lists ---
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      // Use Promise.all to fetch both lists at the same time
      const [incomingRes, outgoingRes] = await Promise.all([
        api.get('/swap/requests/incoming'),
        api.get('/swap/requests/outgoing')
      ]);

      setIncoming(incomingRes.data);
      setOutgoing(outgoingRes.data);

    } catch (err) {
      setError('Failed to fetch requests.');
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Run Fetch on Page Load ---
  useEffect(() => {
    if (isAuthenticated) {
      fetchRequests();
    }
  }, [isAuthenticated]);

  // --- 3. Handle Accept/Reject Actions ---
  const handleResponse = async (requestId, accepted) => {
    try {
      setError('');
      setMessage('');

      await api.post(`/swap/swap-response/${requestId}`, { accepted });
      
      setMessage(`Swap ${accepted ? 'accepted' : 'rejected'} successfully.`);
      
      // Remove the request from the incoming list
      setIncoming(incoming.filter(req => req.requestId !== requestId));

    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  };

  if (loading) {
    return <div>Loading requests...</div>;
  }

  return (
    <div>
      <h2>My Swap Requests</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <hr />

      {/* --- Incoming Requests List --- */}
      <h3>Incoming Requests</h3>
      {incoming.length === 0 ? (
        <p>You have no pending incoming requests.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {incoming.map(req => (
            <li key={req.requestId} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <p>
                <strong>{req.requesterName}</strong> wants to swap their slot:
                <br />
                <em>"{req.offeringSlotTitle}"</em>
              </p>
              <p>
                For your slot:
                <br />
                <em>"{req.mySlotTitle}"</em>
              </p>
              <button 
                onClick={() => handleResponse(req.requestId, true)}
                style={{ marginRight: '10px', backgroundColor: 'green', color: 'white' }}
              >
                Accept
              </button>
              <button 
                onClick={() => handleResponse(req.requestId, false)}
                style={{ backgroundColor: 'red', color: 'white' }}
              >
                Reject
              </button>
            </li>
          ))}
        </ul>
      )}

      <hr />

      {/* --- Outgoing Requests List --- */}
      <h3>Outgoing Requests</h3>
      {outgoing.length === 0 ? (
        <p>You have no outgoing requests.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {outgoing.map(req => (
            <li key={req.requestId} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <p>
                You offered your slot:
                <br />
                <em>"{req.mySlotTitle}"</em>
              </p>
              <p>
                For <strong>{req.receiverName}</strong>'s slot:
                <br />
                <em>"{req.desiredSlotTitle}"</em>
              </p>
              <p>Status: <strong>{req.status}</strong></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Requests;