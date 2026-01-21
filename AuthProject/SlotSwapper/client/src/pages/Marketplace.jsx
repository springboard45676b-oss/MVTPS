import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

function Marketplace() {
  const [swappableSlots, setSwappableSlots] = useState([]);
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // For success messages

  const { isAuthenticated } = useAuth();

  // --- 1. Fetch Data on Page Load ---
  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError('');
          setMessage('');

          // Fetch the "marketplace" slots
          const marketplaceResponse = await api.get('/swap/swappable-slots');
          setSwappableSlots(marketplaceResponse.data);

          // Fetch *my* swappable slots (to use as an offer)
          // We need to get all my events and filter them
          const myEventsResponse = await api.get('/events');
          const mySlots = myEventsResponse.data.filter(event => event.status === 'SWAPPABLE');
          setMySwappableSlots(mySlots);

        } catch (err) {
          setError('Failed to fetch swappable slots.');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isAuthenticated]);

  // --- 2. Handle Requesting a Swap ---
  const handleSwapRequest = async (theirSlotId) => {
    setError('');
    setMessage('');

    if (mySwappableSlots.length === 0) {
      setError("You have no 'SWAPPABLE' slots to offer. Go to your Dashboard to make one.");
      return;
    }

    // For speed, we'll use a simple window.prompt to ask which slot to offer.
    // A real app would use a modal here.
    const promptMessage = "Which of your slots do you want to offer? (Enter the ID)\n\n" +
      mySwappableSlots.map(slot => `  ID: ${slot.id} - ${slot.title}`).join('\n');
    
    const mySlotIdToOffer = window.prompt(promptMessage);

    if (!mySlotIdToOffer) {
      return; // User cancelled
    }

    // Check if the entered ID is valid
    const mySlot = mySwappableSlots.find(slot => slot.id.toString() === mySlotIdToOffer);
    if (!mySlot) {
      setError("Invalid ID. Please enter one of your swappable slot IDs.");
      return;
    }

    try {
      // --- 3. Send the API Request ---
      await api.post('/swap/swap-request', {
        mySlotId: mySlot.id,
        theirSlotId: theirSlotId
      });

      setMessage('Swap request sent successfully!');

      // Remove the slot from the marketplace view (it's now 'SWAP_PENDING')
      setSwappableSlots(swappableSlots.filter(slot => slot.id !== theirSlotId));
      
      // Also remove your slot from the "offerable" list
      setMySwappableSlots(mySwappableSlots.filter(slot => slot.id !== mySlot.id));

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send swap request.');
    }
  };

  if (loading) {
    return <div>Loading marketplace...</div>;
  }

  return (
    <div>
      <h2>Marketplace</h2>
      <p>Here are all the slots available for swapping from other users.</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      {swappableSlots.length === 0 ? (
        <p>No swappable slots available right now.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {swappableSlots.map(slot => (
            <li key={slot.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <strong>{slot.title}</strong> (with {slot.ownerName})
              <p>Start: {new Date(slot.startTime).toLocaleString()}</p>
              <p>End: {new Date(slot.endTime).toLocaleString()}</p>
              <button onClick={() => handleSwapRequest(slot.id)}>
                Request Swap
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Marketplace;