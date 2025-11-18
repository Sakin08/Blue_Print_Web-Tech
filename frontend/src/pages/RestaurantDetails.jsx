import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    MapPin, Clock, Phone, Star, ArrowLeft,
    Leaf, Flame, Settings
} from 'lucide-react';

const RestaurantDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [quickMenus, setQuickMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [activeTab, setActiveTab] = useState('today'); // 'today' or 'menu' - default to today

    useEffect(() => {
        loadRestaurant();
    }, [id]);

    useEffect(() => {
        if (restaurant) {
            loadQuickMenus();
        }
    }, [restaurant]);

    const loadRestaurant = async () => {
        try {
            const res = await api.get(`/restaurants/${id}`);
            setRestaurant(res.data.restaurant);
            setMenuItems(res.data.menuItems || []);
        } catch (err) {
            console.error('Failed to load restaurant:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadQuickMenus = async () => {
        try {
            const res = await api.get('/quick-menu');
            // Filter menus for this specific restaurant by name
            const restaurantMenus = res.data.filter(menu =>
                menu.restaurantName.toLowerCase() === restaurant.name.toLowerCase()
            );
            setQuickMenus(restaurantMenus);
            console.log('Quick menus loaded:', restaurantMenus);
        } catch (err) {
            console.error('Failed to load quick menus:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-600">Restaurant not found</p>
                    <button onClick={() => navigate('/restaurants')} className="mt-4 text-orange-600 hover:underline">
                        Back to Restaurants
                    </button>
                </div>
            </div>
        );
    }

    // Group menu items by category
    const categories = ['all', ...new Set(menuItems.map(item => item.category))];
    const filteredItems = selectedCategory === 'all'
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back Button */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/restaurants')}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Restaurants
                    </button>
                </div>
            </div>

            {/* Restaurant Header */}
            <div className="bg-white shadow-md mb-6">
                {restaurant.coverImage && (
                    <div className="h-64 overflow-hidden">
                        <img
                            src={restaurant.coverImage}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="container mx-auto px-4 py-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                                {restaurant.isOpen ? (
                                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                        ● OPEN
                                    </span>
                                ) : (
                                    <span className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                        ● CLOSED
                                    </span>
                                )}
                            </div>

                            {restaurant.description && (
                                <p className="text-gray-600 mb-4">{restaurant.description}</p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center text-gray-700">
                                    <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                                    {restaurant.location}
                                </div>
                                {restaurant.openingTime && restaurant.closingTime && (
                                    <div className="flex items-center text-gray-700">
                                        <Clock className="w-4 h-4 mr-2 text-orange-600" />
                                        {restaurant.openingTime} - {restaurant.closingTime}
                                    </div>
                                )}
                                {restaurant.phone && (
                                    <div className="flex items-center text-gray-700">
                                        <Phone className="w-4 h-4 mr-2 text-orange-600" />
                                        <a href={`tel:${restaurant.phone}`} className="hover:text-orange-600">
                                            {restaurant.phone}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-center">
                                    <Star className="w-5 h-5 text-yellow-500 mr-1" />
                                    <span className="font-semibold text-gray-900">
                                        {restaurant.rating ? restaurant.rating.toFixed(1) : 'New'}
                                    </span>
                                    {restaurant.totalReviews > 0 && (
                                        <span className="text-sm text-gray-500 ml-1">
                                            ({restaurant.totalReviews} reviews)
                                        </span>
                                    )}
                                </div>
                                {restaurant.deliveryFee !== undefined && (
                                    <span className="text-sm text-gray-600">
                                        Delivery: <span className="font-semibold text-orange-600">৳{restaurant.deliveryFee}</span>
                                    </span>
                                )}
                                {restaurant.minimumOrder > 0 && (
                                    <span className="text-sm text-gray-600">
                                        Min Order: <span className="font-semibold">৳{restaurant.minimumOrder}</span>
                                    </span>
                                )}
                            </div>


                        </div>

                        {/* Manage Button for Owner */}
                        {user && restaurant.owner && user._id === restaurant.owner._id && (
                            <div className="ml-4">
                                <Link
                                    to={`/my-restaurant/${restaurant._id}`}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold shadow-lg"
                                >
                                    <Settings className="w-5 h-5" />
                                    Manage Restaurant
                                </Link>
                                <p className="text-xs text-gray-500 mt-2 text-center">Add menu items here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Menu Section */}
            <div className="container mx-auto px-4 pb-10">
                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('today')}
                        className={`pb-3 px-4 font-semibold transition relative ${activeTab === 'today'
                            ? 'text-orange-600 border-b-2 border-orange-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        📋 Today's Menu
                        {quickMenus.length > 0 && (
                            <span className="ml-2 bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">
                                {quickMenus.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('menu')}
                        className={`pb-3 px-4 font-semibold transition relative ${activeTab === 'menu'
                            ? 'text-orange-600 border-b-2 border-orange-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        🍽️ Full Menu
                    </button>
                </div>

                {activeTab === 'menu' && (
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Menu Items */}
                        <div className="flex-1">
                            {/* Category Filter */}
                            <div className="bg-white rounded-lg shadow-md p-4 mb-6 sticky top-4 z-10">
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {categories.map(category => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${selectedCategory === category
                                                ? 'bg-orange-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {category === 'all' ? 'All Items' : category.charAt(0).toUpperCase() + category.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Menu Items Grid */}
                            {filteredItems.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-md p-10 text-center">
                                    <p className="text-gray-500">No menu items available</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredItems.map(item => (
                                        <div key={item._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                                            <div className="flex gap-4">
                                                {/* Item Image */}
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                                                    />
                                                )}

                                                {/* Item Details */}
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                                {item.name}
                                                                {item.isVegetarian && <Leaf className="w-4 h-4 text-green-600" title="Vegetarian" />}
                                                                {item.spiceLevel && item.spiceLevel !== 'mild' && (
                                                                    <Flame className="w-4 h-4 text-red-600" title={`Spice: ${item.spiceLevel}`} />
                                                                )}
                                                            </h3>
                                                            {item.description && (
                                                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xl font-bold text-orange-600">৳{item.price}</p>
                                                            {item.discountPrice && (
                                                                <p className="text-sm text-gray-400 line-through">৳{item.discountPrice}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Tags */}
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {item.isNew && (
                                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                                                NEW
                                                            </span>
                                                        )}
                                                        {item.isBestSeller && (
                                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                                                                BEST SELLER
                                                            </span>
                                                        )}
                                                        {item.isSpecial && (
                                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                                                                SPECIAL
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Availability Status */}
                                                    {!item.available && (
                                                        <span className="text-sm text-red-600 font-medium">Not Available</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Today's Menu Tab */}
                {activeTab === 'today' && (
                    <div>
                        {quickMenus.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-10 text-center">
                                <p className="text-gray-500 mb-2">No menu posted today</p>
                                <p className="text-sm text-gray-400">Check back later for today's special menu</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {quickMenus.map(menu => (
                                    <div key={menu._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                                        {/* Menu Images */}
                                        {menu.images && menu.images.length > 0 ? (
                                            <div className="relative">
                                                {menu.images.length === 1 ? (
                                                    <div className="h-64 overflow-hidden">
                                                        <img
                                                            src={menu.images[0]}
                                                            alt="Menu"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-1 h-64">
                                                        {menu.images.slice(0, 4).map((image, idx) => (
                                                            <div key={idx} className="relative overflow-hidden">
                                                                <img
                                                                    src={image}
                                                                    alt={`Menu ${idx + 1}`}
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
                                            </div>
                                        ) : (
                                            <div className="h-48 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                                                <Flame className="w-16 h-16 text-orange-300" />
                                            </div>
                                        )}

                                        <div className="p-6">
                                            {/* Meal Type Badge */}
                                            <div className="mb-4">
                                                {menu.mealType === 'breakfast' && (
                                                    <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                        🌅 BREAKFAST
                                                    </span>
                                                )}
                                                {menu.mealType === 'lunch' && (
                                                    <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                        🍛 LUNCH
                                                    </span>
                                                )}
                                                {menu.mealType === 'dinner' && (
                                                    <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                        🌙 DINNER
                                                    </span>
                                                )}
                                                {menu.mealType === 'snacks' && (
                                                    <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                        🍪 SNACKS
                                                    </span>
                                                )}
                                                {menu.mealType === 'special' && (
                                                    <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                        ⭐ SPECIAL
                                                    </span>
                                                )}
                                            </div>

                                            {/* Menu Items */}
                                            {menu.menuItems && menu.menuItems.trim() && (
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <p className="text-sm text-gray-800 whitespace-pre-line">{menu.menuItems}</p>
                                                </div>
                                            )}

                                            {/* Posted Date */}
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <p className="text-xs text-gray-500">
                                                    Posted {new Date(menu.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantDetails;
