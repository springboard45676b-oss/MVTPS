import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'Singapore', waitTime: 4, congestion: 85 },
  { name: 'Rotterdam', waitTime: 3, congestion: 60 },
  { name: 'Shanghai', waitTime: 7, congestion: 95 },
  { name: 'LA/Long Beach', waitTime: 5, congestion: 70 },
  { name: 'Dubai', waitTime: 2, congestion: 40 },
];

const PortAnalytics = () => {
  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "10px", border: "1px solid #eee", marginBottom: "20px" }}>
      <h3 style={{ color: "#2c3e50", margin: "0 0 10px 0" }}>Port Congestion Analytics</h3>
      <p style={{ fontSize: "0.8rem", color: "#7f8c8d", marginBottom: "20px" }}>Real-time Average Wait Times (Hours)</p>
      
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{fontSize: 10}} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="waitTime" fill="#3498db" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.congestion > 80 ? '#e74c3c' : '#3498db'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortAnalytics;