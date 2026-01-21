import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const [events, setEvents] = useState([]); // To store the user's events
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Get auth state to check if we are ready
  const { isAuthenticated } = useAuth();

  // --- 1. Fetch User's Events ---
  useEffect(() => {
    // Only fetch if the user is authenticated
    if (isAuthenticated) {
      const fetchEvents = async () => {
        try {
          setLoading(true);
          const response = await api.get('/events');
          setEvents(response.data);
          setError('');
        } catch (err) {
          setError('Failed to fetch events.');
        } finally {
          setLoading(false);
        }
      };
      fetchEvents();
    }
  }, [isAuthenticated]); // Re-run when auth status changes

  // --- 2. Handle Create New Event ---
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!startTime || !endTime) {
        setError("Please select both a start and end time.");
        return;
    }
    try {
      const response = await api.post('/events', { title, startTime, endTime });
      // Add the new event to our list in the UI
      setEvents([...events, response.data]);
      // Clear the form
      setTitle('');
      setStartTime('');
      setEndTime('');
      setError('');
    } catch (err) {
      setError('Failed to create event.');
    }
  };

  // --- 3. Handle "Make Swappable" Button ---
  const handleMakeSwappable = async (eventId) => {
    try {
      await api.put(`/events/${eventId}`, { status: 'SWAPPABLE' });
      
      // Update the event's status in our local state
      setEvents(events.map(event => 
        event.id === eventId ? { ...event, status: 'SWAPPABLE' } : event
      ));
    } catch (err) {
      setError('Failed to update event status.');
    }
  };

  if (loading) {
    return <div>Loading your events...</div>;
  }

  return (
    <div>
      <h2>My Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* --- Create Event Form --- */}
      <h3>Create New Event</h3>
      <form onSubmit={handleCreateEvent}>
        <input 
          type="text" 
          placeholder="Event Title" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
          style={{ marginRight: '10px' }}
        />
        <input 
          type="datetime-local" 
          title="Start Time"
          value={startTime} 
          onChange={e => setStartTime(e.target.value)} 
          required 
          style={{ marginRight: '10px' }}
        />
        <input 
          type="datetime-local" 
          title="End Time"
          value={endTime} 
          onChange={e => setEndTime(e.target.value)} 
          required 
          style={{ marginRight: '10px' }}
        />
        <button type="submit">Create Event</button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      {/* --- My Events List --- */}
      <h3>My Events</h3>
      {events.length === 0 ? (
        <p>You have no events. Create one above!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {events.map(event => (
            <li key={event.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
              <strong>{event.title}</strong>
              <p>Start: {new Date(event.startTime).toLocaleString()}</p>
              <p>End: {new Date(event.endTime).toLocaleString()}</p>
              <p>Status: <strong>{event.status}</strong></p>
              
              {event.status === 'BUSY' && (
                <button onClick={() => handleMakeSwappable(event.id)}>
                  Make Swappable
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;