import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./Layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout-container">

      <Sidebar />

      <div className="layout-main">
        <Navbar />
        <div className="layout-content">
          {children}
        </div>
      </div>

    </div>
  );
}
