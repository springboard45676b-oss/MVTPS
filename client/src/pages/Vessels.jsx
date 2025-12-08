import React, { useState } from "react";

const VesselsPage = () => {
  const [vessels, setVessels] = useState([
    {
      id: 1,
      imo_number: "IMO1234567",
      name: "Evergreen",
      type: "Container",
      flag: "Panama",
      cargo_type: "General",
      operator: "ABC Shipping",
      last_position_lat: 25.7617,
      last_position_lon: -80.1918,
      last_update: "2025-12-08T10:00:00Z",
    },
  ]);

  const [form, setForm] = useState({
    imo_number: "",
    name: "",
    type: "",
    flag: "",
    cargo_type: "",
    operator: "",
    last_position_lat: "",
    last_position_lon: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const newVessel = {
      id: vessels.length + 1,
      ...form,
      last_position_lat: parseFloat(form.last_position_lat) || null,
      last_position_lon: parseFloat(form.last_position_lon) || null,
      last_update: new Date().toISOString(),
    };
    setVessels((prev) => [...prev, newVessel]);
    setForm({
      imo_number: "",
      name: "",
      type: "",
      flag: "",
      cargo_type: "",
      operator: "",
      last_position_lat: "",
      last_position_lon: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Vessels</h1>
          <p className="text-slate-600">
            Manage vessels (imo_number, name, type, flag, cargo_type, operator, last position, last update).
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <form
            onSubmit={handleAdd}
            className="col-span-1 bg-white rounded-2xl shadow p-4 space-y-3 border border-slate-100"
          >
            <h2 className="text-lg font-semibold">Add Vessel</h2>
            {[
              { id: "imo_number", label: "IMO Number" },
              { id: "name", label: "Name" },
              { id: "type", label: "Type" },
              { id: "flag", label: "Flag" },
              { id: "cargo_type", label: "Cargo Type" },
              { id: "operator", label: "Operator" },
              { id: "last_position_lat", label: "Last Position Lat", type: "number" },
              { id: "last_position_lon", label: "Last Position Lon", type: "number" },
            ].map((field) => (
              <label key={field.id} className="block text-sm font-medium text-slate-700">
                {field.label}
                <input
                  name={field.id}
                  type={field.type || "text"}
                  value={form[field.id]}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={["imo_number", "name", "type", "flag", "cargo_type", "operator"].includes(field.id)}
                />
              </label>
            ))}
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700 transition"
            >
              Add Vessel
            </button>
          </form>

          <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl shadow p-4 border border-slate-100 overflow-auto">
            <h2 className="text-lg font-semibold mb-3">Vessel List</h2>
            <table className="w-full text-sm">
              <thead className="text-left text-slate-600 border-b">
                <tr>
                  <th className="py-2 pr-2">IMO</th>
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Type</th>
                  <th className="py-2 pr-2">Flag</th>
                  <th className="py-2 pr-2">Cargo</th>
                  <th className="py-2 pr-2">Operator</th>
                  <th className="py-2 pr-2">Lat</th>
                  <th className="py-2 pr-2">Lon</th>
                  <th className="py-2 pr-2">Last Update</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vessels.map((v) => (
                  <tr key={v.id} className="align-top">
                    <td className="py-2 pr-2 font-medium">{v.imo_number}</td>
                    <td className="py-2 pr-2">{v.name}</td>
                    <td className="py-2 pr-2">{v.type}</td>
                    <td className="py-2 pr-2">{v.flag}</td>
                    <td className="py-2 pr-2">{v.cargo_type}</td>
                    <td className="py-2 pr-2">{v.operator}</td>
                    <td className="py-2 pr-2">{v.last_position_lat ?? "-"}</td>
                    <td className="py-2 pr-2">{v.last_position_lon ?? "-"}</td>
                    <td className="py-2 pr-2">
                      {v.last_update ? new Date(v.last_update).toLocaleString() : "-"}
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

export default VesselsPage;