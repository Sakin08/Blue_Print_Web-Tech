import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';
import CommentsSection from '../components/CommentsSection';
import PosterInfo from '../components/PosterInfo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const StudyGroupDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGroup();
    }, [id]);

    const loadGroup = async () => {
        try {
            const res = await axios.get(`${API_URL}/study-groups/${id}`);
            setGroup(res.data);
        } catch (err) {
            console.error('Failed to load study group:', err);
        }
        setLoading(false);
    };

    const handleJoin = async () => {
        try {
            const res = await axios.post(`${API_URL}/study-groups/${id}/join`, {}, {
                withCredentials: true
            });
            setGroup(res.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to join group');
        }
    };

    const handleLeave = async () => {
        if (!confirm('Leave this study group?')) return;

        try {
            await axios.post(`${API_URL}/study-groups/${id}/leave`, {}, {
                withCredentials: true
            });
            navigate('/study-groups');
        } catch (err) {
            alert('Failed to leave group');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this study group? This cannot be undone.')) return;

        try {
            await axios.delete(`${API_URL}/study-groups/${id}`, {
                withCredentials: true
            });
            navigate('/study-groups');
        } catch (err) {
            alert('Failed to delete group');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Study group not found</h2>
                    <Link to="/study-groups" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
                        ← Back to Study Groups
                    </Link>
                </div>
            </div>
        );
    }

    const isMember = group.members.some(m => m._id === user?._id);
    const isCreator = group.creator._id === user?._id;
    const isFull = group.maxMembers > 0 && group.members.length >= group.maxMembers;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
            <div className="container mx-auto px-6 max-w-5xl">
                <Link to="/study-groups" className="text-indigo-600 hover:text-indigo-700 font-medium mb-6 inline-block">
                    ← Back to Study Groups
                </Link>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className={`h-3 ${group.subject === 'CSE' ? 'bg-blue-500' :
                        group.subject === 'EEE' ? 'bg-yellow-500' :
                            group.subject === 'Math' ? 'bg-purple-500' :
                                group.subject === 'Physics' ? 'bg-green-500' :
                                    group.subject === 'Chemistry' ? 'bg-red-500' :
                                        'bg-gray-500'
                        }`}></div>

                    <div className="p-8">
                        {/* Title & Actions */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${group.subject === 'CSE' ? 'bg-blue-100 text-blue-700' :
                                        group.subject === 'EEE' ? 'bg-yellow-100 text-yellow-700' :
                                            group.subject === 'Math' ? 'bg-purple-100 text-purple-700' :
                                                group.subject === 'Physics' ? 'bg-green-100 text-green-700' :
                                                    group.subject === 'Chemistry' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                        }`}>
                                        {group.subject}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${group.meetingType === 'online' ? 'bg-blue-50 text-blue-600' :
                                        group.meetingType === 'in-person' ? 'bg-green-50 text-green-600' :
                                            'bg-purple-50 text-purple-600'
                                        }`}>
                                        {group.meetingType === 'online' ? '💻 Online' :
                                            group.meetingType === 'in-person' ? '🏫 In-Person' :
                                                '🔄 Hybrid'}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.title}</h1>
                                <p className="text-xl text-indigo-600 font-semibold">{group.course}</p>
                            </div>

                            {user && (
                                <div className="flex gap-2">
                                    {isCreator ? (
                                        <button
                                            onClick={handleDelete}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                                        >
                                            Delete Group
                                        </button>
                                    ) : isMember ? (
                                        <button
                                            onClick={handleLeave}
                                            className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                                        >
                                            Leave Group
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleJoin}
                                            disabled={isFull}
                                            className={`px-6 py-2 rounded-lg font-semibold transition ${isFull
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                }`}
                                        >
                                            {isFull ? 'Group Full' : 'Join Group'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
                            <p className="text-gray-700 leading-relaxed">{group.description}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {group.schedule && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm text-gray-600 mb-1">Schedule</div>
                                    <div className="font-semibold text-gray-900">{group.schedule}</div>
                                </div>
                            )}

                            {group.location && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm text-gray-600 mb-1">Location</div>
                                    <div className="font-semibold text-gray-900">{group.location}</div>
                                </div>
                            )}

                            {group.meetingLink && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm text-gray-600 mb-1">Meeting Link</div>
                                    <a href={group.meetingLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:text-indigo-700 truncate block">
                                        Join Online
                                    </a>
                                </div>
                            )}

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm text-gray-600 mb-1">Members</div>
                                <div className="font-semibold text-gray-900">
                                    {group.members.length} {group.maxMembers > 0 ? `/ ${group.maxMembers}` : ''}
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        {group.tags && group.tags.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">Tags</h2>
                                <div className="flex flex-wrap gap-2">
                                    {group.tags.map((tag, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Members */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Members ({group.members.length})</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {group.members.map(member => (
                                    <Link
                                        key={member._id}
                                        to={`/profile/${member._id}`}
                                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                                    >
                                        <UserAvatar user={member} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{member.name}</p>
                                            {member._id === group.creator._id && (
                                                <span className="text-xs text-indigo-600">Creator</span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Creator Info */}
                        <PosterInfo user={group.creator} createdAt={group.createdAt} />
                    </div>
                </div>

                {/* Comments Section */}
                <div className="mt-6">
                    <CommentsSection postType="studygroup" postId={id} />
                </div>
            </div>
        </div>
    );
};

export default StudyGroupDetails;
