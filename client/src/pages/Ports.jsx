import React, { useState } from "react";

const PortsPage = () => {
  const [ports, setPorts] = useState([
    {
      id: 1,
      name: "Port of LA",
      location: "Los Angeles, CA",
      country: "USA",
      congestion_score: 65.5,
      avg_wait_time: 12.4,
      arrivals: 120,
      departures: 115,
      last_update: "2025-12-08T10:00:00Z",
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    location: "",
    country: "",
    congestion_score: "",
    avg_wait_time: "",
    arrivals: "",
    departures: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const newPort = {
      id: ports.length + 1,
      ...form,
      congestion_score: parseFloat(form.congestion_score) || 0,
      avg_wait_time: parseFloat(form.avg_wait_time) || 0,
      arrivals: parseInt(form.arrivals || "0", 10),
      departures: parseInt(form.departures || "0", 10),
      last_update: new Date().toISOString(),
    };
    setPorts((prev) => [...prev, newPort]);
    setForm({
      name: "",
      location: "",
      country: "",
      congestion_score: "",
      avg_wait_time: "",
      arrivals: "",
      departures: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Ports</h1>
          <p className="text-slate-600">
            Manage ports (name, location, country, congestion_score, avg_wait_time, arrivals, departures, last_update).
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <form
            onSubmit={handleAdd}
            className="col-span-1 bg-white rounded-2xl shadow p-4 space-y-3 border border-slate-100"
          >
            <h2 className="text-lg font-semibold">Add Port</h2>
            {[
              { id: "name", label: "Name" },
              { id: "location", label: "Location" },
              { id: "country", label: "Country" },
              { id: "congestion_score", label: "Congestion Score", type: "number", step: "0.1" },
              { id: "avg_wait_time", label: "Avg Wait Time (hrs)", type: "number", step: "0.1" },
              { id: "arrivals", label: "Arrivals", type: "number" },
              { id: "departures", label: "Departures", type: "number" },
            ].map((field) => (
              <label key={field.id} className="block text-sm font-medium text-slate-700">
                {field.label}
                <input
                  name={field.id}
                  type={field.type || "text"}
                  step={field.step}
                  value={form[field.id]}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={["name", "location", "country"].includes(field.id)}
                />
              </label>
            ))}
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700 transition"
            >
              Add Port
            </button>
          </form>

          <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl shadow p-4 border border-slate-100 overflow-auto">
            <h2 className="text-lg font-semibold mb-3">Port List</h2>
            <table className="w-full text-sm">
              <thead className="text-left text-slate-600 border-b">
                <tr>
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Location</th>
                  <th className="py-2 pr-2">Country</th>
                  <th className="py-2 pr-2">Congestion</th>
                  <th className="py-2 pr-2">Avg Wait</th>
                  <th className="py-2 pr-2">Arrivals</th>
                  <th className="py-2 pr-2">Departures</th>
                  <th className="py-2 pr-2">Last Update</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ports.map((p) => (
                  <tr key={p.id} className="align-top">
                    <td className="py-2 pr-2 font-medium">{p.name}</td>
                    <td className="py-2 pr-2">{p.location}</td>
                    <td className="py-2 pr-2">{p.country}</td>
                    <td className="py-2 pr-2">{p.congestion_score}</td>
                    <td className="py-2 pr-2">{p.avg_wait_time}</td>
                    <td className="py-2 pr-2">{p.arrivals}</td>
                    <td className="py-2 pr-2">{p.departures}</td>
                    <td className="py-2 pr-2">
                      {p.last_update ? new Date(p.last_update).toLocaleString() : "-"}
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

export default PortsPage;

