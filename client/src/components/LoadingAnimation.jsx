// src/components/LoadingAnimation.jsx
import React from 'react';

const LoadingAnimation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes dash {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }

        .spinner-circle {
          animation: spin 3s linear infinite;
        }

        .pulse-ring {
          animation: pulse-ring 2s infinite;
        }

        .floating {
          animation: float 2s ease-in-out infinite;
        }

        .dash-circle {
          animation: dash 2s ease-in-out infinite;
        }
      `}</style>

      <div className="flex flex-col items-center gap-8">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 rounded-full pulse-ring border-4 border-blue-400"></div>
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120" style={{ filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3))' }}>
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e0e7ff" strokeWidth="3" />
            <circle cx="60" cy="60" r="54" fill="none" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" className="dash-circle" strokeDasharray="1000" />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 spinner-circle shadow-lg"></div>
          </div>
        </div>

        <div className="floating text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Loading Fleet Data</h2>
          <p className="text-slate-600">Connecting to database...</p>
        </div>

        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-blue-500" style={{ animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite` }}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;