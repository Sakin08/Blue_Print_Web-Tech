import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Upload, X } from 'lucide-react';

const CreateRestaurant = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        shopType: 'restaurant',
        location: '',
        address: '',
        phone: '',
        email: '',
        openingTime: '',
        closingTime: '',
        deliveryAvailable: true,
        deliveryFee: '',
        minimumOrder: '',
        estimatedDeliveryTime: '30-45 mins',
        paymentMethods: ['cash'],
        features: []
    });

    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePaymentMethodToggle = (method) => {
        setFormData(prev => ({
            ...prev,
            paymentMethods: prev.paymentMethods.includes(method)
                ? prev.paymentMethods.filter(m => m !== method)
                : [...prev.paymentMethods, method]
        }));
    };

    const handleFeatureToggle = (feature) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter(f => f !== feature)
                : [...prev.features, feature]
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 5);
        setImages(files);

        const previews = [];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push(reader.result);
                if (previews.length === files.length) {
                    setImagePreviews(previews);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();

            // Append basic fields
            Object.keys(formData).forEach(key => {
                if (key === 'paymentMethods' || key === 'features') {
                    data.append(key, JSON.stringify(formData[key]));
                } else {
                    data.append(key, formData[key]);
                }
            });

            // Append images
            if (logo) data.append('logo', logo);
            if (coverImage) data.append('coverImage', coverImage);
            images.forEach(image => data.append('images', image));

            const res = await api.post('/restaurants', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Restaurant created successfully! You can now add menu items.');
            navigate(`/my-restaurant/${res.data._id}`);
        } catch (error) {
            console.error('Failed to create restaurant:', error);
            alert(error.response?.data?.message || 'Failed to create restaurant. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const paymentMethodOptions = [
        { value: 'cash', label: 'Cash on Delivery' },
        { value: 'bkash', label: 'bKash' },
        { value: 'nagad', label: 'Nagad' },
        { value: 'rocket', label: 'Rocket' },
        { value: 'card', label: 'Card Payment' }
    ];

    const featureOptions = [
        { value: 'wifi', label: 'WiFi' },
        { value: 'ac', label: 'AC' },
        { value: 'outdoor-seating', label: 'Outdoor Seating' },
        { value: 'parking', label: 'Parking' },
        { value: 'card-payment', label: 'Card Payment' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-10">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Your Restaurant</h1>
                    <p className="text-gray-600">Set up your restaurant profile and start receiving orders</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">

                    {/* Basic Info */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Restaurant Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Panshi Restaurant"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Tell customers about your restaurant..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Shop Type *
                                </label>
                                <select
                                    name="shopType"
                                    value={formData.shopType}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                >
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
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="01XXXXXXXXX"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="restaurant@example.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Near SUST Main Gate"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="e.g., Kumargaon, Sylhet"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Timing */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Operating Hours</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Opening Time *
                                </label>
                                <input
                                    type="text"
                                    name="openingTime"
                                    value={formData.openingTime}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., 8:00 AM"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Closing Time *
                                </label>
                                <input
                                    type="text"
                                    name="closingTime"
                                    value={formData.closingTime}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., 11:00 PM"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Delivery Settings */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Settings</h2>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="deliveryAvailable"
                                    checked={formData.deliveryAvailable}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">
                                    Delivery Available
                                </label>
                            </div>

                            {formData.deliveryAvailable && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Delivery Fee (৳)
                                        </label>
                                        <input
                                            type="number"
                                            name="deliveryFee"
                                            value={formData.deliveryFee}
                                            onChange={handleChange}
                                            placeholder="e.g., 20"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Minimum Order (৳)
                                        </label>
                                        <input
                                            type="number"
                                            name="minimumOrder"
                                            value={formData.minimumOrder}
                                            onChange={handleChange}
                                            placeholder="e.g., 100"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Estimated Delivery Time
                                        </label>
                                        <input
                                            type="text"
                                            name="estimatedDeliveryTime"
                                            value={formData.estimatedDeliveryTime}
                                            onChange={handleChange}
                                            placeholder="e.g., 30-45 mins"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Methods</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {paymentMethodOptions.map(method => (
                                <label key={method.value} className="flex items-center cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={formData.paymentMethods.includes(method.value)}
                                        onChange={() => handlePaymentMethodToggle(method.value)}
                                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{method.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {featureOptions.map(feature => (
                                <label key={feature.value} className="flex items-center cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={formData.features.includes(feature.value)}
                                        onChange={() => handleFeatureToggle(feature.value)}
                                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{feature.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Images</h2>
                        <div className="space-y-6">
                            {/* Logo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Restaurant Logo
                                </label>
                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Square image recommended (e.g., 200x200px)</p>
                                    </div>
                                    {logoPreview && (
                                        <div className="relative">
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="w-24 h-24 object-cover rounded-lg border-2 border-orange-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setLogo(null);
                                                    setLogoPreview(null);
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cover Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cover Image
                                </label>
                                <div className="space-y-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    />
                                    <p className="text-xs text-gray-500">Wide image recommended (e.g., 1200x400px)</p>
                                    {coverPreview && (
                                        <div className="relative">
                                            <img
                                                src={coverPreview}
                                                alt="Cover preview"
                                                className="w-full h-48 object-cover rounded-lg border-2 border-orange-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCoverImage(null);
                                                    setCoverPreview(null);
                                                }}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Gallery Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gallery Images (up to 5)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImagesChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Upload multiple images of your restaurant</p>

                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={preview}
                                                    alt={`Gallery ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4 pt-6 border-t">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Restaurant'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/restaurants')}
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

export default CreateRestaurant;
