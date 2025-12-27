import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import LiveTrackingSidebar from "../../components/LiveTrackingSidebar";
import VesselInfoPanel from "../../components/VesselInfoPanel";
import "leaflet/dist/leaflet.css";

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

function LiveTracking() {
  const [vessels, setVessels] = useState(initialVessels);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

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

  /* ================= Simulated Real-Time Update ================= */
  const updatePositions = () => {
    setVessels((prev) =>
      prev.map((v) => ({
        ...v,
        position: [
          v.position[0] + (Math.random() - 0.5) * 0.3,
          v.position[1] + (Math.random() - 0.5) * 0.3,
        ],
      }))
    );
  };

  /* ================= Filter Logic ================= */
  const filteredVessels = vessels.filter(
    (v) =>
      categories[v.category] &&
      flags[v.flag] &&
      v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-screen h-screen flex flex-col">

      {/* ================= Top Bar ================= */}
      <div className="bg-white border-b px-6 py-3 font-medium">
        Live Tracking
      </div>

      {/* ================= Main Content ================= */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <LiveTrackingSidebar
          search={search}
          setSearch={setSearch}
          categories={categories}
          setCategories={setCategories}
          flags={flags}
          setFlags={setFlags}
          onUpdate={updatePositions}
        />

        {/* ================= Map Section ================= */}
        <div className="flex-1">
          <MapContainer
            center={[20.5937, 78.9629]} // India center
            zoom={4}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredVessels.map((v) => (
              <Marker
                key={v.id}
                position={v.position}
                eventHandlers={{
                  click: () => setSelected(v), // ✅ IMPORTANT
                }}
              >
                <Popup>
                  <strong>{v.name}</strong>
                  <br />
                  Category: {v.category}
                  <br />
                  Flag: {v.flag}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* ================= Bottom Info Panel ================= */}
      {selected && <VesselInfoPanel vessel={selected} />}

    </div>
  );
}

export default LiveTracking;
