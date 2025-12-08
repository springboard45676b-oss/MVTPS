import React, { useState } from "react";

const mockVessels = [
  { id: 1, name: "Evergreen", type: "Container", flag: "Panama", cargo: "General", position: "25.76, -80.19" },
  { id: 2, name: "Blue Star", type: "Tanker", flag: "Liberia", cargo: "Oil", position: "34.05, -118.24" },
];

const LiveTrackingPage = () => {
  const [filters, setFilters] = useState({
    name: "",
    type: "",
    flag: "",
    cargo: "",
  });

  const filtered = mockVessels.filter((v) =>
    Object.entries(filters).every(([k, val]) =>
      !val || (v[k] || "").toString().toLowerCase().includes(val.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-slate-500">Live Tracking & Metadata</p>
        <h1 className="text-2xl font-bold">Live Tracking</h1>
        <p className="text-slate-600">
          Search and filter vessels. (Integrate MarineTraffic/AIS APIs here.) Map placeholder below for routes & positions.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
          <h2 className="text-lg font-semibold">Filters</h2>
          {[
            { id: "name", label: "Name" },
            { id: "type", label: "Type" },
            { id: "flag", label: "Flag" },
            { id: "cargo", label: "Cargo" },
          ].map((f) => (
            <label key={f.id} className="block text-sm font-medium text-slate-700">
              {f.label}
              <input
                name={f.id}
                value={filters[f.id]}
                onChange={(e) => setFilters({ ...filters, [f.id]: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Filter by ${f.label.toLowerCase()}`}
              />
            </label>
          ))}
          <div className="text-xs text-slate-500">
            Subscription idea: toggle alerts on selected vessels. (Hook to notifications.)
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Map & Routes</h2>
            <span className="text-xs text-slate-500">Embed map here (Leaflet/Mapbox)</span>
          </div>
          <div className="h-80 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 border border-dashed border-slate-300 grid place-items-center text-slate-500">
            Map placeholder (routes, positions)
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Results</h2>
          <span className="text-xs text-slate-500">Showing {filtered.length} vessel(s)</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <div key={v.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{v.name}</h3>
                <span className="text-xs rounded-full bg-blue-100 text-blue-700 px-2 py-1">{v.type}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">Flag: {v.flag}</p>
              <p className="text-sm text-slate-600">Cargo: {v.cargo}</p>
              <p className="text-sm text-slate-600">Position: {v.position}</p>
              <button className="mt-3 w-full rounded-lg bg-blue-600 text-white py-2 text-sm font-semibold hover:bg-blue-700 transition">
                Subscribe to alerts
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LiveTrackingPage;

