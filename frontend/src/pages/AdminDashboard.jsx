import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    Users, Shield, BarChart3, Settings, Bell,
    Calendar, Briefcase, Home as HouseIcon, ShoppingBag,
    BookOpen, MapPin, MessageSquare, Heart, Star,
    FileText, Package, TrendingUp, Activity
} from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        loadStats();
    }, [user, navigate]);

    const loadStats = async () => {
        try {
            const res = await api.get('/admin/stats/enhanced');
            setStats(res.data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const managementSections = [
        { title: 'User Management', icon: Users, path: '/admin', tab: 'users', color: 'blue', count: stats?.totalUsers },
        { title: 'Pending Approvals', icon: Shield, path: '/admin', tab: 'pending', color: 'orange', count: stats?.pendingUsers },
        { title: 'Events', icon: Calendar, path: '/admin/content/events', color: 'purple', count: stats?.contentStats?.events },
        { title: 'Jobs', icon: Briefcase, path: '/admin/content/jobs', color: 'green', count: stats?.contentStats?.jobs },
        { title: 'Housing', icon: HouseIcon, path: '/admin/content/housing', color: 'yellow', count: stats?.contentStats?.housing },
        { title: 'Marketplace', icon: ShoppingBag, path: '/admin/content/marketplace', color: 'pink', count: stats?.contentStats?.buySell },
        { title: 'Study Groups', icon: BookOpen, path: '/admin/content/study-groups', color: 'indigo', count: stats?.contentStats?.studyGroups },
        { title: 'Lost & Found', icon: MapPin, path: '/admin/content/lost-found', color: 'red', count: stats?.contentStats?.lostFound },
        { title: 'Posts', icon: FileText, path: '/admin/content/posts', color: 'teal', count: stats?.contentStats?.posts },
        { title: 'Restaurants', icon: Package, path: '/admin', tab: 'restaurants', color: 'orange', count: stats?.restaurantStats?.totalRestaurants },
        { title: 'Blood Donation', icon: Heart, path: '/admin/content/blood-donors', color: 'red', count: stats?.bloodDonationStats?.totalDonors },
        { title: 'Reports', icon: Bell, path: '/admin', tab: 'reports', color: 'red', count: stats?.moderationStats?.pendingReports },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="w-12 h-12 text-indigo-600" />
                                <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                            </div>
                            <p className="text-gray-600">Complete system management and control</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin')}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                        >
                            Full Admin Panel
                        </button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                        <Users className="w-10 h-10 mb-3 opacity-80" />
                        <p className="text-3xl font-bold mb-1">{stats?.totalUsers || 0}</p>
                        <p className="text-blue-100">Total Users</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                        <Activity className="w-10 h-10 mb-3 opacity-80" />
                        <p className="text-3xl font-bold mb-1">{stats?.pendingUsers || 0}</p>
                        <p className="text-orange-100">Pending Approval</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                        <Bell className="w-10 h-10 mb-3 opacity-80" />
                        <p className="text-3xl font-bold mb-1">{stats?.moderationStats?.pendingReports || 0}</p>
                        <p className="text-red-100">Pending Reports</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                        <TrendingUp className="w-10 h-10 mb-3 opacity-80" />
                        <p className="text-3xl font-bold mb-1">{stats?.bannedUsers || 0}</p>
                        <p className="text-purple-100">Banned Users</p>
                    </div>
                </div>

                {/* Management Sections */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-indigo-600" />
                        Management Sections
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {managementSections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.path}
                                    onClick={() => navigate(section.path)}
                                    className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-500 hover:shadow-lg transition group"
                                >
                                    <Icon className={`w-8 h-8 text-${section.color}-600 mb-3 group-hover:scale-110 transition`} />
                                    <h3 className="font-bold text-gray-900 mb-1">{section.title}</h3>
                                    <p className="text-2xl font-bold text-indigo-600">{section.count || 0}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-600" />
                            Users by Role
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Students</span>
                                <span className="font-bold text-blue-600 text-lg">{stats?.usersByRole?.students || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Teachers</span>
                                <span className="font-bold text-green-600 text-lg">{stats?.usersByRole?.teachers || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Staff</span>
                                <span className="font-bold text-yellow-600 text-lg">{stats?.usersByRole?.staff || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-indigo-600" />
                            Restaurant Stats
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Restaurants</span>
                                <span className="font-bold text-gray-900">{stats?.restaurantStats?.totalRestaurants || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Menu Items</span>
                                <span className="font-bold text-gray-900">{stats?.restaurantStats?.totalMenuItems || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Reviews</span>
                                <span className="font-bold text-gray-900">{stats?.restaurantStats?.totalReviews || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                            Engagement Stats
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Comments</span>
                                <span className="font-bold text-gray-900">{stats?.engagementStats?.totalComments || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Messages</span>
                                <span className="font-bold text-gray-900">{stats?.engagementStats?.totalMessages || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">RSVPs</span>
                                <span className="font-bold text-gray-900">{stats?.engagementStats?.totalRSVPs || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
