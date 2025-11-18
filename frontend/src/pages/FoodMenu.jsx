import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Search, MapPin, Phone, Calendar, Utensils, Clock, Trash2 } from 'lucide-react';
import { canDelete } from '../utils/permissions';

const FoodMenu = () => {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        loadMenus();
    }, []);

    const loadMenus = async () => {
        try {
            setLoading(true);
            const res = await api.get('/quick-menu');
            setMenus(res.data || []);
        } catch (err) {
            console.error('Failed to load menus:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (menuId, restaurantName) => {
        if (!window.confirm(`Delete menu post from "${restaurantName}"?`)) return;

        try {
            await api.delete(`/quick-menu/${menuId}`);
            setMenus(menus.filter(m => m._id !== menuId));
        } catch (err) {
            console.error('Failed to delete menu:', err);
            alert('Failed to delete menu post');
        }
    };

    const filteredMenus = menus.filter(menu => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            menu.restaurantName?.toLowerCase().includes(search) ||
            menu.location?.toLowerCase().includes(search) ||
            menu.menuItems?.toLowerCase().includes(search) ||
            menu.mealType?.toLowerCase().includes(search)
        );
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading menus...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-10">
            <div className="container mx-auto px-4">

                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                            🍽️ Today's Menu
                        </h1>
                        <p className="text-gray-600">See what's cooking around campus</p>
                    </div>
                    {user && (
                        <Link
                            to="/quick-menu/post"
                            className="flex items-center bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-700 transition shadow-lg transform hover:-translate-y-0.5 mt-3 sm:mt-0"
                        >
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Post Menu
                        </Link>
                    )}
                </header>

                {/* Search */}
                <div className="mb-8">
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by restaurant, location, or food items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                        />
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6 text-center">
                    <p className="text-lg text-gray-700">
                        Found <span className="font-bold text-orange-600">{filteredMenus.length}</span> menu{filteredMenus.length !== 1 ? 's' : ''} available
                    </p>
                </div>

                {/* Menu Grid */}
                {filteredMenus.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 shadow-md">
                        <Utensils className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl font-semibold text-gray-700 mb-2">No menus posted yet</p>
                        <p className="text-gray-500">Be the first to share today's menu!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMenus.map(menu => {
                            const showDelete = canDelete(user, menu.postedBy);
                            return (
                                <div key={menu._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                                    {/* Menu Images */}
                                    {menu.images && menu.images.length > 0 ? (
                                        <div className="relative">
                                            {menu.images.length === 1 ? (
                                                <div className="h-48 overflow-hidden relative">
                                                    <img
                                                        src={menu.images[0]}
                                                        alt={menu.restaurantName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-1 h-48">
                                                    {menu.images.slice(0, 4).map((image, idx) => (
                                                        <div key={idx} className="relative overflow-hidden">
                                                            <img
                                                                src={image}
                                                                alt={`${menu.restaurantName} ${idx + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            {idx === 3 && menu.images.length > 4 && (
                                                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                                                    <span className="text-white text-xl font-bold">
                                                                        +{menu.images.length - 4}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {/* Date Badge */}
                                            <div className="absolute top-3 right-3 bg-white bg-opacity-95 px-3 py-1 rounded-full shadow-lg">
                                                <span className="text-sm font-semibold text-orange-600">
                                                    {formatDate(menu.date)}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-32 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center relative">
                                            <Utensils className="w-16 h-16 text-orange-300" />
                                            {/* Date Badge for text-only posts */}
                                            <div className="absolute top-3 right-3 bg-white bg-opacity-95 px-3 py-1 rounded-full shadow-lg">
                                                <span className="text-sm font-semibold text-orange-600">
                                                    {formatDate(menu.date)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-5">
                                        {/* Restaurant Name */}
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                            <Utensils className="w-5 h-5 text-orange-600" />
                                            {menu.restaurantName}
                                        </h3>

                                        {/* Location & Contact */}
                                        <div className="space-y-2 mb-4 text-sm">
                                            <div className="flex items-center text-gray-600">
                                                <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                                                {menu.location}
                                            </div>
                                            {menu.contactNumber && (
                                                <div className="flex items-center text-gray-600">
                                                    <Phone className="w-4 h-4 mr-2 text-orange-500" />
                                                    <a href={`tel:${menu.contactNumber}`} className="hover:text-orange-600">
                                                        {menu.contactNumber}
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {/* Meal Type Badge */}
                                        <div className="mb-3">
                                            {menu.mealType === 'breakfast' && (
                                                <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                    🌅 BREAKFAST
                                                </span>
                                            )}
                                            {menu.mealType === 'lunch' && (
                                                <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                    🍛 LUNCH
                                                </span>
                                            )}
                                            {menu.mealType === 'dinner' && (
                                                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                    🌙 DINNER
                                                </span>
                                            )}
                                            {menu.mealType === 'snacks' && (
                                                <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                    🍪 SNACKS
                                                </span>
                                            )}
                                            {menu.mealType === 'special' && (
                                                <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                    ⭐ SPECIAL
                                                </span>
                                            )}
                                        </div>

                                        {/* Menu Items */}
                                        {menu.menuItems && menu.menuItems.trim() && (
                                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                <p className="text-sm font-semibold text-gray-700 mb-2">Menu Items:</p>
                                                <p className="text-sm text-gray-800 whitespace-pre-line">{menu.menuItems}</p>
                                            </div>
                                        )}



                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Clock className="w-3 h-3 mr-1" />
                                                Posted {new Date(menu.createdAt).toLocaleDateString()}
                                            </div>
                                            {showDelete && (
                                                <button
                                                    onClick={() => handleDelete(menu._id, menu.restaurantName)}
                                                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete menu"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodMenu;
