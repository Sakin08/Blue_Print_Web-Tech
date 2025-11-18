import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import UserAvatar from '../components/UserAvatar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const StudyGroups = () => {
    const { user } = useAuth();
    const [groups, setGroups] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        subject: 'all',
        meetingType: 'all',
        search: ''
    });

    useEffect(() => {
        loadGroups();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, groups]);

    const loadGroups = async () => {
        try {
            const res = await axios.get(`${API_URL}/study-groups`);
            setGroups(res.data);
            setFilteredGroups(res.data);
        } catch (err) {
            console.error('Failed to load study groups:', err);
        }
        setLoading(false);
    };

    const applyFilters = () => {
        let filtered = [...groups];

        if (filters.subject !== 'all') {
            filtered = filtered.filter(g => g.subject === filters.subject);
        }

        if (filters.meetingType !== 'all') {
            filtered = filtered.filter(g => g.meetingType === filters.meetingType);
        }

        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(g =>
                g.title.toLowerCase().includes(search) ||
                g.course.toLowerCase().includes(search) ||
                g.description.toLowerCase().includes(search)
            );
        }

        setFilteredGroups(filtered);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-4xl">📚</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Study Groups</h1>
                    <p className="text-gray-600 text-lg">Find study partners and collaborate on courses</p>
                </div>

                {/* Create Button */}
                {user && (
                    <div className="flex justify-center mb-8">
                        <Link
                            to="/study-groups/create"
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
                        >
                            + Create Study Group
                        </Link>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                placeholder="Search groups..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                            <select
                                value={filters.subject}
                                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Subjects</option>
                                <option value="CSE">CSE</option>
                                <option value="EEE">EEE</option>
                                <option value="Math">Math</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="English">English</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Type</label>
                            <select
                                value={filters.meetingType}
                                onChange={(e) => setFilters({ ...filters, meetingType: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Types</option>
                                <option value="online">💻 Online</option>
                                <option value="in-person">🏫 In-Person</option>
                                <option value="hybrid">🔄 Hybrid</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        Showing {filteredGroups.length} of {groups.length} study groups
                    </p>
                </div>

                {/* Groups Grid */}
                {filteredGroups.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No study groups found</h3>
                        <p className="text-gray-600 mb-6">Try adjusting your filters or create a new group</p>
                        {user && (
                            <Link
                                to="/study-groups/create"
                                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                            >
                                Create First Group
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGroups.map(group => (
                            <Link
                                key={group._id}
                                to={`/study-groups/${group._id}`}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
                            >
                                {/* Color Bar */}
                                <div className={`h-2 ${group.subject === 'CSE' ? 'bg-blue-500' :
                                    group.subject === 'EEE' ? 'bg-yellow-500' :
                                        group.subject === 'Math' ? 'bg-purple-500' :
                                            group.subject === 'Physics' ? 'bg-green-500' :
                                                group.subject === 'Chemistry' ? 'bg-red-500' :
                                                    'bg-gray-500'
                                    }`}></div>

                                <div className="p-6">
                                    {/* Badges */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${group.subject === 'CSE' ? 'bg-blue-100 text-blue-700' :
                                            group.subject === 'EEE' ? 'bg-yellow-100 text-yellow-700' :
                                                group.subject === 'Math' ? 'bg-purple-100 text-purple-700' :
                                                    group.subject === 'Physics' ? 'bg-green-100 text-green-700' :
                                                        group.subject === 'Chemistry' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                            }`}>
                                            {group.subject}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${group.meetingType === 'online' ? 'bg-blue-50 text-blue-600' :
                                            group.meetingType === 'in-person' ? 'bg-green-50 text-green-600' :
                                                'bg-purple-50 text-purple-600'
                                            }`}>
                                            {group.meetingType === 'online' ? '💻' :
                                                group.meetingType === 'in-person' ? '🏫' : '🔄'}
                                        </span>
                                    </div>

                                    {/* Title & Course */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
                                        {group.title}
                                    </h3>
                                    <p className="text-indigo-600 font-semibold mb-3">{group.course}</p>

                                    {/* Description */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {group.description}
                                    </p>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <UserAvatar user={group.creator} size="xs" />
                                            <span className="text-sm text-gray-600">{group.creator.name}</span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            👥 {group.members.length}
                                            {group.maxMembers > 0 && ` / ${group.maxMembers}`}
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {group.tags && group.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {group.tags.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyGroups;

