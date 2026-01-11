// src/pages/liveTracking/hooks/useVesselData.js
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useVesselData = (API_URL) => {
  const [vessels, setVessels] = useState([]);
  const [ports, setPorts] = useState([]);
  const [voyages, setVoyages] = useState([]);
  const [countries, setCountries] = useState([]);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [piracyZones, setPiracyZones] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('You must be logged in', {
        position: 'top-center',
        duration: 3000,
      });
      return null;
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const loadVessels = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/vessels/`, { headers });
      if (!response.ok) throw new Error('Failed to load vessels');
      
      const data = await response.json();
      const vesselList = Array.isArray(data) ? data : (data.results || []);
      const vesselWithPositions = vesselList.filter(v => v.last_position_lat && v.last_position_lon);
      
      setVessels(vesselWithPositions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading vessels:', error);
      toast.error('Failed to load vessels', {
        position: 'top-center',
        duration: 3000,
      });
      setLoading(false);
    }
  };

  const loadPorts = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${API_URL}/ports/`, { headers });
      if (!response.ok) throw new Error('Failed to load ports');
      
      const data = await response.json();
      const portsList = Array.isArray(data) ? data : (data.results || []);
      setPorts(portsList);
    } catch (error) {
      console.error('Error loading ports:', error);
    }
  };

  const loadVoyages = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${API_URL}/voyages/`, { headers });
      if (!response.ok) throw new Error('Failed to load voyages');
      
      const data = await response.json();
      const voyagesList = Array.isArray(data) ? data : (data.results || []);
      setVoyages(voyagesList);
    } catch (error) {
      console.error('Error loading voyages:', error);
    }
  };

  const loadCountries = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${API_URL}/countries/`, { headers });
      if (!response.ok) throw new Error('Failed to load countries');
      
      const data = await response.json();
      const countriesList = Array.isArray(data) ? data : (data.results || []);
      setCountries(countriesList);
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadSafetyData = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      const [weatherRes, piracyRes] = await Promise.all([
        fetch(`${API_URL}/weather-alerts/`, { headers }),
        fetch(`${API_URL}/piracy-zones/`, { headers })
      ]);
      
      if (weatherRes.ok) {
        const data = await weatherRes.json();
        setWeatherAlerts(data.results || data);
      }
      
      if (piracyRes.ok) {
        const data = await piracyRes.json();
        setPiracyZones(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching safety data:', error);
    }
  };

  const loadVesselTrack = async (vesselId) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return null;

      const response = await fetch(
        `${API_URL}/vessels/${vesselId}/positions/?hours=24`,
        { headers }
      );
      
      if (!response.ok) throw new Error('Failed to load track');
      
      const data = await response.json();
      const positions = data.positions || data.results || data;
      const sortedPositions = Array.isArray(positions)
        ? positions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        : [];
      
      return sortedPositions;
    } catch (error) {
      console.error('Error loading vessel track:', error);
      toast.error('Failed to load position history', {
        position: 'top-center',
        duration: 3000,
      });
      return [];
    }
  };

  // Initial load
  useEffect(() => {
    loadVessels();
    loadPorts();
    loadVoyages();
    loadCountries();
    loadSafetyData();
  }, [API_URL]);

  return {
    vessels,
    setVessels,
    ports,
    setPorts,
    voyages,
    setVoyages,
    countries,
    setCountries,
    weatherAlerts,
    setWeatherAlerts,
    piracyZones,
    setPiracyZones,
    loading,
    setLoading,
    loadVessels,
    loadVesselTrack,
    loadSafetyData
  };
};