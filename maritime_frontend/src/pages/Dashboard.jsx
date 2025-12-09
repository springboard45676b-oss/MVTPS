import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaShip, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-red-100 text-red-800';
            case 'ANALYST':
                return 'bg-blue-100 text-blue-800';
            case 'OPERATOR':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation Bar */}
            <nav className="bg-maritime-navy text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <FaShip className="text-3xl mr-3" />
                            <span className="text-xl font-bold">Maritime Vessel Tracking</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex items-center hover:bg-maritime-ocean px-3 py-2 rounded transition"
                            >
                                <FaUser className="mr-2" />
                                Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center hover:bg-red-600 px-3 py-2 rounded transition"
                            >
                                <FaSignOutAlt className="mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        Welcome to Maritime Vessel Tracking Platform
                    </h1>

                    <div className="bg-maritime-blue bg-opacity-10 border-l-4 border-maritime-blue p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Hello, {user?.name || user?.username}!
                        </h2>
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-600">Your Role:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(user?.role)}`}>
                                {user?.role}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-2">Vessels</h3>
                            <p className="text-3xl font-bold">0</p>
                            <p className="text-sm opacity-90">Total tracked vessels</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-2">Ports</h3>
                            <p className="text-3xl font-bold">0</p>
                            <p className="text-sm opacity-90">Monitored ports</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-2">Active Voyages</h3>
                            <p className="text-3xl font-bold">0</p>
                            <p className="text-sm opacity-90">Ongoing voyages</p>
                        </div>
                    </div>

                    <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            🚧 Week 1 & 2 Implementation Complete
                        </h3>
                        <p className="text-gray-700">
                            The authentication system and database models are now set up.
                            Vessel tracking, port analytics, and safety overlays will be implemented in upcoming weeks.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
