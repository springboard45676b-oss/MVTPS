import { NavLink } from 'react-router-dom';

// Inside your Sidebar component
const Sidebar = () => {
  // Define a reusable style for active links
  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? '#3b82f6' : '#64748b',
    fontWeight: isActive ? 'bold' : 'normal',
    borderBottom: isActive ? '2px solid #3b82f6' : 'none',
    textDecoration: 'none',
    padding: '5px 0',
    cursor: 'pointer'
  });

  return (
    <ul style={styles.nav}>
      <li>
        <NavLink to="/dashboard" style={navLinkStyle}>Dashboard</NavLink>
      </li>
      <li>
        <NavLink to="/vessels" style={navLinkStyle}>Vessels</NavLink>
      </li>
      <li>
        <NavLink to="/tracking" style={navLinkStyle}>Live Tracking</NavLink>
      </li>
      {/* Voyage Schedules now highlights when active */}
      <li>
        <NavLink to="/voyages" style={navLinkStyle}>Voyage Schedules</NavLink>
      </li>
    </ul>
  );
};