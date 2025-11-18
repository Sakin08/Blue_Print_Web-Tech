import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import {
    Plus, Edit, Trash2, Eye, EyeOff, Package, ShoppingBag,
    Clock, MapPin, Phone, Star, Camera, X
} from 'lucide-react';

const MyRestaurant = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [quickMenuPosts, setQuickMenuPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddItem, setShowAddItem] = useState(false);
    const [menuImages, setMenuImages] = useState([]);
    const [menuImagePreviews, setMenuImagePreviews] = useState([]);

    // Quick menu post form
    const [quickMenu, setQuickMenu] = useState({
        date: new Date().toISOString().split('T')[0],
        mealType: 'lunch',
        menuItems: ''
    });

    useEffect(() => {
        loadRestaurant();
    }, [id]);

    useEffect(() => {
        if (restaurant) {
            loadQuickMenuPosts();
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

    const loadQuickMenuPosts = async () => {
        try {
            const res = await api.get('/quick-menu');
            const myPosts = res.data.filter(menu =>
                menu.restaurantName.toLowerCase() === restaurant.name.toLowerCase()
            );
            setQuickMenuPosts(myPosts);
        } catch (err) {
            console.error('Failed to load quick menu posts:', err);
        }
    };

    const handleDeleteQuickMenu = async (menuId) => {
        if (!confirm('Delete this menu post?')) return;
        try {
            await api.delete(`/quick-menu/${menuId}`);
            setQuickMenuPosts(quickMenuPosts.filter(m => m._id !== menuId));
            alert('Menu post deleted successfully!');
        } catch (err) {
            console.error('Failed to delete menu post:', err);
            alert('Failed to delete menu post');
        }
    };

    const handleMenuImagesChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 5); // Max 5 images

        // Check file sizes
        for (let file of files) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Each image should be less than 5MB');
                return;
            }
        }

        setMenuImages(files);

        // Generate previews
        const previews = [];
        let loadedCount = 0;

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push(reader.result);
                loadedCount++;
                if (loadedCount === files.length) {
                    setMenuImagePreviews(previews);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeMenuImage = (index) => {
        setMenuImages(prev => prev.filter((_, i) => i !== index));
        setMenuImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const clearAllImages = () => {
        setMenuImages([]);
        setMenuImagePreviews([]);
    };

    const handleQuickMenuPost = async (e) => {
        e.preventDefault();

        // Validate: either images or menu items text must be provided
        if (menuImages.length === 0 && !quickMenu.menuItems.trim()) {
            alert('Please either upload menu photos or enter menu items text');
            return;
        }

        try {
            const data = new FormData();

            // Append all images
            menuImages.forEach(image => {
                data.append('images', image);
            });

            data.append('restaurantName', restaurant.name);
            data.append('date', quickMenu.date);
            data.append('mealType', quickMenu.mealType);
            data.append('menuItems', quickMenu.menuItems);
            data.append('contactNumber', restaurant.phone);
            data.append('location', restaurant.location);

            await api.post('/quick-menu/quick-post', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Reset form
            setQuickMenu({
                date: new Date().toISOString().split('T')[0],
                mealType: 'lunch',
                menuItems: ''
            });
            clearAllImages();
            setShowAddItem(false);
            loadQuickMenuPosts(); // Reload posts

            alert('Menu posted successfully!');
        } catch (err) {
            console.error('Failed to post menu:', err);
            alert(err.response?.data?.message || 'Failed to post menu. Please try again.');
        }
    };

    const handleToggleAvailability = async (itemId) => {
        try {
            await api.patch(`/menu-items/${itemId}/toggle-availability`);
            loadRestaurant();
        } catch (err) {
            console.error('Failed to toggle availability:', err);
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!confirm('Are you sure you want to delete this menu item?')) return;

        try {
            await api.delete(`/menu-items/${itemId}`);
            loadRestaurant();
            alert('Menu item deleted successfully!');
        } catch (err) {
            console.error('Failed to delete menu item:', err);
            alert('Failed to delete menu item.');
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
    const menuByCategory = menuItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Header */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                            <p className="text-gray-600">{restaurant.description}</p>
                        </div>
                        <Link
                            to={`/restaurants/${restaurant._id}`}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            <Eye className="w-4 h-4" />
                            View Public Page
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-gray-700">
                            <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                            {restaurant.location}
                        </div>
                        <div className="flex items-center text-gray-700">
                            <Clock className="w-4 h-4 mr-2 text-orange-600" />
                            {restaurant.openingTime} - {restaurant.closingTime}
                        </div>
                        <div className="flex items-center text-gray-700">
                            <Phone className="w-4 h-4 mr-2 text-orange-600" />
                            {restaurant.phone}
                        </div>
                        <div className="flex items-center text-gray-700">
                            <Star className="w-4 h-4 mr-2 text-yellow-500" />
                            {restaurant.rating ? restaurant.rating.toFixed(1) : 'New'} ({restaurant.totalReviews} reviews)
                        </div>
                    </div>

                    <div className="flex gap-4 mt-4 pt-4 border-t">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">{menuItems.length}</p>
                            <p className="text-sm text-gray-600">Menu Items</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{restaurant.totalOrders || 0}</p>
                            <p className="text-sm text-gray-600">Total Orders</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {restaurant.isOpen ? 'Open' : 'Closed'}
                            </p>
                            <p className="text-sm text-gray-600">Status</p>
                        </div>
                    </div>
                </div>

                {/* Menu Management */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAddItem(!showAddItem)}
                                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                            >
                                <Plus className="w-4 h-4" />
                                Quick Add
                            </button>
                            <Link
                                to={`/my-restaurant/${id}/add-item`}
                                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
                            >
                                <Plus className="w-4 h-4" />
                                Add with Details
                            </Link>
                        </div>
                    </div>

                    {/* Quick Menu Post Form */}
                    {showAddItem && (
                        <form onSubmit={handleQuickMenuPost} className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-6 mb-6 border-2 border-orange-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">📸 Quick Menu Post</h3>
                            <p className="text-sm text-gray-600 mb-4">Share today's menu with students - just upload a photo and fill in what's available!</p>

                            {/* Date */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={quickMenu.date}
                                    onChange={(e) => setQuickMenu({ ...quickMenu, date: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            {/* Menu Images Upload (Multiple) */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    📸 Menu Photos (up to 5 images)
                                </label>

                                {menuImagePreviews.length === 0 ? (
                                    <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center hover:border-orange-500 transition bg-white">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleMenuImagesChange}
                                            className="hidden"
                                            id="menu-images-upload"
                                        />
                                        <label htmlFor="menu-images-upload" className="cursor-pointer">
                                            <Camera className="w-12 h-12 text-orange-400 mx-auto mb-2" />
                                            <p className="text-gray-600 font-medium">Click to upload menu photos</p>
                                            <p className="text-xs text-gray-500 mt-1">Select multiple images (PNG, JPG up to 5MB each)</p>
                                        </label>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                                            {menuImagePreviews.map((preview, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={preview}
                                                        alt={`Menu ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg border-2 border-orange-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMenuImage(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearAllImages}
                                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                                        >
                                            Remove all images
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Meal Type Selector */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Meal Type
                                </label>
                                <select
                                    value={quickMenu.mealType}
                                    onChange={(e) => setQuickMenu({ ...quickMenu, mealType: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-base"
                                >
                                    <option value="breakfast">🌅 Breakfast</option>
                                    <option value="lunch">🍛 Lunch</option>
                                    <option value="dinner">🌙 Dinner</option>
                                    <option value="snacks">🍪 Snacks</option>
                                    <option value="special">⭐ Special/All Day</option>
                                </select>
                            </div>

                            {/* Menu Items */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Menu Items (Optional)
                                </label>
                                <textarea
                                    value={quickMenu.menuItems}
                                    onChange={(e) => setQuickMenu({ ...quickMenu, menuItems: e.target.value })}
                                    rows="4"
                                    placeholder="List your menu items, e.g.:&#10;Rice, Dal, Chicken Curry, Mixed Vegetables&#10;Paratha, Egg, Tea&#10;Beef Tehari (Special)"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-base"
                                />
                                <p className="text-xs text-gray-500 mt-1">Optional - Enter items if you want to add text description</p>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition font-semibold"
                                >
                                    Post Menu
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddItem(false);
                                        removeMenuImage();
                                    }}
                                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Menu Items List */}
                    {menuItems.length === 0 ? (
                        <div className="text-center py-16 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border-2 border-dashed border-orange-200">
                            <Package className="w-16 h-16 mx-auto mb-4 text-orange-400" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Menu Items Yet</h3>
                            <p className="text-gray-600 mb-6">Add your first menu item to start receiving orders!</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowAddItem(true)}
                                    className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-semibold"
                                >
                                    <Plus className="w-5 h-5" />
                                    Quick Add
                                </button>
                                <Link
                                    to={`/my-restaurant/${id}/add-item`}
                                    className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add with Details
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(menuByCategory).map(([category, items]) => (
                                <div key={category}>
                                    <h3 className="text-xl font-bold text-gray-800 mb-3 capitalize">
                                        {category}
                                    </h3>
                                    <div className="space-y-3">
                                        {items.map(item => (
                                            <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
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
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {item.cuisine} • {item.category}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-bold text-orange-600">
                                                        ৳{item.price}
                                                    </span>

                                                    <button
                                                        onClick={() => handleToggleAvailability(item._id)}
                                                        className={`p-2 rounded-lg transition ${item.available
                                                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                            }`}
                                                        title={item.available ? 'Mark as unavailable' : 'Mark as available'}
                                                    >
                                                        {item.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteItem(item._id)}
                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                                        title="Delete item"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Menu Posts Section */}
                <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Today's Menu Posts</h2>
                    <p className="text-sm text-gray-600 mb-6">Your quick menu posts that customers see</p>

                    {quickMenuPosts.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">No menu posts yet. Use "Quick Add" above to post today's menu!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {quickMenuPosts.map(menu => (
                                <div key={menu._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                    {/* Images */}
                                    {menu.images && menu.images.length > 0 && (
                                        <div className="mb-3">
                                            {menu.images.length === 1 ? (
                                                <img
                                                    src={menu.images[0]}
                                                    alt="Menu"
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="grid grid-cols-2 gap-1">
                                                    {menu.images.slice(0, 4).map((img, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={img}
                                                            alt={`Menu ${idx + 1}`}
                                                            className="w-full h-24 object-cover rounded"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Meal Type */}
                                    <div className="mb-2">
                                        {menu.mealType === 'breakfast' && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">🌅 Breakfast</span>}
                                        {menu.mealType === 'lunch' && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">🍛 Lunch</span>}
                                        {menu.mealType === 'dinner' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">🌙 Dinner</span>}
                                        {menu.mealType === 'snacks' && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">🍪 Snacks</span>}
                                        {menu.mealType === 'special' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">⭐ Special</span>}
                                    </div>

                                    {/* Menu Items */}
                                    {menu.menuItems && (
                                        <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">{menu.menuItems}</p>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                        <span className="text-xs text-gray-500">
                                            Posted {new Date(menu.createdAt).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteQuickMenu(menu._id)}
                                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyRestaurant;
