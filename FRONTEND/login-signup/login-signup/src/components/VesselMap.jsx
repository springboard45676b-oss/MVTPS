

// import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

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

const greenPortIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const yellowPortIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const redPortIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});


// function VesselMap() {
function VesselMap({ selectedPort }) {




  const [vessels, setVessels] = useState([]);
  const [ports, setPorts] = useState([]);

  const [filters, setFilters] = useState({
    type: 'ALL',
    cargo: 'ALL',
    flag: 'ALL',
  });
  // Fetch vessels on
  const getPortIcon = (score) => {
    const normalizedScore = score * 10; // 0–10 → 0–100

    if (normalizedScore > 60) return redPortIcon;
    if (normalizedScore > 30) return yellowPortIcon;
    return greenPortIcon;
  };


  const fetchPorts = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/ports/');
      if (!res.ok) throw new Error('Port API failed');

      const data = await res.json();

      const validPorts = data.filter(
        p =>
          typeof p.location_lat === 'number' &&
          typeof p.location_lon === 'number'
      );

      setPorts(validPorts);
    } catch (err) {
      console.error('Port fetch error:', err);
      setPorts([]);
    }
  };







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
    // fetchVessels();
    // fetchPorts();

    const loadData = async () => {
      await fetchVessels();  // existing logic
      await fetchPorts();    // ✅ NEW
    };

    // Initial load
    loadData();
    // Poll every 10 seconds
    intervalId = setInterval(loadData, 10000);

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
// porttab-> map live :
function FlyToPort({ selectedPort }) {
  const map = useMap();

  useEffect(() => {
    if (selectedPort?.lat && selectedPort?.lon) {
      map.flyTo([selectedPort.lat, selectedPort.lon], 8, {
        duration: 1.5,
      });
    }
  }, [selectedPort, map]);

  return null;
}
// =====================

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
        <FlyToPort selectedPort={selectedPort} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {/* PORT MARKERS */}
        {ports.map(port => (
          <Marker
            key={`port-${port.id}`}
            position={[port.location_lat, port.location_lon]}
            icon={getPortIcon(port.congestion_score)}
          >
            <Popup>
              <strong>{port.name}</strong><br />
              Country: {port.country}<br />
              Congestion Score: {port.congestion_score}<br />
              Status: {port.status || 'Normal'}
            </Popup>
          </Marker>
        ))}



        {filteredVessels.map(vessel => (

          <Marker
            // key={vessel.imo_number}
            key={`${vessel.imo_number}`}
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
