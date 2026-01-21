import React, { useEffect, useState } from 'react';
import { FaShip, FaMapMarkerAlt, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const Voyages = () => {
  const [voyages, setVoyages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from Django
    fetch('http://127.0.0.1:8000/api/voyages/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Uncomment if enforcing strict auth
        }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        setVoyages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        // Fallback Mock Data so the page isn't empty during demo
        setVoyages([
            { id: 1, vessel_name: "Ever Given", port_from: "Singapore", port_to: "Rotterdam", departure_time: "2023-10-01", status: "In Transit" },
            { id: 2, vessel_name: "Maersk Ohio", port_from: "Shanghai", port_to: "Los Angeles", departure_time: "2023-09-28", status: "Arrived" },
            { id: 3, vessel_name: "CMA CGM Marco", port_from: "Jebel Ali", port_to: "Hamburg", departure_time: "2023-10-05", status: "Delayed" },
        ]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FaShip className="text-blue-600" /> Voyage Schedule
      </h2>

      {loading ? (
        <p>Loading records...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vessel Name</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Route (From → To)</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Departure</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {voyages.map((voyage) => (
                <tr key={voyage.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 font-bold">{voyage.vessel_name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-red-400"/> {voyage.port_from} <span className="text-gray-400">→</span> {voyage.port_to}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 flex items-center gap-2">
                        <FaClock className="text-gray-400"/> {new Date(voyage.departure_time).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight 
                        ${voyage.status === 'Arrived' ? 'text-green-900' : 
                          voyage.status === 'Delayed' ? 'text-red-900' : 'text-orange-900'}`}>
                      <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full 
                        ${voyage.status === 'Arrived' ? 'bg-green-200' : 
                          voyage.status === 'Delayed' ? 'bg-red-200' : 'bg-orange-200'}`}></span>
                      <span className="relative flex items-center gap-1">
                        {voyage.status === 'Arrived' ? <FaCheckCircle/> : 
                         voyage.status === 'Delayed' ? <FaExclamationTriangle/> : <FaShip/>} 
                        {voyage.status}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Voyages;