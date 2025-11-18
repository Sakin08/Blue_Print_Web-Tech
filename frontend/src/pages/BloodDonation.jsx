import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DonorCard from '../components/DonorCard';
import RequestCard from '../components/RequestCard';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const BloodDonation = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('donors');
    const [donors, setDonors] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        bloodGroup: '',
        location: '',
        eligible: false
    });

    useEffect(() => {
        if (activeTab === 'donors') {
            loadDonors();
        } else {
            loadRequests();
        }
    }, [activeTab, filters]);

    const loadDonors = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.bloodGroup) params.append('bloodGroup', filters.bloodGroup);
            if (filters.location) params.append('location', filters.location);
            if (filters.eligible) params.append('eligible', 'true');

            const res = await axios.get(`${API_URL}/blood-donation/donors?${params}`);
            setDonors(res.data);
        } catch (err) {
            console.error('Failed to load donors:', err);
        }
        setLoading(false);
    };

    const loadRequests = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.bloodGroup) params.append('bloodGroup', filters.bloodGroup);

            const res = await axios.get(`${API_URL}/blood-donation/requests?${params}`);
            setRequests(res.data);
        } catch (err) {
            console.error('Failed to load requests:', err);
        }
        setLoading(false);
    };

    const isEligible = (donor) => {
        if (!donor.nextEligibleDate) return true;
        return new Date(donor.nextEligibleDate) <= new Date();
    };

    const getDaysUntilEligible = (nextDate) => {
        if (!nextDate) return 0;
        const diff = new Date(nextDate) - new Date();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 py-12">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">🩸 Blood Donation</h1>
                        <p className="text-gray-600 mt-1">Save lives by donating blood</p>
                    </div>
                    {user && (
                        <div className="flex gap-3">
                            <Link
                                to="/blood-donation/register"
                                className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition shadow-lg"
                            >
                                + Register as Donor
                            </Link>
                            <Link
                                to="/blood-donation/request"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
                            >
                                + Request Blood
                            </Link>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-8">
                    <button
                        onClick={() => setActiveTab('donors')}
                        className={`px-6 py-3 font-semibold transition ${activeTab === 'donors'
                            ? 'text-red-600 border-b-2 border-red-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Blood Donors ({donors.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-6 py-3 font-semibold transition ${activeTab === 'requests'
                            ? 'text-red-600 border-b-2 border-red-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Blood Requests ({requests.length})
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Blood Group
                            </label>
                            <select
                                value={filters.bloodGroup}
                                onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                            >
                                <option value="">All Groups</option>
                                {bloodGroups.map(group => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                placeholder="Search location..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        {activeTab === 'donors' && (
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.eligible}
                                        onChange={(e) => setFilters({ ...filters, eligible: e.target.checked })}
                                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Show only eligible donors
                                    </span>
                                </label>
                            </div>
                        )}
                        <div className="flex items-end">
                            <button
                                onClick={() => setFilters({ bloodGroup: '', location: '', eligible: false })}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : activeTab === 'donors' ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {donors.map(donor => (
                            <DonorCard
                                key={donor._id}
                                donor={donor}
                                isEligible={isEligible}
                                daysLeft={getDaysUntilEligible}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {requests.map(request => (
                            <RequestCard key={request._id} request={request} onUpdate={loadRequests} />
                        ))}
                    </div>
                )}

                {!loading && ((activeTab === 'donors' && donors.length === 0) || (activeTab === 'requests' && requests.length === 0)) && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🩸</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            No {activeTab === 'donors' ? 'donors' : 'requests'} found
                        </h3>
                        <p className="text-gray-600">
                            {activeTab === 'donors'
                                ? 'Be the first to register as a blood donor!'
                                : 'No active blood requests at the moment.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BloodDonation;
