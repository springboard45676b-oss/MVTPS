import { FaShip, FaMapMarkerAlt, FaChartBar, FaHome } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Maritime</h2>

      <Link to="/operator"><FaHome/> Dashboard</Link>
      <Link to="#"><FaShip/> Vessels</Link>
      <Link to="#"><FaMapMarkerAlt/> Ports</Link>
      <Link to="#"><FaChartBar/> Analytics</Link>
    </div>
  );
}
