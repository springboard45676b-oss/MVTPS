import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import LiveTrackingSidebar from "../../components/LiveTrackingSidebar";
import VesselInfoPanel from "../../components/VesselInfoPanel";
import ports from "../../data/ports";
import safetyZones from "../../data/safetyZones";
import noaaSafety from "../../data/noaaSafety";
import accidents from "../../data/accidents";
import "leaflet/dist/leaflet.css";
import { useAlerts } from "../../context/AlertContext";


/* ================= Initial Vessel Data ================= */
const initialVessels = [
  {
    id: 1,
    name: "Maersk Seatrade",
    category: "Cargo",
    flag: "Denmark",
    position: [31.0461, 34.8516],
  },
  {
    id: 2,
    name: "INS Mumbai Trader",
    category: "Container",
    flag: "India",
    position: [18.9647, 72.8258],
  },
  {
    id: 3,
    name: "Pacific Queen",
    category: "Tanker",
    flag: "Panama",
    position: [22.5726, 88.3639],
  },
];

/* ================= Helpers ================= */
const getCongestionColor = (level) => {
  if (level === "High") return "red";
  if (level === "Medium") return "yellow";
  return "green";
};

const getSafetyColor = (type) => {
  if (type === "Storm") return "blue";
  if (type === "Piracy") return "red";
  return "gray";
};

const getNoaaColor = (severity) => {
  if (severity === "High") return "purple";
  if (severity === "Medium") return "orange";
  return "blue";
};

const getDistance = ([lat1, lon1], [lat2, lon2]) => {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* ================= AVG WAIT TIME ================= */
const calculateAvgWaitTime = () => {
  const entryTime = Math.random() * 10 + 6;
  const berthingTime = Math.random() * 5 + 1;
  return Math.abs(entryTime - berthingTime).toFixed(1);
};

function LiveTracking() {
  const navigate = useNavigate();
  const [vessels] = useState(initialVessels);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const alertRef = useRef(null);

  const [categories, setCategories] = useState({
    Cargo: true,
    Tanker: true,
    Container: true,
    LNG: false,
    Fishing: false,
  });

  const [flags, setFlags] = useState({
    Denmark: true,
    India: true,
    Panama: true,
    Bahamas: false,
  });

  /* ================= ALERT LOGIC (CONTEXT BASED) ================= */


const { addAlert } = useAlerts();

useEffect(() => {
  vessels.forEach((vessel) => {

    /* ===== SAFETY ZONES ===== */
    safetyZones.forEach((zone) => {
      const distance = getDistance(vessel.position, zone.center);

      if (distance <= zone.radius) {
        addAlert({
          message: `${vessel.name} entered ${zone.type} Zone`,
          type: "Safety",
        });
      }
    });

    /* ===== HIGH CONGESTION PORTS ===== */
    ports
      .filter((port) => port.congestion === "High")
      .forEach((port) => {
        const distance = getDistance(vessel.position, port.location);

        if (distance <= 40000) {
          addAlert({
            message: `${vessel.name} near high congestion at ${port.name}`,
            type: "Port Congestion",
          });
        }
      });

    /* ===== NOAA WEATHER ALERTS ===== */
    noaaSafety.forEach((zone) => {
      const distance = getDistance(vessel.position, zone.center);

      if (distance <= zone.radius) {
        addAlert({
          message: `${vessel.name} affected by ${zone.severity} ${zone.type}`,
          type: "Weather",
        });
      }
    });
  });
}, [vessels, addAlert]);


  const filteredVessels = vessels.filter(
    (v) =>
      categories[v.category] &&
      flags[v.flag] &&
      v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-screen h-screen flex flex-col">

      {/* ================= TOP BAR ================= */}
      <div className="bg-white border-b px-6 py-3 font-medium flex justify-between items-center">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/operator")}
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            ← Back to Dashboard
          </button>
          <span className="font-semibold">Live Tracking</span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/alerts")}
            className="text-sm text-blue-600 hover:underline"
          >
            Alert History
          </button>

          {alerts.length > 0 && (
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="bg-red-50 text-red-600 px-4 py-1 rounded-lg text-sm font-semibold"
            >
              {alerts.length} Alerts
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        <LiveTrackingSidebar
          search={search}
          setSearch={setSearch}
          categories={categories}
          setCategories={setCategories}
          flags={flags}
          setFlags={setFlags}
        />

        <div className="flex-1 relative">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={4}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* PORTS */}
            {ports.map((port) => (
              <Circle
                key={port.id}
                center={port.location}
                radius={40000}
                pathOptions={{
                  color: getCongestionColor(port.congestion),
                  fillColor: getCongestionColor(port.congestion),
                  fillOpacity: 0.35,
                }}
              >
                <Popup>
                  <strong>{port.name}</strong>
                  <br />
                  Congestion: {port.congestion}
                  <br />
                  Avg Wait: {calculateAvgWaitTime()} hrs
                </Popup>
              </Circle>
            ))}

            {/* SAFETY ZONES */}
            {safetyZones.map((zone) => (
              <Circle
                key={zone.id}
                center={zone.center}
                radius={zone.radius}
                pathOptions={{
                  color: getSafetyColor(zone.type),
                  fillColor: getSafetyColor(zone.type),
                  fillOpacity: 0.25,
                  dashArray: "6",
                }}
              >
                <Popup>
                  <strong>{zone.type}</strong>
                  <br />
                  {zone.description}
                </Popup>
              </Circle>
            ))}

            {/* NOAA */}
            {noaaSafety.map((zone) => (
              <Circle
                key={zone.id}
                center={zone.center}
                radius={zone.radius}
                pathOptions={{
                  color: getNoaaColor(zone.severity),
                  fillColor: getNoaaColor(zone.severity),
                  fillOpacity: 0.25,
                }}
              >
                <Popup>
                  <strong>{zone.type}</strong>
                  <br />
                  Severity: <b>{zone.severity}</b>
                  <br />
                  Source: NOAA
                </Popup>
              </Circle>
            ))}

            {/* ACCIDENTS */}
            {accidents.map((a) => (
              <Marker key={a.id} position={a.location}>
                <Popup>
                  <strong>{a.vessel}</strong>
                  <br />
                  Accident: {a.type}
                  <br />
                  Date: {a.date}
                </Popup>
              </Marker>
            ))}

            {/* VESSELS */}
            {filteredVessels.map((v) => (
              <Marker
                key={v.id}
                position={v.position}
                eventHandlers={{ click: () => setSelected(v) }}
              >
                <Popup>
                  <strong>{v.name}</strong>
                  <br />
                  {v.category} | {v.flag}
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* ALERT PANEL */}
          {showAlerts && alerts.length > 0 && (
            <div
              ref={alertRef}
              className="absolute top-16 right-4 bg-white shadow-xl rounded-xl p-4 w-80 z-[1000]"
            >
              <h4 className="font-semibold text-red-600 mb-2">
                Active Alerts
              </h4>
              <ul className="space-y-2 text-sm">
                {alerts.map((a, i) => (
                  <li
                    key={i}
                    onClick={() => navigate("/alerts")}
                    className="cursor-pointer hover:text-red-600"
                  >
                    • {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed bottom-0 left-0 w-full z-[1000]">
          <VesselInfoPanel vessel={selected} />
        </div>
      )}
    </div>
  );
}

export default LiveTracking;
