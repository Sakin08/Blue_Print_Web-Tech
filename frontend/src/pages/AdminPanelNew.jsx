import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    Users, CheckCircle, XCircle, Clock, Store, ShoppingBag,
    Search, BarChart3, Eye, EyeOff, Trash2
} from 'lucide-react';

const AdminPanel = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');

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
            const [statsRes, pendingRes, usersRes, restaurantsRes, ordersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users/pending'),
                api.get('/admin/users'),
                api.get('/admin/restaurants'),
                api.get('/admin/orders')
            ]);

            setStats(statsRes.data);
            setPendingUsers(pendingRes.data);
            setAllUsers(usersRes.data);
            setRestaurants(restaurantsRes.data);
            setOrders(ordersRes.data);
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-7xl">

                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">🛡️ Admin Panel</h1>
                    <p className="text-gray-600">Manage users, restaurants, and system</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-md mb-6">
                    <div className="border-b border-gray-200">
                        <div className="flex overflow-x-auto">
                            {[
                                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                                { id: 'pending', label: `Pending (${pendingUsers.length})`, icon: Clock },
                                { id: 'users', label: 'All Users', icon: Users },
                                { id: 'restaurants', label: 'Restaurants', icon: Store },
                                { id: 'orders', label: 'Orders', icon: ShoppingBag }
                            ].map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-4 font-semibold transition whitespace-nowrap ${activeTab === tab.id
                                                ? 'border-b-2 border-blue-600 text-blue-600'
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                                    <Store className="w-10 h-10 mb-3 opacity-80" />
                                    <p className="text-3xl font-bold mb-1">{stats.totalRestaurants}</p>
                                    <p className="text-green-100">Restaurants</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                                    <ShoppingBag className="w-10 h-10 mb-3 opacity-80" />
                                    <p className="text-3xl font-bold mb-1">{stats.totalOrders}</p>
                                    <p className="text-purple-100">Total Orders</p>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white border rounded-xl p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Users by Role</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Students</span>
                                            <span className="font-bold text-blue-600">{stats.usersByRole.students}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Teachers</span>
                                            <span className="font-bold text-green-600">{stats.usersByRole.teachers}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Staff</span>
                                            <span className="font-bold text-yellow-600">{stats.usersByRole.staff}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending Users Tab */}
                    {activeTab === 'pending' && (
                        <div className="p-6">
                            {pendingUsers.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-xl font-semibold text-gray-900">No Pending Users</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 font-semibold">Name</th>
                                                <th className="text-left py-3 px-4 font-semibold">Email</th>
                                                <th className="text-left py-3 px-4 font-semibold">Role</th>
                                                <th className="text-left py-3 px-4 font-semibold">Department</th>
                                                <th className="text-right py-3 px-4 font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingUsers.map(u => (
                                                <tr key={u._id} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-4">{u.name}</td>
                                                    <td className="py-3 px-4 text-sm">{u.email}</td>
                                                    <td className="py-3 px-4">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm">{u.department}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => handleApprove(u._id)}
                                                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(u._id)}
                                                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
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
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-semibold">Name</th>
                                            <th className="text-left py-3 px-4 font-semibold">Email</th>
                                            <th className="text-left py-3 px-4 font-semibold">Role</th>
                                            <th className="text-left py-3 px-4 font-semibold">Status</th>
                                            <th className="text-right py-3 px-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allUsers.filter(u =>
                                            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            u.email.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(u => (
                                            <tr key={u._id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">{u.name}</td>
                                                <td className="py-3 px-4 text-sm">{u.email}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                            u.role === 'teacher' ? 'bg-green-100 text-green-700' :
                                                                'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {u.isApproved ? (
                                                        <span className="text-green-600 text-sm">✓ Approved</span>
                                                    ) : (
                                                        <span className="text-orange-600 text-sm">⏳ Pending</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {u.role !== 'admin' && (
                                                        <button
                                                            onClick={() => handleReject(u._id)}
                                                            className="text-red-600 hover:text-red-800 text-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Restaurants Tab */}
                    {activeTab === 'restaurants' && (
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-semibold">Restaurant</th>
                                            <th className="text-left py-3 px-4 font-semibold">Owner</th>
                                            <th className="text-left py-3 px-4 font-semibold">Location</th>
                                            <th className="text-left py-3 px-4 font-semibold">Status</th>
                                            <th className="text-right py-3 px-4 font-semibold">Actions</th>
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
                                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                                        >
                                                            {r.isActive ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRestaurant(r._id)}
                                                            className="text-red-600 hover:text-red-800 text-sm"
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
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-semibold">Order #</th>
                                            <th className="text-left py-3 px-4 font-semibold">Customer</th>
                                            <th className="text-left py-3 px-4 font-semibold">Restaurant</th>
                                            <th className="text-left py-3 px-4 font-semibold">Total</th>
                                            <th className="text-left py-3 px-4 font-semibold">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold">Date</th>
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
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
