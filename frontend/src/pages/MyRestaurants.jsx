import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Store, Plus, Settings, Eye, Trash2 } from 'lucide-react';

const MyRestaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMyRestaurants();
    }, []);

    const loadMyRestaurants = async () => {
        try {
            const res = await api.get('/restaurants/my-restaurants');
            setRestaurants(res.data || []);
        } catch (err) {
            console.error('Failed to load restaurants:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (restaurantId, restaurantName) => {
        if (!window.confirm(`Are you sure you want to delete "${restaurantName}"? This action cannot be undone.`)) {
            return;
        }
        try {
            await api.delete(`/restaurants/${restaurantId}`);
            setRestaurants(restaurants.filter(r => r._id !== restaurantId));
        } catch (err) {
            console.error('Failed to delete restaurant:', err);
            alert(err.response?.data?.message || 'Failed to delete restaurant. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Restaurants</h1>
                        <p className="text-gray-600">Manage your restaurants and menus</p>
                    </div>
                    <Link
                        to="/restaurants/create"
                        className="flex items-center gap-2 bg-orange-600 text-white px-5 py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Add Restaurant
                    </Link>
                </div>

                {restaurants.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Restaurants Yet</h2>
                        <p className="text-gray-600 mb-6">Create your first restaurant to start receiving orders</p>
                        <Link
                            to="/restaurants/create"
                            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            Create Restaurant
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurants.map(restaurant => (
                            <div key={restaurant._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                                {restaurant.coverImage ? (
                                    <img
                                        src={restaurant.coverImage}
                                        alt={restaurant.name}
                                        className="w-full h-48 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                                        <Store className="w-16 h-16 text-white opacity-50" />
                                    </div>
                                )}

                                <div className="p-5">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{restaurant.name}</h3>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{restaurant.description}</p>

                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                        <span>{restaurant.location}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${restaurant.isOpen
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {restaurant.isOpen ? 'Open' : 'Closed'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                                        <div>
                                            <p className="text-lg font-bold text-orange-600">{restaurant.totalOrders || 0}</p>
                                            <p className="text-xs text-gray-500">Orders</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-yellow-600">
                                                {restaurant.rating ? restaurant.rating.toFixed(1) : 'New'}
                                            </p>
                                            <p className="text-xs text-gray-500">Rating</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-blue-600">{restaurant.views || 0}</p>
                                            <p className="text-xs text-gray-500">Views</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/my-restaurant/${restaurant._id}`}
                                            className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-medium"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Manage
                                        </Link>
                                        <Link
                                            to={`/restaurants/${restaurant._id}`}
                                            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(restaurant._id, restaurant.name)}
                                            className="flex items-center justify-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition font-medium"
                                            title="Delete restaurant"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRestaurants;
