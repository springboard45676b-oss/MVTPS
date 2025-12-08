import React, { useState } from "react";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      user_id: 1,
      vessel_id: 1,
      event_id: 1,
      message: "Arrival completed",
      type: "info",
      timestamp: "2025-12-08T11:00:00Z",
    },
  ]);

  const [form, setForm] = useState({
    user_id: "",
    vessel_id: "",
    event_id: "",
    message: "",
    type: "info",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const newNotification = {
      id: notifications.length + 1,
      ...form,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [...prev, newNotification]);
    setForm({
      user_id: "",
      vessel_id: "",
      event_id: "",
      message: "",
      type: "info",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-slate-600">
            Manage notifications (user_id, vessel_id, event_id, message, type, timestamp).
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <form
            onSubmit={handleAdd}
            className="col-span-1 bg-white rounded-2xl shadow p-4 space-y-3 border border-slate-100"
          >
            <h2 className="text-lg font-semibold">Add Notification</h2>
            {[
              { id: "user_id", label: "User ID" },
              { id: "vessel_id", label: "Vessel ID" },
              { id: "event_id", label: "Event ID" },
            ].map((field) => (
              <label key={field.id} className="block text-sm font-medium text-slate-700">
                {field.label}
                <input
                  name={field.id}
                  value={form[field.id]}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </label>
            ))}
            <label className="block text-sm font-medium text-slate-700">
              Message
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Type
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {["info", "warning", "alert", "update"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700 transition"
            >
              Add Notification
            </button>
          </form>

          <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl shadow p-4 border border-slate-100 overflow-auto">
            <h2 className="text-lg font-semibold mb-3">Notification List</h2>
            <table className="w-full text-sm">
              <thead className="text-left text-slate-600 border-b">
                <tr>
                  <th className="py-2 pr-2">User ID</th>
                  <th className="py-2 pr-2">Vessel ID</th>
                  <th className="py-2 pr-2">Event ID</th>
                  <th className="py-2 pr-2">Type</th>
                  <th className="py-2 pr-2">Message</th>
                  <th className="py-2 pr-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {notifications.map((n) => (
                  <tr key={n.id} className="align-top">
                    <td className="py-2 pr-2 font-medium">{n.user_id}</td>
                    <td className="py-2 pr-2">{n.vessel_id}</td>
                    <td className="py-2 pr-2">{n.event_id}</td>
                    <td className="py-2 pr-2 capitalize">{n.type}</td>
                    <td className="py-2 pr-2 whitespace-pre-wrap">{n.message}</td>
                    <td className="py-2 pr-2">
                      {n.timestamp ? new Date(n.timestamp).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NotificationsPage;