import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    Users, CheckCircle, XCircle, Clock, Store, ShoppingBag,
    Search, BarChart3, Trash2, AlertTriangle, Ban, Shield,
    TrendingUp, Package, Home as HouseIcon, Calendar, Briefcase,
    BookOpen, MapPin, FileText, Bell
} from 'lucide-react';

const AdminPanel = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [orders, setOrders] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [notificationForm, setNotificationForm] = useState({
        title: '',
        message: '',
        type: 'admin_info',
        targetRole: 'all'
    });
    const [editingRoleUserId, setEditingRoleUserId] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        loadData();
    }, [user, navigate]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsRes, pendingRes, usersRes, restaurantsRes, ordersRes, reportsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users/pending'),
                api.get('/admin/users'),
                api.get('/admin/restaurants'),
                api.get('/admin/orders'),
                api.get('/admin/reports')
            ]);

            setStats(statsRes.data);
            setPendingUsers(pendingRes.data);
            setAllUsers(usersRes.data);
            setRestaurants(restaurantsRes.data);
            setOrders(ordersRes.data);
            setReports(reportsRes.data);
        } catch (error) {
            console.error('Failed to load admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        if (!confirm('Approve this user?')) return;
        try {
            await api.post(`/admin/users/${userId}/approve`);
            loadData();
        } catch (error) {
            alert('Failed to approve user');
        }
    };

    const handleReject = async (userId) => {
        if (!confirm('Reject and delete this user?')) return;
        try {
            await api.delete(`/admin/users/${userId}/reject`);
            loadData();
        } catch (error) {
            alert('Failed to reject user');
        }
    };

    const handleDeleteUser = async (userId) => {
        const confirmation = prompt('Type "DELETE" to confirm permanent deletion:');
        if (confirmation !== 'DELETE') {
            alert('Deletion cancelled');
            return;
        }
        try {
            await api.delete(`/admin/users/${userId}`);
            alert('User deleted successfully');
            loadData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleUpdateUserRole = async (userId, newRole) => {
        if (!confirm(`Change user role to ${newRole}?`)) {
            setEditingRoleUserId(null);
            return;
        }

        try {
            await api.patch(`/admin/users/${userId}/role`, { role: newRole });
            alert('User role updated successfully');
            setEditingRoleUserId(null);
            loadData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update user role');
            setEditingRoleUserId(null);
        }
    };

    const handleSendBulkNotification = async (e) => {
        e.preventDefault();
        if (!confirm(`Send notification to ${notificationForm.targetRole === 'all' ? 'all users' : notificationForm.targetRole + 's'}?`)) return;
        try {
            const res = await api.post('/admin/notifications/bulk', notificationForm);
            alert(res.data.message);
            setNotificationForm({ title: '', message: '', type: 'admin_info', targetRole: 'all' });
        } catch (error) {
            alert('Failed to send notification');
        }
    };

    const handleBanUser = async (userId) => {
        const reason = prompt('Enter ban reason:');
        if (!reason) return;
        try {
            await api.post(`/admin/users/${userId}/ban`, { banReason: reason });
            loadData();
        } catch (error) {
            alert('Failed to ban user');
        }
    };

    const handleUnbanUser = async (userId) => {
        if (!confirm('Unban this user?')) return;
        try {
            await api.post(`/admin/users/${userId}/unban`);
            loadData();
        } catch (error) {
            alert('Failed to unban user');
        }
    };

    const handleToggleRestaurant = async (restaurantId) => {
        try {
            await api.patch(`/admin/restaurants/${restaurantId}/toggle-status`);
            loadData();
        } catch (error) {
            alert('Failed to update restaurant');
        }
    };

    const handleDeleteRestaurant = async (restaurantId) => {
        if (!confirm('Delete this restaurant?')) return;
        try {
            await api.delete(`/admin/restaurants/${restaurantId}`);
            loadData();
        } catch (error) {
            alert('Failed to delete restaurant');
        }
    };

    const handleUpdateReport = async (reportId, status) => {
        const adminNotes = status === 'resolved' ? prompt('Enter resolution notes (optional):') : '';
        try {
            await api.patch(`/admin/reports/${reportId}/status`, { status, adminNotes });
            loadData();
        } catch (error) {
            alert('Failed to update report');
        }
    };

    const filteredUsers = allUsers.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = !filterRole || u.role === filterRole;
        const matchesStatus = !filterStatus ||
            (filterStatus === 'approved' && u.isApproved) ||
            (filterStatus === 'pending' && !u.isApproved) ||
            (filterStatus === 'banned' && u.isBanned);
        return matchesSearch && matchesRole && matchesStatus;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-10 h-10 text-indigo-600" />
                        <h1 className="text-4xl font-bold text-gray-900">Admin Panel</h1>
                    </div>
                    <p className="text-gray-600">Manage users, content, and system settings</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-md mb-6">
                    <div className="border-b border-gray-200">
                        <div className="flex overflow-x-auto">
                            {[
                                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                                { id: 'pending', label: `Pending (${pendingUsers.length})`, icon: Clock },
                                { id: 'users', label: 'All Users', icon: Users },
                                { id: 'reports', label: `Reports (${reports.filter(r => r.status === 'pending').length})`, icon: AlertTriangle },
                                { id: 'restaurants', label: 'Restaurants', icon: Store },
                                { id: 'orders', label: 'Orders', icon: ShoppingBag },
                                { id: 'notifications', label: 'Send Notification', icon: Bell }
                            ].map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-4 font-semibold transition whitespace-nowrap ${activeTab === tab.id
                                            ? 'border-b-2 border-indigo-600 text-indigo-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && stats && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>

                            {/* Main Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                                    <Users className="w-10 h-10 mb-3 opacity-80" />
                                    <p className="text-3xl font-bold mb-1">{stats.totalUsers}</p>
                                    <p className="text-blue-100">Total Users</p>
                                </div>
                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                                    <Clock className="w-10 h-10 mb-3 opacity-80" />
                                    <p className="text-3xl font-bold mb-1">{stats.pendingUsers}</p>
                                    <p className="text-orange-100">Pending Approval</p>
                                </div>
                                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
                                    <AlertTriangle className="w-10 h-10 mb-3 opacity-80" />
                                    <p className="text-3xl font-bold mb-1">{stats.pendingReports}</p>
                                    <p className="text-red-100">Pending Reports</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                                    <Ban className="w-10 h-10 mb-3 opacity-80" />
                                    <p className="text-3xl font-bold mb-1">{stats.bannedUsers}</p>
                                    <p className="text-purple-100">Banned Users</p>
                                </div>
                            </div>

                            {/* Secondary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white border-2 border-green-200 rounded-xl p-6">
                                    <Store className="w-8 h-8 text-green-600 mb-3" />
                                    <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalRestaurants}</p>
                                    <p className="text-gray-600 text-sm">Restaurants</p>
                                </div>
                                <div className="bg-white border-2 border-indigo-200 rounded-xl p-6">
                                    <ShoppingBag className="w-8 h-8 text-indigo-600 mb-3" />
                                    <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalOrders}</p>
                                    <p className="text-gray-600 text-sm">Food Orders</p>
                                </div>
                                <div className="bg-white border-2 border-yellow-200 rounded-xl p-6">
                                    <FileText className="w-8 h-8 text-yellow-600 mb-3" />
                                    <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalReports}</p>
                                    <p className="text-gray-600 text-sm">Total Reports</p>
                                </div>
                                <div className="bg-white border-2 border-pink-200 rounded-xl p-6">
                                    <TrendingUp className="w-8 h-8 text-pink-600 mb-3" />
                                    <p className="text-2xl font-bold text-gray-900 mb-1">
                                        {stats.usersByRole.students + stats.usersByRole.teachers + stats.usersByRole.staff}
                                    </p>
                                    <p className="text-gray-600 text-sm">Active Members</p>
                                </div>
                            </div>

                            {/* User Roles & Content Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white border rounded-xl p-6">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-indigo-600" />
                                        Users by Role
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Students</span>
                                            <span className="font-bold text-blue-600 text-lg">{stats.usersByRole.students}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Teachers</span>
                                            <span className="font-bold text-green-600 text-lg">{stats.usersByRole.teachers}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Staff</span>
                                            <span className="font-bold text-yellow-600 text-lg">{stats.usersByRole.staff}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border rounded-xl p-6">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-indigo-600" />
                                        Content Statistics
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <ShoppingBag className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-600">Marketplace</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{stats.contentStats.buySell}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <HouseIcon className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-600">Housing</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{stats.contentStats.housing}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-600">Events</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{stats.contentStats.events}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-600">Jobs</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{stats.contentStats.jobs}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-600">Study Groups</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{stats.contentStats.studyGroups}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-600">Lost & Found</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{stats.contentStats.lostFound}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending Users Tab */}
                    {activeTab === 'pending' && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending User Approvals</h2>
                            {pendingUsers.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-xl font-semibold text-gray-900">All Clear!</p>
                                    <p className="text-gray-600 mt-2">No pending user approvals</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Reg. Number</th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingUsers.map(u => (
                                                <tr key={u._id} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        <button
                                                            onClick={() => navigate(`/profile/${u._id}`)}
                                                            className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline text-left"
                                                        >
                                                            {u.name}
                                                        </button>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">{u.email}</td>
                                                    <td className="py-3 px-4">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium capitalize">
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm">{u.department}</td>
                                                    <td className="py-3 px-4 text-sm font-mono">{u.registrationNumber}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => handleApprove(u._id)}
                                                                className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 text-sm font-medium transition"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(u._id)}
                                                                className="bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 text-sm font-medium transition"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* All Users Tab */}
                    {activeTab === 'users' && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>

                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">All Roles</option>
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="other">Other</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">All Status</option>
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending</option>
                                    <option value="banned">Banned</option>
                                </select>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(u => (
                                            <tr key={u._id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => navigate(`/profile/${u._id}`)}
                                                        className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline text-left"
                                                    >
                                                        {u.name}
                                                    </button>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">{u.email}</td>
                                                <td className="py-3 px-4">
                                                    {editingRoleUserId === u._id && !u.isSystemAdmin ? (
                                                        <select
                                                            value={u.role}
                                                            onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                                                            onBlur={() => setEditingRoleUserId(null)}
                                                            autoFocus
                                                            className="px-2 py-1 border border-indigo-300 rounded text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                                        >
                                                            <option value="student">🎓 Student</option>
                                                            <option value="teacher">👨‍🏫 Teacher</option>
                                                            <option value="other">👤 Other</option>
                                                            <option value="admin">🛡️ Admin</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${u.isSystemAdmin ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 font-bold' :
                                                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                                u.role === 'teacher' ? 'bg-green-100 text-green-700' :
                                                                    u.role === 'other' ? 'bg-gray-100 text-gray-700' :
                                                                        'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {u.isSystemAdmin ? '👑 System Admin' : u.role}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {u.isBanned ? (
                                                        <span className="text-red-600 text-sm font-medium flex items-center gap-1">
                                                            <Ban className="w-4 h-4" /> Banned
                                                        </span>
                                                    ) : u.isApproved ? (
                                                        <span className="text-green-600 text-sm flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4" /> Approved
                                                        </span>
                                                    ) : (
                                                        <span className="text-orange-600 text-sm flex items-center gap-1">
                                                            <Clock className="w-4 h-4" /> Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2 justify-end">
                                                        {u.isSystemAdmin ? (
                                                            <span className="text-purple-600 text-sm font-semibold flex items-center gap-1">
                                                                <Shield className="w-4 h-4" /> System Admin (Protected)
                                                            </span>
                                                        ) : u._id === user._id ? (
                                                            <span className="text-gray-500 text-sm italic">You (Current Admin)</span>
                                                        ) : (
                                                            <>
                                                                {u.isBanned ? (
                                                                    <button
                                                                        onClick={() => handleUnbanUser(u._id)}
                                                                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                                    >
                                                                        Unban
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleBanUser(u._id)}
                                                                        className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                                                                    >
                                                                        Ban
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => setEditingRoleUserId(u._id)}
                                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                                >
                                                                    Change Role
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteUser(u._id)}
                                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-sm text-gray-500 mt-4">Showing {filteredUsers.length} of {allUsers.length} users</p>
                        </div>
                    )}

                    {/* Reports Tab */}
                    {activeTab === 'reports' && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports Management</h2>
                            {reports.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-xl font-semibold text-gray-900">No Reports</p>
                                    <p className="text-gray-600 mt-2">All clear! No reports to review</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reports.map(report => (
                                        <div key={report._id} className="bg-white border rounded-xl p-6 hover:shadow-md transition">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${report.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                            report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                                report.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {report.status.toUpperCase()}
                                                        </span>
                                                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                                            {report.reason.toUpperCase()}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(report.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-900 font-medium mb-2">
                                                        Reported {report.itemType}: {report.reportedUser?.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-gray-600 text-sm mb-2">{report.description}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Reporter: {report.reporter?.name} ({report.reporter?.email})
                                                    </p>
                                                    {report.adminNotes && (
                                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                            <p className="text-sm text-blue-900">
                                                                <span className="font-semibold">Admin Notes:</span> {report.adminNotes}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {report.status === 'pending' && (
                                                <div className="flex gap-2 pt-4 border-t">
                                                    <button
                                                        onClick={() => handleUpdateReport(report._id, 'reviewed')}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                                    >
                                                        Mark Reviewed
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateReport(report._id, 'resolved')}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                                    >
                                                        Resolve
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateReport(report._id, 'dismissed')}
                                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                                                    >
                                                        Dismiss
                                                    </button>
                                                    {report.reportedUser && (
                                                        <button
                                                            onClick={() => handleBanUser(report.reportedUser._id)}
                                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium ml-auto"
                                                        >
                                                            Ban User
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Restaurants Tab */}
                    {activeTab === 'restaurants' && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Restaurant Management</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Restaurant</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Owner</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {restaurants.map(r => (
                                            <tr key={r._id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium">{r.name}</td>
                                                <td className="py-3 px-4 text-sm">{r.owner?.name}</td>
                                                <td className="py-3 px-4 text-sm">{r.location}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {r.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => handleToggleRestaurant(r._id)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                        >
                                                            {r.isActive ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRestaurant(r._id)}
                                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Order #</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Restaurant</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order._id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4 font-mono text-sm">{order.orderNumber}</td>
                                                <td className="py-3 px-4 text-sm">{order.customer?.name}</td>
                                                <td className="py-3 px-4 text-sm">{order.restaurant?.name}</td>
                                                <td className="py-3 px-4 font-semibold">৳{order.total}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                            order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Bulk Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Bulk Notification</h2>
                            <div className="max-w-2xl">
                                <form onSubmit={handleSendBulkNotification} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience *</label>
                                        <select
                                            value={notificationForm.targetRole}
                                            onChange={(e) => setNotificationForm({ ...notificationForm, targetRole: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="all">All Users</option>
                                            <option value="student">Students Only</option>
                                            <option value="teacher">Teachers Only</option>
                                            <option value="staff">Staff Only</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type *</label>
                                        <select
                                            value={notificationForm.type}
                                            onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="admin_info">Info</option>
                                            <option value="admin_warning">Warning</option>
                                            <option value="admin_announcement">Announcement</option>
                                            <option value="system_alert">System Alert</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                                        <input
                                            type="text"
                                            value={notificationForm.title}
                                            onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g., System Maintenance Notice"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                                        <textarea
                                            value={notificationForm.message}
                                            onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            rows="5"
                                            placeholder="Enter your notification message..."
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold">
                                            Send Notification
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNotificationForm({ title: '', message: '', type: 'admin_info', targetRole: 'all' })}
                                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                                        >
                                            Clear Form
                                        </button>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-900">
                                            <strong>Note:</strong> This will send a notification to all {notificationForm.targetRole === 'all' ? 'approved users' : `approved ${notificationForm.targetRole}s`} in the system.
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default AdminPanel;
