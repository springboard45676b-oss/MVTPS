import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Events = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("events/");
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = () => {
    console.log("Add event");
  };

  const handleView = (id) => {
    console.log("View event", id);
  };

  const handleEdit = (id) => {
    console.log("Edit event", id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await api.delete(`events/${id}/`);
        setItems(items.filter((item) => item.id !== id));
      } catch (err) {
        console.error("Failed to delete event", err);
      }
    }
  };

  const canAdd = user?.role === "Admin";
  const canEdit = user?.role === "Admin" || user?.role === "Analyst";
  const canDelete = user?.role === "Admin";

  return (
    <main className="content">
      <div className="page-header">
        <Navbar title="Events" />
        {canAdd && (
          <button className="btn btn-add" onClick={handleAdd}>
            + Add Event
          </button>
        )}
      </div>
      <div className="table-container">
        {loading ? (
          <div className="skeleton" style={{ padding: "20px" }}>Loading events...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Event Type</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.description || "-"}</td>
                    <td>{item.event_type || "-"}</td>
                    <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-action btn-view" onClick={() => handleView(item.id)}>
                          View
                        </button>
                        {canEdit && (
                          <button className="btn-action btn-edit" onClick={() => handleEdit(item.id)}>
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button className="btn-action btn-delete" onClick={() => handleDelete(item.id)}>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
};

export default Events;