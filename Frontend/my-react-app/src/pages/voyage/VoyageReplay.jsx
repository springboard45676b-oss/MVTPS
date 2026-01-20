import { Polyline } from "react-leaflet";
import { useVoyage } from "../../context/VoyageContext";

function VoyageReplay({ vesselId }) {
  const { voyages } = useVoyage();

  if (!voyages[vesselId]) return null;

  const path = voyages[vesselId].map(p => [p.lat, p.lng]);

  return (
    <Polyline
      positions={path}
      pathOptions={{ color: "cyan", weight: 4 }}
    />
  );
}

export default VoyageReplay;
