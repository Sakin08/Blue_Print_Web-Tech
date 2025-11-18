import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { Upload, ArrowLeft } from 'lucide-react';

const AddMenuItem = () => {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [restaurant, setRestaurant] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        category: 'lunch',
        available: true,
        isSpecial: false,
        isBestSeller: false,
        isNew: false
    });

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        loadRestaurant();
    }, [restaurantId]);

    const loadRestaurant = async () => {
        try {
            const res = await api.get(`/restaurants/${restaurantId}`);
            setRestaurant(res.data.restaurant);
        } catch (err) {
            console.error('Failed to load restaurant:', err);
            alert('Restaurant not found');
            navigate('/restaurants');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('restaurant', restaurantId);

            // Append all form fields
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            // Append image if exists
            if (image) {
                data.append('image', image);
            }

            await api.post('/menu-items', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Menu item added successfully!');
            navigate(`/my-restaurant/${restaurantId}`);
        } catch (error) {
            console.error('Failed to add menu item:', error);
            alert(error.response?.data?.message || 'Failed to add menu item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-10">
            <div className="container mx-auto px-4 max-w-3xl">

                {/* Back Button */}
                <button
                    onClick={() => navigate(`/my-restaurant/${restaurantId}`)}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </button>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Add Menu Item</h1>
                    <p className="text-gray-600">Add a new item to {restaurant.name}</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">

                    {/* Basic Info */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Item Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Chicken Biriyani"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Describe your dish..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price (৳) *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., 180"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Discount Price (৳)
                                    </label>
                                    <input
                                        type="number"
                                        name="discountPrice"
                                        value={formData.discountPrice}
                                        onChange={handleChange}
                                        placeholder="Optional"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Category</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snacks">Snacks</option>
                                <option value="beverages">Beverages</option>
                                <option value="desserts">Desserts</option>
                                <option value="main-course">Main Course</option>
                                <option value="appetizers">Appetizers</option>
                            </select>
                        </div>
                    </div>

                    {/* Special Tags */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Special Tags</h2>
                        <div className="space-y-3">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isNew"
                                    checked={formData.isNew}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">New Item</span>
                            </label>

                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isBestSeller"
                                    checked={formData.isBestSeller}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Best Seller</span>
                            </label>

                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isSpecial"
                                    checked={formData.isSpecial}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Special Item</span>
                            </label>

                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="available"
                                    checked={formData.available}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Available Now</span>
                            </label>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Item Image</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-12 h-12 mb-3 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            {imagePreview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImage(null);
                                        setImagePreview(null);
                                    }}
                                    className="text-sm text-red-600 hover:text-red-800"
                                >
                                    Remove Image
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4 pt-6 border-t">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Menu Item'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(`/my-restaurant/${restaurantId}`)}
                            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMenuItem;
