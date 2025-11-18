import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Camera, MapPin, Calendar, Mail, Phone, Users, Heart,
    MessageCircle, Share2, Edit, Award, BookOpen,
    Home, CheckCircle, Star, X, Save
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const UserProfile = () => {
    const { id } = useParams();
    const { user: currentUser, setUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
    const [showFollowModal, setShowFollowModal] = useState(false);
    const [followModalType, setFollowModalType] = useState('followers'); // 'followers' or 'following'
    const [followSearchQuery, setFollowSearchQuery] = useState('');

    useEffect(() => {
        loadProfile();
    }, [id]);

    const loadProfile = async () => {
        try {
            const res = await axios.get(`${API_URL}/users/${id}`, { withCredentials: true });
            setProfile(res.data.user);
            setIsFollowing(res.data.user.followers?.some(f => f._id === currentUser?._id));

            // Initialize edit data
            setEditData({
                name: res.data.user.name || '',
                username: res.data.user.username || '',
                bio: res.data.user.bio || '',
                phone: res.data.user.phone || '',
                gender: res.data.user.gender || '',
                dateOfBirth: res.data.user.dateOfBirth ? res.data.user.dateOfBirth.split('T')[0] : '',
                interests: res.data.user.interests?.join(', ') || '',
                socialLinks: {
                    linkedin: res.data.user.socialLinks?.linkedin || '',
                    github: res.data.user.socialLinks?.github || '',
                    portfolio: res.data.user.socialLinks?.portfolio || '',
                    facebook: res.data.user.socialLinks?.facebook || ''
                },
                address: {
                    street: res.data.user.address?.street || '',
                    city: res.data.user.address?.city || '',
                    district: res.data.user.address?.district || '',
                    country: res.data.user.address?.country || 'Bangladesh'
                },
                dormInfo: {
                    dormName: res.data.user.dormInfo?.dormName || '',
                    roomNumber: res.data.user.dormInfo?.roomNumber || ''
                }
            });
        } catch (err) {
            console.error('Failed to load profile:', err);
        }
        setLoading(false);
    };

    const handleFollow = async () => {
        try {
            const res = await axios.post(`${API_URL}/users/${id}/follow`, {}, { withCredentials: true });
            setIsFollowing(res.data.isFollowing);
            setProfile(prev => ({
                ...prev,
                followers: res.data.isFollowing
                    ? [...prev.followers, currentUser]
                    : prev.followers.filter(f => f._id !== currentUser._id)
            }));
        } catch (err) {
            console.error('Failed to follow:', err);
        }
    };

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const res = await axios.post(`${API_URL}/auth/upload-profile-picture`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            setProfile(prev => ({ ...prev, profilePicture: res.data.profilePicture }));
            if (currentUser) {
                setUser({ ...currentUser, profilePicture: res.data.profilePicture });
            }
        } catch (err) {
            alert('Failed to upload profile picture');
        }
    };

    const handleSaveProfile = async () => {
        setSaveMessage({ type: '', text: '' });
        try {
            const updatedData = {
                name: editData.name,
                username: editData.username.trim() || null,
                bio: editData.bio,
                phone: editData.phone,
                gender: editData.gender,
                dateOfBirth: editData.dateOfBirth || undefined,
                interests: editData.interests.split(',').map(i => i.trim()).filter(Boolean),
                socialLinks: editData.socialLinks,
                address: editData.address,
                dormInfo: editData.dormInfo
            };

            const res = await axios.put(`${API_URL}/users/profile`, updatedData, { withCredentials: true });
            setProfile(prev => ({ ...prev, ...res.data }));
            if (currentUser) {
                setUser({ ...currentUser, ...res.data });
            }
            setIsEditing(false);
            setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setSaveMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setSaveMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser?._id === id;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section with Cover */}
            <div className="relative h-64 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Profile Header */}
            <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Profile Picture */}
                        <div className="relative group">
                            {profile.profilePicture ? (
                                <img
                                    src={profile.profilePicture}
                                    alt={profile.name}
                                    className="w-40 h-40 rounded-full object-cover border-8 border-white shadow-xl ring-4 ring-indigo-100"
                                />
                            ) : (
                                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-6xl font-bold border-8 border-white shadow-xl ring-4 ring-indigo-100">
                                    {profile.name?.charAt(0).toUpperCase()}
                                </div>
                            )}

                            {isOwnProfile && (
                                <label
                                    htmlFor="profile-pic-upload"
                                    className="absolute bottom-2 right-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-full cursor-pointer hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg lg:opacity-0 lg:group-hover:opacity-100 transform hover:scale-110"
                                >
                                    <Camera className="w-5 h-5" />
                                </label>
                            )}
                            <input
                                id="profile-pic-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePictureUpload}
                                className="hidden"
                            />
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-4xl font-extrabold text-gray-900">{profile.name}</h1>
                                        {profile.isStudentVerified && (
                                            <CheckCircle className="w-7 h-7 text-blue-500" fill="currentColor" />
                                        )}
                                    </div>
                                    {profile.username && (
                                        <p className="text-lg text-gray-600 mb-2">@{profile.username}</p>
                                    )}
                                    {profile.bio && (
                                        <p className="text-gray-700 mb-3 max-w-2xl">{profile.bio}</p>
                                    )}
                                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <BookOpen className="w-4 h-4" /> {profile.department}
                                        </span>
                                        {profile.batch && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" /> Batch {profile.batch}
                                            </span>
                                        )}
                                        {profile.phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-4 h-4" /> {profile.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    {isOwnProfile ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setIsEditing(!isEditing);
                                                    if (!isEditing) {
                                                        setActiveTab('about');
                                                    }
                                                }}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${isEditing
                                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                                                    }`}
                                            >
                                                {isEditing ? <><X className="w-5 h-5" /> Cancel</> : <><Edit className="w-5 h-5" /> Edit Profile</>}
                                            </button>
                                            {isEditing && (
                                                <button
                                                    onClick={handleSaveProfile}
                                                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg"
                                                >
                                                    <Save className="w-5 h-5" /> Save Changes
                                                </button>
                                            )}
                                        </>
                                    ) : currentUser && (
                                        <>
                                            <button
                                                onClick={handleFollow}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${isFollowing
                                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                                                    }`}
                                            >
                                                <Users className="w-5 h-5" /> {isFollowing ? 'Following' : 'Follow'}
                                            </button>
                                            <Link
                                                to={`/chat/${id}`}
                                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
                                            >
                                                <MessageCircle className="w-5 h-5" /> Message
                                            </Link>
                                        </>
                                    )}
                                    <button className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Badges */}
                            {profile.badges?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {profile.badges.map((badge, i) => (
                                        <span key={i} className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-sm font-bold flex items-center gap-1">
                                            <Award className="w-4 h-4" /> {badge}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Stats Section */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setFollowModalType('followers');
                                        setShowFollowModal(true);
                                    }}
                                    className="text-center hover:bg-gray-50 rounded-lg p-2 transition"
                                >
                                    <div className="text-2xl font-extrabold text-gray-900">{profile.followers?.length || 0}</div>
                                    <div className="text-sm text-gray-600">Followers</div>
                                </button>
                                <button
                                    onClick={() => {
                                        setFollowModalType('following');
                                        setShowFollowModal(true);
                                    }}
                                    className="text-center hover:bg-gray-50 rounded-lg p-2 transition"
                                >
                                    <div className="text-2xl font-extrabold text-gray-900">{profile.following?.length || 0}</div>
                                    <div className="text-sm text-gray-600">Following</div>
                                </button>
                                <div className="text-center">
                                    <div className="text-2xl font-extrabold text-gray-900">{profile.reputationPoints || 0}</div>
                                    <div className="text-sm text-gray-600">Reputation</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                                        <span className="text-2xl font-extrabold text-gray-900">{profile.rating?.toFixed(1) || '0.0'}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">Rating ({profile.reviewCount || 0})</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success/Error Message */}
                {saveMessage.text && (
                    <div className={`mt-6 px-6 py-4 rounded-2xl font-semibold ${saveMessage.type === 'success'
                        ? 'bg-green-50 border-2 border-green-500 text-green-700'
                        : 'bg-red-50 border-2 border-red-500 text-red-700'
                        }`}>
                        {saveMessage.text}
                    </div>
                )}

                {/* About Section */}
                <div className="mt-6 mb-12">
                    <AboutSection
                        profile={profile}
                        isEditing={isEditing}
                        editData={editData}
                        setEditData={setEditData}
                        setShowFollowModal={setShowFollowModal}
                        setFollowModalType={setFollowModalType}
                    />
                </div>
            </div>

            {/* Followers/Following Modal */}
            {showFollowModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {followModalType === 'followers' ? 'Followers' : 'Following'}
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        ({(followModalType === 'followers' ? profile.followers : profile.following)?.length || 0})
                                    </span>
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowFollowModal(false);
                                        setFollowSearchQuery('');
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                            {/* Search Bar */}
                            {(followModalType === 'followers' ? profile.followers : profile.following)?.length > 5 && (
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={followSearchQuery}
                                        onChange={(e) => setFollowSearchQuery(e.target.value)}
                                        placeholder="Search..."
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {(() => {
                                const userList = followModalType === 'followers' ? profile.followers : profile.following;
                                const filteredUsers = followSearchQuery.trim()
                                    ? userList?.filter(user =>
                                        user.name?.toLowerCase().includes(followSearchQuery.toLowerCase()) ||
                                        user.department?.toLowerCase().includes(followSearchQuery.toLowerCase())
                                    )
                                    : userList;

                                return filteredUsers?.length > 0 ? (
                                    <>
                                        {followSearchQuery.trim() && (
                                            <p className="text-sm text-gray-500 mb-3">
                                                Found {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''}
                                            </p>
                                        )}
                                        <div className="space-y-3">
                                            {filteredUsers.map((user) => (
                                                <Link
                                                    key={user._id}
                                                    to={`/profile/${user._id}`}
                                                    onClick={() => setShowFollowModal(false)}
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition group"
                                                >
                                                    {user.profilePicture ? (
                                                        <img
                                                            src={user.profilePicture}
                                                            alt={user.name}
                                                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate group-hover:text-indigo-600">
                                                            {user.name}
                                                        </p>
                                                        {user.department && (
                                                            <p className="text-sm text-gray-500 truncate">{user.department}</p>
                                                        )}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                ) : followSearchQuery.trim() ? (
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">No results found for "{followSearchQuery}"</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">
                                            No {followModalType === 'followers' ? 'followers' : 'following'} yet
                                        </p>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// About Section Component
const AboutSection = ({ profile, isEditing, editData, setEditData, setShowFollowModal, setFollowModalType }) => {
    if (isEditing) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">✏️ Edit Basic Info</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                            <input
                                type="text"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                            <input
                                type="text"
                                value={editData.username}
                                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="@username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                            <textarea
                                value={editData.bio}
                                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                rows="3"
                                maxLength="500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                            <input
                                type="tel"
                                value={editData.phone}
                                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                            <select
                                value={editData.gender}
                                onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                            <input
                                type="date"
                                value={editData.dateOfBirth}
                                onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">❤️ Interests</h3>
                    <textarea
                        value={editData.interests}
                        onChange={(e) => setEditData({ ...editData, interests: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows="3"
                        placeholder="Comma separated (e.g., Coding, Music, Sports)"
                    />
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">🔗 Social Links</h3>
                    <div className="space-y-3">
                        <input
                            type="url"
                            value={editData.socialLinks.linkedin}
                            onChange={(e) => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, linkedin: e.target.value } })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="LinkedIn URL"
                        />
                        <input
                            type="url"
                            value={editData.socialLinks.github}
                            onChange={(e) => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, github: e.target.value } })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="GitHub URL"
                        />
                        <input
                            type="url"
                            value={editData.socialLinks.portfolio}
                            onChange={(e) => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, portfolio: e.target.value } })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Portfolio URL"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">📍 Location</h3>
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={editData.address.city}
                            onChange={(e) => setEditData({ ...editData, address: { ...editData.address, city: e.target.value } })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="City"
                        />
                        <input
                            type="text"
                            value={editData.address.district}
                            onChange={(e) => setEditData({ ...editData, address: { ...editData.address, district: e.target.value } })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="District"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">🏠 Dorm Information</h3>
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={editData.dormInfo?.dormName || ''}
                            onChange={(e) => setEditData({ ...editData, dormInfo: { ...editData.dormInfo, dormName: e.target.value } })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Dorm Name"
                        />
                        <input
                            type="text"
                            value={editData.dormInfo?.roomNumber || ''}
                            onChange={(e) => setEditData({ ...editData, dormInfo: { ...editData.dormInfo, roomNumber: e.target.value } })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Room Number"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-indigo-600" /> Basic Information
                </h3>
                <div className="space-y-3">
                    <InfoRow label="Email" value={profile.email} icon={<Mail className="w-4 h-4" />} />
                    <InfoRow label="Department" value={profile.department} icon={<BookOpen className="w-4 h-4" />} />
                    {profile.batch && <InfoRow label="Batch" value={profile.batch} icon={<Calendar className="w-4 h-4" />} />}
                    {profile.phone && <InfoRow label="Phone" value={profile.phone} icon={<Phone className="w-4 h-4" />} />}
                    {profile.gender && <InfoRow label="Gender" value={profile.gender} />}
                    {profile.dateOfBirth && (
                        <InfoRow
                            label="Date of Birth"
                            value={new Date(profile.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        />
                    )}
                </div>
            </div>

            {profile.interests?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Heart className="w-6 h-6 text-pink-600" /> Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, i) => (
                            <span key={i} className="px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700 rounded-full text-sm font-semibold border border-purple-200">
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {profile.socialLinks && (profile.socialLinks.linkedin || profile.socialLinks.github || profile.socialLinks.portfolio) && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">🔗 Social Links</h3>
                    <div className="space-y-3">
                        {profile.socialLinks.linkedin && (
                            <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-700 font-medium">
                                LinkedIn →
                            </a>
                        )}
                        {profile.socialLinks.github && (
                            <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-gray-900 font-medium">
                                GitHub →
                            </a>
                        )}
                        {profile.socialLinks.portfolio && (
                            <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="block text-indigo-600 hover:text-indigo-700 font-medium">
                                Portfolio →
                            </a>
                        )}
                    </div>
                </div>
            )}

            {profile.address && (profile.address.city || profile.address.district) && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-red-600" /> Location
                    </h3>
                    <p className="text-gray-700">
                        {profile.address.city}{profile.address.city && profile.address.district && ', '}{profile.address.district}
                        {profile.address.country && `, ${profile.address.country}`}
                    </p>
                </div>
            )}

            {profile.dormInfo && (profile.dormInfo.dormName || profile.dormInfo.roomNumber) && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Home className="w-6 h-6 text-indigo-600" /> Dorm Information
                    </h3>
                    <div className="space-y-2">
                        {profile.dormInfo.dormName && (
                            <div>
                                <span className="text-sm text-gray-600">Dorm Name:</span>
                                <p className="font-semibold text-gray-900">{profile.dormInfo.dormName}</p>
                            </div>
                        )}
                        {profile.dormInfo.roomNumber && (
                            <div>
                                <span className="text-sm text-gray-600">Room Number:</span>
                                <p className="font-semibold text-gray-900">{profile.dormInfo.roomNumber}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Info Row Component
const InfoRow = ({ label, value, icon }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
        <span className="text-sm text-gray-600 flex items-center gap-2">
            {icon} {label}
        </span>
        <span className="font-semibold text-gray-900">{value}</span>
    </div>
);

export default UserProfile;
