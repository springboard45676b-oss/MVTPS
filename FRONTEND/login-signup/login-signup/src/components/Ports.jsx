import React, { useEffect, useState } from 'react';
import { Anchor, MapPin } from 'lucide-react';
import { apiRequest } from '../utils/api';

const getCongestionColor = (score) => {
    if (score >= 7) return 'red';
    if (score >= 4) return 'yellow';
    return 'green';
};

export default function Ports({ onPortSelect }) {
    const [ports, setPorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    // useEffect(() => {
    //     const fetchPorts = async () => {
    //         try {
    //             const res = await fetch('http://127.0.0.1:8000/api/ports/');
    //             const data = await res.json();
    //             console.log('PORTS FETCH DATA:', data);
    //             setPorts(data);


    //             // Normalize backend response
    //             if (Array.isArray(data)) {
    //                 setPorts(data);
    //             } else if (Array.isArray(data.results)) {
    //                 setPorts(data.results);
    //             } else if (Array.isArray(data.data)) {
    //                 setPorts(data.data);
    //             } else {
    //                 console.error('Unexpected API response:', data);
    //                 setPorts([]);
    //             }

    //         } catch (err) {
    //             setError('Failed to load ports');
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchPorts();
    // }, []);
    useEffect(() => {
        let intervalId;

        const fetchPorts = async () => {
            try {
                const data = await apiRequest('/ports/');

                if (Array.isArray(data)) {
                    setPorts(data);
                } else if (Array.isArray(data.results)) {
                    setPorts(data.results);
                } else if (Array.isArray(data.data)) {
                    setPorts(data.data);
                } else {
                    setPorts([]);
                }
            } catch (err) {
                setError('Failed to load ports');
            } finally {
                setLoading(false);
            }
        };

        // Initial load
        fetchPorts();

        // 🔁 Auto-refresh every 30 seconds
        intervalId = setInterval(fetchPorts, 10000);

        // 🧹 Cleanup on tab change / unmount
        return () => clearInterval(intervalId);
    }, []);


    if (loading) {
        return <div className="text-center py-10">Loading ports...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600 py-10">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 mb-6">
                    <Anchor className="w-6 h-6 text-blue-600" />
                    Port Analytics
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.isArray(ports) && ports.map((port) => {
                        const score = Number(port.congestion_score) || 0;
                        const color = getCongestionColor(score);


                        return (
                            // <div
                            //     key={port.id}
                            //     className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition"
                            // >

                            <div
                                key={port.id}
                                onClick={() =>
                                    onPortSelect({
                                        name: port.name,
                                        lat: port.location_lat,
                                        lon: port.location_lon,
                                    })
                                }
                                className="cursor-pointer bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:ring-2 hover:ring-blue-400 transition"
                            >

                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{port.name}</h3>
                                        <p className="text-gray-600 text-sm">{port.country}</p>
                                    </div>
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                </div>

                                {/* Congestion */}
                                <div className="mb-4">
                                    <div className="flex justify-between mb-1 text-sm">
                                        <span className="text-gray-600">Congestion Score</span>
                                        <span
                                            className={`font-bold ${color === 'red'
                                                ? 'text-red-600'
                                                : color === 'yellow'
                                                    ? 'text-yellow-600'
                                                    : 'text-green-600'
                                                }`}
                                        >
                                            {port.congestion_score}
                                        </span>
                                    </div>

                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${color === 'red'
                                                ? 'bg-red-500'
                                                : color === 'yellow'
                                                    ? 'bg-yellow-500'
                                                    : 'bg-green-500'
                                                }`}
                                            style={{
                                                width: `${Math.min((score / 10) * 100, 100)}%`

                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                                    <div>
                                        <p className="text-xs text-gray-600">Arrivals</p>
                                        <p className="font-bold text-lg">{port.arrivals}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Departures</p>
                                        <p className="font-bold text-lg">{port.departures}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Avg Wait</p>
                                        <p className="font-bold text-lg">{port.avg_wait_time}h</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Updated</p>
                                        <p className="font-bold text-sm">
                                            {new Date(port.last_update).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
