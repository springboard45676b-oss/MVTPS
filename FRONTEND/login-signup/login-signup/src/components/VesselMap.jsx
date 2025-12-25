

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';

import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet-rotatedmarker';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});
const shipIcon = new L.Icon({
  iconUrl: '/ship1.png',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function VesselMap() {
  const [vessels, setVessels] = useState([]);
  const [filters, setFilters] = useState({
    type: 'ALL',
    cargo: 'ALL',
    flag: 'ALL',
  });

  const fetchVessels = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/vessels/');
      const data = await res.json();
      setVessels(data);
    } catch (error) {
      console.error('Error fetching vessels:', error);
    }
  };

  // useEffect(() => {
  //   fetchVessels(); // initial load

  //   const interval = setInterval(() => {
  //     fetchVessels(); // poll every 10 sec
  //   }, 10000);

  //   return () => clearInterval(interval); // cleanup
  // }, []);
  useEffect(() => {
    let intervalId;

    const fetchVessels = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/vessels/');

        if (!res.ok) {
          throw new Error(`API failed with status ${res.status}`);
        }

        const data = await res.json();

        // Filter only vessels with valid coordinates
        const validVessels = data.filter(
          v =>
            typeof v.last_position_lat === 'number' &&
            typeof v.last_position_lon === 'number'
        );

        setVessels(validVessels);

      } catch (err) {
        console.error('Vessel fetch error:', err);

        // 🔁 Fallback vessel (VERY IMPORTANT)
        setVessels([
          {
            imo_number: 'FALLBACK001',
            name: 'Demo Vessel',
            type: 'Cargo',
            normalized_cargo: 'General Cargo',
            last_position_lat: 20,
            last_position_lon: 72,
          },
        ]);
      }
    };

    // Initial load
    fetchVessels();

    // Poll every 10 seconds
    intervalId = setInterval(fetchVessels, 10000);

    // Cleanup
    return () => clearInterval(intervalId);
  }, []);

  const filteredVessels = vessels.filter(vessel => {
    if (filters.type !== 'ALL' && vessel.type !== filters.type) {
      return false;
    }

    if (filters.cargo !== 'ALL' && vessel.normalized_cargo !== filters.cargo) {
      return false;
    }

    if (filters.flag !== 'ALL' && vessel.flag !== filters.flag) {
      return false;
    }

    return true;
  });


  return (
    <div>
      {/* FILTER PANEL */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Vessel Type */}
          <select
            className="border p-2 rounded"
            value={filters.type}
            onChange={e => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="ALL">All Types</option>
            <option value="Tanker">Tanker</option>
            <option value="Cargo">Cargo</option>
            <option value="Container">Container</option>
          </select>

          {/* Cargo */}
          <select
            className="border p-2 rounded"
            value={filters.cargo}
            onChange={e => setFilters({ ...filters, cargo: e.target.value })}
          >
            <option value="ALL">All Cargo</option>
            <option value="Containerized Cargo">Containerized Cargo</option>
            <option value="General Cargo">General Cargo</option>
            <option value="Liquid Bulk">Liquid Bulk</option>
            <option value="Chemical Tanker">Chemical Tanker</option>
          </select>

          {/* Flag */}
          <select
            className="border p-2 rounded"
            value={filters.flag}
            onChange={e => setFilters({ ...filters, flag: e.target.value })}
          >
            <option value="ALL">All Flags</option>
            <option value="Denmark">Denmark</option>
            <option value="India">India</option>
            <option value="Singapore">Singapore</option>
          </select>

        </div>
      </div>

      <MapContainer center={[20, 72]} zoom={5} style={{ height: '70vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />


        {filteredVessels.map(vessel => (

          <Marker
            // key={vessel.imo_number}
            key= {`${vessel.imo_number}-${vessel.last_course}`}
            position={[vessel.last_position_lat, vessel.last_position_lon]}
            icon={shipIcon}
            rotationAngle={Number(vessel.last_course) || 0}
            
            rotationOrigin="center"
          >
            <Popup>
              <strong>{vessel.name}</strong><br />
              IMO: {vessel.imo_number}<br />
              Type: {vessel.type}<br />
              Cargo: {vessel.normalized_cargo || vessel.cargo_type || 'N/A'}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>


  );
}

export default VesselMap;
