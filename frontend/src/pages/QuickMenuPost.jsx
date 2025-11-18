import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Upload, X, Camera, Utensils } from 'lucide-react';

const QuickMenuPost = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        restaurantName: '',
        date: new Date().toISOString().split('T')[0],
        breakfast: '',
        lunch: '',
        dinner: '',
        snacks: '',
        specialItems: '',
        price: '',
        contactNumber: '',
        location: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            alert('Please upload a menu image');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append('image', image);
            data.append('restaurantName', formData.restaurantName);
            data.append('date', formData.date);
            data.append('breakfast', formData.breakfast);
            data.append('lunch', formData.lunch);
            data.append('dinner', formData.dinner);
            data.append('snacks', formData.snacks);
            data.append('specialItems', formData.specialItems);
            data.append('price', formData.price);
            data.append('contactNumber', formData.contactNumber);
            data.append('location', formData.location);

            await api.post('/quick-menu/quick-post', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Menu posted successfully!');
            navigate('/quick-menu');
        } catch (error) {
            console.error('Failed to post menu:', error);
            alert(error.response?.data?.message || 'Failed to post menu. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-10">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                        <Utensils className="w-8 h-8 text-orange-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Quick Menu Post</h1>
                    <p className="text-gray-600">Share today's menu with students in seconds</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">

                    {/* Restaurant Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Restaurant/Shop Name *
                        </label>
                        <input
                            type="text"
                            name="restaurantName"
                            value={formData.restaurantName}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Panshi Restaurant, TSC Canteen"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Date *
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>

                    {/* Menu Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Menu Image * (Photo of your menu board or items)
                        </label>

                        {!imagePreview ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="menu-image"
                                />
                                <label htmlFor="menu-image" className="cursor-pointer">
                                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600 font-medium mb-1">Click to upload menu image</p>
                                    <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                                </label>
                            </div>
                        ) : (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Menu preview"
                                    className="w-full h-64 object-cover rounded-lg border-2 border-orange-200"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Today's Menu</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🌅 Breakfast Items
                            </label>
                            <textarea
                                name="breakfast"
                                value={formData.breakfast}
                                onChange={handleChange}
                                rows="2"
                                placeholder="e.g., Paratha, Egg, Tea, Bread"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🍛 Lunch Items
                            </label>
                            <textarea
                                name="lunch"
                                value={formData.lunch}
                                onChange={handleChange}
                                rows="2"
                                placeholder="e.g., Rice, Dal, Chicken Curry, Vegetables"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🌙 Dinner Items
                            </label>
                            <textarea
                                name="dinner"
                                value={formData.dinner}
                                onChange={handleChange}
                                rows="2"
                                placeholder="e.g., Rice, Fish, Dal, Mixed Vegetables"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🍪 Snacks/Others
                            </label>
                            <textarea
                                name="snacks"
                                value={formData.snacks}
                                onChange={handleChange}
                                rows="2"
                                placeholder="e.g., Samosa, Singara, Tea, Coffee, Juice"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ⭐ Special Items (Optional)
                            </label>
                            <textarea
                                name="specialItems"
                                value={formData.specialItems}
                                onChange={handleChange}
                                rows="2"
                                placeholder="e.g., Today's Special: Beef Tehari, Kacchi Biriyani"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            💰 Price Range
                        </label>
                        <input
                            type="text"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="e.g., ৳50-150, ৳80 per meal"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* Contact & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                📞 Contact Number *
                            </label>
                            <input
                                type="tel"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                required
                                placeholder="01XXXXXXXXX"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                📍 Location *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Near Main Gate, TSC"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-6 border-t">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Post Menu
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/quick-menu')}
                            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                {/* Help Text */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>💡 Quick Tip:</strong> Take a clear photo of your menu board or prepared dishes.
                        Fill in what's available today and post! Students will see your menu instantly.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QuickMenuPost;
