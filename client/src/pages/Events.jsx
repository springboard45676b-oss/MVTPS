import React, { useState } from "react";

const EventsPage = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      vessel_id: 1,
      event_type: "arrival",
      location: "Port of LA",
      timestamp: "2025-12-08T09:30:00Z",
      details: "Arrived on schedule",
    },
  ]);

  const [form, setForm] = useState({
    vessel_id: "",
    event_type: "arrival",
    location: "",
    timestamp: "",
    details: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const newEvent = {
      id: events.length + 1,
      ...form,
    };
    setEvents((prev) => [...prev, newEvent]);
    setForm({
      vessel_id: "",
      event_type: "arrival",
      location: "",
      timestamp: "",
      details: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-slate-600">
            Manage events (vessel_id, event_type, location, timestamp, details).
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <form
            onSubmit={handleAdd}
            className="col-span-1 bg-white rounded-2xl shadow p-4 space-y-3 border border-slate-100"
          >
            <h2 className="text-lg font-semibold">Add Event</h2>
            {[
              { id: "vessel_id", label: "Vessel ID" },
              { id: "location", label: "Location" },
              { id: "timestamp", label: "Timestamp", type: "datetime-local" },
            ].map((field) => (
              <label key={field.id} className="block text-sm font-medium text-slate-700">
                {field.label}
                <input
                  name={field.id}
                  type={field.type || "text"}
                  value={form[field.id]}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </label>
            ))}
            <label className="block text-sm font-medium text-slate-700">
              Event Type
              <select
                name="event_type"
                value={form.event_type}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {["arrival", "departure", "maintenance", "inspection", "incident", "other"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Details
              <textarea
                name="details"
                value={form.details}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700 transition"
            >
              Add Event
            </button>
          </form>

          <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl shadow p-4 border border-slate-100 overflow-auto">
            <h2 className="text-lg font-semibold mb-3">Event List</h2>
            <table className="w-full text-sm">
              <thead className="text-left text-slate-600 border-b">
                <tr>
                  <th className="py-2 pr-2">Vessel ID</th>
                  <th className="py-2 pr-2">Type</th>
                  <th className="py-2 pr-2">Location</th>
                  <th className="py-2 pr-2">Timestamp</th>
                  <th className="py-2 pr-2">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {events.map((ev) => (
                  <tr key={ev.id} className="align-top">
                    <td className="py-2 pr-2 font-medium">{ev.vessel_id}</td>
                    <td className="py-2 pr-2 capitalize">{ev.event_type}</td>
                    <td className="py-2 pr-2">{ev.location}</td>
                    <td className="py-2 pr-2">
                      {ev.timestamp ? new Date(ev.timestamp).toLocaleString() : "-"}
                    </td>
                    <td className="py-2 pr-2 whitespace-pre-wrap">{ev.details || "-"}</td>
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

export default EventsPage;