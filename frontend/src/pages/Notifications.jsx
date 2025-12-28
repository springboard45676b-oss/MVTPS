import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useState, useEffect } from "react";

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("notifications/");
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="content">
      <Navbar title="Notifications" />
      <section className="list">
        {loading ? (
          <div className="skeleton">Loading notifications...</div>
        ) : (
          items.map((item) => (
            <div className={`list__item ${item.is_read ? "" : "list__item--unread"}`} key={item.id}>
              <div className="list__name">{item.title}</div>
              <div className="list__description">{item.message}</div>
              {!item.is_read && <div className="badge">New</div>}
            </div>
          ))
        )}
        {!loading && items.length === 0 && <div className="empty">No notifications yet.</div>}
      </section>
    </main>
  );
};

export default Notifications;