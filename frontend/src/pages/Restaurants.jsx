import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { canDelete } from '../utils/permissions';
import {
    PlusCircle, Search, Filter, X, MapPin, Clock, Star,
    Utensils, Coffee, Store, ShoppingBag, Trash2
} from 'lucide-react';

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [shopTypeFilter, setShopTypeFilter] = useState('all');
    const [isOpenFilter, setIsOpenFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadRestaurants();
    }, []);

    const loadRestaurants = async () => {
        try {
            setLoading(true);
            const res = await api.get('/restaurants');
            setRestaurants(res.data || []);
            setError(null);
        } catch (err) {
            console.error('Failed to load restaurants:', err);
            setError('Failed to load restaurants. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (restaurantId, restaurantName, e) => {
        e.preventDefault();
        e.stopPropagation();
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

    // Apply filters
    const displayRestaurants = restaurants
        .filter(restaurant => {
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                return (
                    restaurant.name?.toLowerCase().includes(search) ||
                    restaurant.location?.toLowerCase().includes(search) ||
                    restaurant.description?.toLowerCase().includes(search)
                );
            }
            return true;
        })
        .filter(restaurant => {
            if (shopTypeFilter !== 'all') {
                return restaurant.shopType === shopTypeFilter;
            }
            return true;
        })
        .filter(restaurant => {
            if (isOpenFilter === 'open') return restaurant.isOpen;
            if (isOpenFilter === 'closed') return !restaurant.isOpen;
            return true;
        });

    const getShopIcon = (type) => {
        const icons = {
            restaurant: Utensils,
            canteen: Utensils,
            cafe: Coffee,
            'fast-food': ShoppingBag,
            bakery: Store,
            'juice-bar': Coffee
        };
        return icons[type] || Utensils;
    };

    const getShopColor = (type) => {
        const colors = {
            restaurant: 'bg-orange-100 text-orange-700',
            canteen: 'bg-blue-100 text-blue-700',
            cafe: 'bg-purple-100 text-purple-700',
            'fast-food': 'bg-red-100 text-red-700',
            bakery: 'bg-yellow-100 text-yellow-700',
            'juice-bar': 'bg-green-100 text-green-700'
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center p-8 bg-gray-50 rounded-xl shadow-lg">
                    <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-gray-700">Loading restaurants...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-10 mt-10 text-center bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md">
                <p className="text-xl font-semibold text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <header className="pb-6 border-b border-gray-200 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                                🍔 Campus Eats
                            </h1>
                            <p className="text-gray-600">Order food from your favorite campus restaurants</p>
                        </div>
                        {user && (
                            <Link
                                to="/restaurants/create"
                                className="flex items-center bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-700 transition shadow-lg transform hover:-translate-y-0.5 text-lg mt-3 sm:mt-0"
                            >
                                <PlusCircle className="w-5 h-5 mr-2" />
                                Add Restaurant
                            </Link>
                        )}
                    </div>
                </header>

                {/* Search and Filter Section */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search restaurants, location, or cuisine..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition ${showFilters
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Filter className="w-5 h-5 mr-2" />
                            Filters
                        </button>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Shop Type
                                </label>
                                <select
                                    value={shopTypeFilter}
                                    onChange={(e) => setShopTypeFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="all">All Types</option>
                                    <option value="restaurant">Restaurant</option>
                                    <option value="canteen">Canteen</option>
                                    <option value="cafe">Café</option>
                                    <option value="fast-food">Fast Food</option>
                                    <option value="bakery">Bakery</option>
                                    <option value="juice-bar">Juice Bar</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={isOpenFilter}
                                    onChange={(e) => setIsOpenFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="all">All</option>
                                    <option value="open">Open Now</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Active Filters */}
                    {(searchTerm || shopTypeFilter !== 'all' || isOpenFilter !== 'all') && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                            <span className="text-sm font-medium text-gray-600">Active Filters:</span>
                            {searchTerm && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                                    Search: {searchTerm}
                                    <X className="w-4 h-4 ml-2 cursor-pointer" onClick={() => setSearchTerm('')} />
                                </span>
                            )}
                            {shopTypeFilter !== 'all' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                                    {shopTypeFilter}
                                    <X className="w-4 h-4 ml-2 cursor-pointer" onClick={() => setShopTypeFilter('all')} />
                                </span>
                            )}
                            {isOpenFilter !== 'all' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                                    {isOpenFilter}
                                    <X className="w-4 h-4 ml-2 cursor-pointer" onClick={() => setIsOpenFilter('all')} />
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setShopTypeFilter('all');
                                    setIsOpenFilter('all');
                                }}
                                className="text-sm text-red-600 hover:text-red-800 font-medium"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="mb-6 text-lg font-medium text-gray-700">
                    Found <span className="font-bold text-orange-600">{displayRestaurants.length}</span> {displayRestaurants.length === 1 ? 'restaurant' : 'restaurants'}.
                </div>

                {/* Restaurant Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayRestaurants.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 shadow-md">
                            <Utensils className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                            <p className="text-xl font-semibold text-gray-700">No restaurants found.</p>
                            <p className="text-gray-500 mt-2">Be the first to add a restaurant!</p>
                        </div>
                    ) : (
                        displayRestaurants.map(restaurant => {
                            const ShopIcon = getShopIcon(restaurant.shopType);
                            const showDelete = canDelete(user, restaurant.owner);
                            return (
                                <div key={restaurant._id} className="relative">
                                    <Link
                                        to={`/restaurants/${restaurant._id}`}
                                        className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                                    >
                                        {/* Cover Image */}
                                        {restaurant.coverImage ? (
                                            <div className="h-48 overflow-hidden">
                                                <img
                                                    src={restaurant.coverImage}
                                                    alt={restaurant.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                                                <ShopIcon className="w-20 h-20 text-white opacity-50" />
                                            </div>
                                        )}

                                        <div className="p-5">
                                            {/* Shop Type Badge & Status */}
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getShopColor(restaurant.shopType)}`}>
                                                    <ShopIcon className="w-3 h-3 mr-1" />
                                                    {restaurant.shopType.replace('-', ' ').toUpperCase()}
                                                </span>
                                                {restaurant.isOpen ? (
                                                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                        ● OPEN
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                                        ● CLOSED
                                                    </span>
                                                )}
                                            </div>

                                            {/* Restaurant Name */}
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition">
                                                {restaurant.name}
                                            </h3>

                                            {/* Description */}
                                            {restaurant.description && (
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {restaurant.description}
                                                </p>
                                            )}

                                            {/* Location */}
                                            <div className="flex items-center text-gray-600 text-sm mb-2">
                                                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                                <span className="truncate">{restaurant.location}</span>
                                            </div>

                                            {/* Timing */}
                                            {restaurant.openingTime && restaurant.closingTime && (
                                                <div className="flex items-center text-gray-600 text-sm mb-3">
                                                    <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                                                    {restaurant.openingTime} - {restaurant.closingTime}
                                                </div>
                                            )}

                                            {/* Stats */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                                <div className="flex items-center">
                                                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {restaurant.rating ? restaurant.rating.toFixed(1) : 'New'}
                                                    </span>
                                                    {restaurant.totalReviews > 0 && (
                                                        <span className="text-xs text-gray-500 ml-1">
                                                            ({restaurant.totalReviews})
                                                        </span>
                                                    )}
                                                </div>
                                                {restaurant.deliveryFee !== undefined && (
                                                    <span className="text-sm font-semibold text-orange-600">
                                                        ৳{restaurant.deliveryFee} delivery
                                                    </span>
                                                )}
                                            </div>

                                            {/* Delivery Info */}
                                            {restaurant.deliveryAvailable && restaurant.estimatedDeliveryTime && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    🚚 {restaurant.estimatedDeliveryTime}
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Delete Button for Admin/Owner */}
                                    {showDelete && (
                                        <button
                                            onClick={(e) => handleDelete(restaurant._id, restaurant.name, e)}
                                            className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-all duration-200"
                                            title="Delete restaurant"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Restaurants;
