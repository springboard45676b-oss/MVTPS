import React, { useState } from "react";

const VoyagesPage = () => {
  const [voyages, setVoyages] = useState([
    {
      id: 1,
      vessel_id: 1,
      port_from: 1,
      port_to: 2,
      departure_time: "2025-12-10T08:00:00Z",
      arrival_time: "2025-12-15T14:00:00Z",
      status: "scheduled",
    },
  ]);

  const [form, setForm] = useState({
    vessel_id: "",
    port_from: "",
    port_to: "",
    departure_time: "",
    arrival_time: "",
    status: "scheduled",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const newVoyage = {
      id: voyages.length + 1,
      ...form,
    };
    setVoyages((prev) => [...prev, newVoyage]);
    setForm({
      vessel_id: "",
      port_from: "",
      port_to: "",
      departure_time: "",
      arrival_time: "",
      status: "scheduled",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Voyages</h1>
          <p className="text-slate-600">
            Manage voyages (vessel_id, port_from, port_to, departure_time, arrival_time, status).
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <form
            onSubmit={handleAdd}
            className="col-span-1 bg-white rounded-2xl shadow p-4 space-y-3 border border-slate-100"
          >
            <h2 className="text-lg font-semibold">Add Voyage</h2>
            {[
              { id: "vessel_id", label: "Vessel ID" },
              { id: "port_from", label: "Port From (ID)" },
              { id: "port_to", label: "Port To (ID)" },
              { id: "departure_time", label: "Departure Time", type: "datetime-local" },
              { id: "arrival_time", label: "Arrival Time", type: "datetime-local" },
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
              Status
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {["scheduled", "in_progress", "completed", "cancelled"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700 transition"
            >
              Add Voyage
            </button>
          </form>

          <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl shadow p-4 border border-slate-100 overflow-auto">
            <h2 className="text-lg font-semibold mb-3">Voyage List</h2>
            <table className="w-full text-sm">
              <thead className="text-left text-slate-600 border-b">
                <tr>
                  <th className="py-2 pr-2">Vessel ID</th>
                  <th className="py-2 pr-2">From</th>
                  <th className="py-2 pr-2">To</th>
                  <th className="py-2 pr-2">Departure</th>
                  <th className="py-2 pr-2">Arrival</th>
                  <th className="py-2 pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {voyages.map((v) => (
                  <tr key={v.id} className="align-top">
                    <td className="py-2 pr-2 font-medium">{v.vessel_id}</td>
                    <td className="py-2 pr-2">{v.port_from}</td>
                    <td className="py-2 pr-2">{v.port_to}</td>
                    <td className="py-2 pr-2">
                      {v.departure_time ? new Date(v.departure_time).toLocaleString() : "-"}
                    </td>
                    <td className="py-2 pr-2">
                      {v.arrival_time ? new Date(v.arrival_time).toLocaleString() : "-"}
                    </td>
                    <td className="py-2 pr-2 capitalize">{v.status}</td>
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

export default VoyagesPage;