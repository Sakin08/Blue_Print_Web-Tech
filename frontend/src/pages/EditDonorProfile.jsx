import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const EditDonorProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        bloodGroup: '',
        location: '',
        phone: '',
        isAvailable: true
    });
    const [showAddDonation, setShowAddDonation] = useState(false);
    const [donationData, setDonationData] = useState({
        date: '',
        location: '',
        notes: ''
    });

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    useEffect(() => {
        loadDonorProfile();
    }, []);

    const loadDonorProfile = async () => {
        try {
            const res = await api.get(`/blood-donation/donors/${user._id}`);
            const donor = res.data;
            setFormData({
                bloodGroup: donor.bloodGroup,
                location: donor.location,
                phone: donor.phone,
                isAvailable: donor.isAvailable
            });
        } catch (err) {
            console.error('Failed to load donor profile:', err);
            if (err.response?.status === 404) {
                // No donor profile exists, redirect to register
                setMessage({ type: 'error', text: 'No donor profile found. Redirecting to registration...' });
                setTimeout(() => {
                    navigate('/blood-donation/register');
                }, 2000);
            } else {
                setMessage({ type: 'error', text: 'Failed to load profile' });
            }
        }
        setLoadingProfile(false);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.put('/blood-donation/donor', formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => {
                navigate('/blood-donation');
            }, 2000);
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Failed to update profile'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddDonation = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/blood-donation/donation', donationData);
            setMessage({ type: 'success', text: 'Donation record added successfully!' });
            setShowAddDonation(false);
            setDonationData({ date: '', location: '', notes: '' });
            setTimeout(() => {
                navigate('/blood-donation');
            }, 2000);
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Failed to add donation'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete your donor profile? This cannot be undone.')) {
            return;
        }

        setLoading(true);
        try {
            await api.delete('/blood-donation/donor');
            alert('Donor profile deleted successfully');
            navigate('/blood-donation');
        } catch (err) {
            alert('Failed to delete profile');
        } finally {
            setLoading(false);
        }
    };

    if (loadingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 py-12">
            <div className="container mx-auto px-6 max-w-2xl">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">✏️ Edit Donor Profile</h1>
                    <p className="text-gray-600 mb-8">Update your blood donor information</p>

                    {message.text && (
                        <div className={`mb-6 px-4 py-3 rounded-lg ${message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleUpdate} className="space-y-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Blood Group *
                            </label>
                            <select
                                value={formData.bloodGroup}
                                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Blood Group</option>
                                {bloodGroups.map(group => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location / Dorm *
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g., Shahid Salam Hall, Room 301"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Phone *
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+8801XXXXXXXXX"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="isAvailable"
                                checked={formData.isAvailable}
                                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                            />
                            <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                                I am available to donate blood
                            </label>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/blood-donation')}
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition shadow-lg disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>

                    {/* Add Donation Section */}
                    <div className="border-t border-gray-200 pt-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">🩸 Add Donation Record</h2>

                        {!showAddDonation ? (
                            <button
                                onClick={() => setShowAddDonation(true)}
                                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                            >
                                + Add New Donation
                            </button>
                        ) : (
                            <form onSubmit={handleAddDonation} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Donation Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={donationData.date}
                                        onChange={(e) => setDonationData({ ...donationData, date: e.target.value })}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={donationData.location}
                                        onChange={(e) => setDonationData({ ...donationData, location: e.target.value })}
                                        placeholder="e.g., SUST Medical Center"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={donationData.notes}
                                        onChange={(e) => setDonationData({ ...donationData, notes: e.target.value })}
                                        rows={3}
                                        placeholder="Any additional notes..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    ></textarea>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddDonation(false);
                                            setDonationData({ date: '', location: '', notes: '' });
                                        }}
                                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        {loading ? 'Adding...' : 'Add Donation'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Delete Profile Section */}
                    <div className="border-t border-gray-200 pt-8 mt-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">⚠️ Danger Zone</h2>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                        >
                            Delete Donor Profile
                        </button>
                        <p className="text-sm text-gray-500 mt-2 text-center">
                            This will permanently delete your donor profile and donation history.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditDonorProfile;
