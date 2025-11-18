import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import {
    MapPin, Clock, Phone, Star, ArrowLeft, Utensils,
    Wifi, Wind, CreditCard, Smartphone, Home as HomeIcon
} from 'lucide-react';

const FoodMenuDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);

    useEffect(() => {
        loadMenu();
    }, [id]);

    const loadMenu = async () => {
        try {
            const res = await api.get(`/food-menu/${id}`);
            setMenu(res.data);
        } catch (err) {
            console.error('Failed to load menu:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRating = async (value) => {
        try {
            await api.post(`/food-menu/${id}/rating`, { rating: value });
            setRating(value);
            loadMenu(); // Reload to get updated rating
        } catch (err) {
            console.error('Failed to submit rating:', err);
        }
    };

    const getFeatureIcon = (feature) => {
        const icons = {
            wifi: Wifi,
            ac: Wind,
            'card-payment': CreditCard,
            bkash: Smartphone,
            'home-delivery': HomeIcon,
            takeaway: Utensils,
            'outdoor-seating': Wind
        };
        return icons[feature] || Utensils;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!menu) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-600">Menu not found</p>
                    <button onClick={() => navigate('/food-menu')} className="mt-4 text-orange-600 hover:underline">
                        Back to Menus
                    </button>
                </div>
            </div>
        );
    }

    const menuByCategory = menu.menuItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-10">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Back Button */}
                <button
                    onClick={() => navigate('/food-menu')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Menus
                </button>

                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                    {menu.coverImage && (
                        <img
                            src={menu.coverImage}
                            alt={menu.vendorName}
                            className="w-full h-64 object-cover"
                        />
                    )}

                    <div className="p-8">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">{menu.vendorName}</h1>
                                <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-700">
                                    {menu.vendorType.replace('-', ' ').toUpperCase()}
                                </span>
                            </div>
                            {menu.isOpen ? (
                                <span className="text-lg font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-full">
                                    ● OPEN NOW
                                </span>
                            ) : (
                                <span className="text-lg font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-full">
                                    ● CLOSED
                                </span>
                            )}
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="flex items-center text-gray-700">
                                <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                                <span>{menu.location}</span>
                            </div>
                            {menu.openingTime && menu.closingTime && (
                                <div className="flex items-center text-gray-700">
                                    <Clock className="w-5 h-5 mr-2 text-orange-600" />
                                    <span>{menu.openingTime} - {menu.closingTime}</span>
                                </div>
                            )}
                            {menu.phone && (
                                <div className="flex items-center text-gray-700">
                                    <Phone className="w-5 h-5 mr-2 text-orange-600" />
                                    <a href={`tel:${menu.phone}`} className="hover:text-orange-600">{menu.phone}</a>
                                </div>
                            )}
                            {menu.averageCost && (
                                <div className="flex items-center text-gray-700">
                                    <span className="font-semibold">Average Cost:</span>
                                    <span className="ml-2 text-orange-600 font-bold">৳{menu.averageCost}</span>
                                </div>
                            )}
                        </div>

                        {/* Rating */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Star className="w-6 h-6 text-yellow-500 mr-2" />
                                    <span className="text-2xl font-bold text-gray-900">
                                        {menu.rating ? menu.rating.toFixed(1) : 'No ratings yet'}
                                    </span>
                                    {menu.totalReviews > 0 && (
                                        <span className="text-gray-500 ml-2">({menu.totalReviews} reviews)</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-sm text-gray-600 mr-2">Rate this place:</span>
                                    {[1, 2, 3, 4, 5].map(value => (
                                        <button
                                            key={value}
                                            onClick={() => handleRating(value)}
                                            className={`${rating >= value ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500 transition`}
                                        >
                                            <Star className="w-6 h-6" fill={rating >= value ? 'currentColor' : 'none'} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Today's Special */}
                        {menu.todaySpecial && (
                            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                <p className="text-lg font-semibold text-yellow-800">
                                    ⭐ Today's Special: {menu.todaySpecial}
                                </p>
                            </div>
                        )}

                        {/* Notice */}
                        {menu.notice && (
                            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                                <p className="text-lg font-semibold text-red-800">
                                    ⚠️ {menu.notice}
                                </p>
                            </div>
                        )}

                        {/* Features */}
                        {menu.features && menu.features.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                                <div className="flex flex-wrap gap-3">
                                    {menu.features.map(feature => {
                                        const FeatureIcon = getFeatureIcon(feature);
                                        return (
                                            <span key={feature} className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                                                <FeatureIcon className="w-4 h-4 mr-2" />
                                                {feature.replace('-', ' ').toUpperCase()}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Menu Items */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Menu</h2>

                    {Object.keys(menuByCategory).length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No menu items available</p>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(menuByCategory).map(([category, items]) => (
                                <div key={category}>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4 capitalize border-b-2 border-orange-200 pb-2">
                                        {category}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                                        {!item.available && (
                                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                                                Not Available
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                                    )}
                                                </div>
                                                <span className="text-lg font-bold text-orange-600 ml-4">
                                                    ৳{item.price}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Posted By */}
                {menu.postedBy && (
                    <div className="mt-6 text-center text-sm text-gray-500">
                        Posted by{' '}
                        <Link to={`/profile/${menu.postedBy._id}`} className="text-orange-600 hover:underline font-medium">
                            {menu.postedBy.name}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodMenuDetails;
