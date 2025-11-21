import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MapPin, Calendar, Tag, Palette, Search, X, Camera, AlertTriangle, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const EditLostFound = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'lost',
        category: 'other',
        location: '',
        date: '',
        contactInfo: '',
        color: '',
        brand: '',
        identifyingFeatures: ''
    });

    useEffect(() => {
        loadItem();
        return () => {
            newImagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [id]);

    const loadItem = async () => {
        try {
            const res = await axios.get(`${API_URL}/lost-found/${id}`);
            const item = res.data;

            // Check if user owns this item
            if (item.poster._id !== user._id) {
                alert('You are not authorized to edit this post');
                navigate('/lost-found');
                return;
            }

            // Format date for input
            const formattedDate = item.date
                ? new Date(item.date).toISOString().split('T')[0]
                : '';

            setFormData({
                title: item.title || '',
                description: item.description || '',
                type: item.type || 'lost',
                category: item.category || 'other',
                location: item.location || '',
                date: formattedDate,
                contactInfo: item.contactInfo || '',
                color: item.color || '',
                brand: item.brand || '',
                identifyingFeatures: item.identifyingFeatures || ''
            });

            setExistingImages(item.images || []);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load item:', err);
            alert('Failed to load item');
            navigate('/lost-found');
        }
    };

    const isLost = formData.type === 'lost';
    const focusColor = isLost ? 'red' : 'green';
    const focusRingClass = `focus:ring-${focusColor}-500`;
    const submitColorClass = isLost
        ? 'bg-red-600 hover:bg-red-700'
        : 'bg-green-600 hover:bg-green-700';

    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + existingImages.length + newImages.length > 3) {
            alert('Maximum 3 images allowed');
            return;
        }

        setNewImages([...newImages, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveNewImage = (index) => {
        setNewImages(newImages.filter((_, i) => i !== index));
        setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });

        // Append existing images that weren't removed
        data.append('existingImages', JSON.stringify(existingImages));

        // Append new images
        newImages.forEach(img => data.append('images', img));

        try {
            await axios.put(`${API_URL}/lost-found/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            navigate(`/lost-found/${id}`);
        } catch (err) {
            console.error('Update error:', err);
            alert(err.response?.data?.message || 'Failed to update post');
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = `w-full px-4 py-3 border border-gray-300 rounded-lg ${focusRingClass} focus:border-${focusColor}-500 transition shadow-sm`;
    const labelClass = "block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1";

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <div className={`w-16 h-16 ${isLost ? 'bg-red-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <Search size={32} className={`${isLost ? 'text-red-600' : 'text-green-600'}`} />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Edit Lost or Found Item</h1>
                    <p className="text-gray-600">Update your item details</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-10 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* 1. STATUS SELECTION */}
                        <div className="pb-4 border-b border-gray-100">
                            <label className={labelClass}>
                                <Tag size={18} /> Item Status <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'lost' })}
                                    className={`p-4 rounded-xl border-2 font-bold transition shadow-md ${isLost
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <AlertTriangle size={20} className="inline-block mr-2" /> I Lost Something
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'found' })}
                                    className={`p-4 rounded-xl border-2 font-bold transition shadow-md ${!isLost
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <CheckCircle size={20} className="inline-block mr-2" /> I Found Something
                                </button>
                            </div>
                        </div>

                        {/* 2. CORE DETAILS */}
                        <h2 className="text-2xl font-bold text-gray-900 pt-4">Item Identity</h2>
                        <div className="space-y-6">

                            <div>
                                <label className={labelClass}>Item Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className={inputClass}
                                    placeholder="e.g., Black iPhone 13, Blue Laptop Bag, House Keys"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Category <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className={inputClass}
                                    >
                                        <option value="electronics">📱 Electronics</option>
                                        <option value="books">📚 Books</option>
                                        <option value="id-cards">🪪 ID Cards</option>
                                        <option value="keys">🔑 Keys</option>
                                        <option value="clothing">👕 Clothing</option>
                                        <option value="accessories">👜 Accessories</option>
                                        <option value="other">📦 Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Color</label>
                                    <input
                                        type="text"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className={inputClass}
                                        placeholder="e.g., Red, Matte Black, Multi-color"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Description <span className="text-red-500">*</span></label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows="4"
                                    className={inputClass}
                                    placeholder="Provide detailed information about the item's condition, size, and material."
                                />
                            </div>
                        </div>

                        {/* 3. LOCATION AND DATE */}
                        <h2 className="text-2xl font-bold text-gray-900 pt-4">When and Where</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}><MapPin size={18} /> Location <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                    className={inputClass}
                                    placeholder="Building name, road, general area"
                                />
                            </div>

                            <div>
                                <label className={labelClass}><Calendar size={18} /> Date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* 4. OPTIONAL IDENTIFICATION */}
                        <h2 className="text-2xl font-bold text-gray-900 pt-4">Unique Identification</h2>
                        <div className="space-y-6">
                            <div>
                                <label className={labelClass}>Brand / Model</label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    className={inputClass}
                                    placeholder="e.g., Samsung Galaxy Watch, Dell Latitude"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Identifying Features (Scratches, Stickers, etc.)</label>
                                <input
                                    type="text"
                                    value={formData.identifyingFeatures}
                                    onChange={(e) => setFormData({ ...formData, identifyingFeatures: e.target.value })}
                                    className={inputClass}
                                    placeholder="Engraving 'Property of John', unique keyring, broken strap"
                                />
                            </div>
                        </div>

                        {/* 5. CONTACT INFO */}
                        <h2 className="text-2xl font-bold text-gray-900 pt-4">Your Contact Info</h2>
                        <div>
                            <label className={labelClass}>Contact Information (Public) <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.contactInfo}
                                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                                required
                                className={inputClass}
                                placeholder="Best phone number or email for contact"
                            />
                        </div>

                        {/* 6. IMAGES */}
                        <h2 className="text-2xl font-bold text-gray-900 pt-4">Images</h2>
                        <div className="space-y-4">
                            <label className={labelClass}><Camera size={18} /> Upload Images (Max 3)</label>

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        {existingImages.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={image}
                                                    alt={`Existing ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg shadow-md border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExistingImage(index)}
                                                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Image Previews */}
                            {newImagePreviews.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-2">New Images:</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        {newImagePreviews.map((preview, idx) => (
                                            <div key={idx} className="relative">
                                                <img
                                                    src={preview}
                                                    alt={`New ${idx + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg shadow-md border-2 border-green-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveNewImage(idx)}
                                                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload Button */}
                            {(existingImages.length + newImages.length) < 3 && (
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleNewImageChange}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                />
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate(`/lost-found/${id}`)}
                                className="w-1/3 px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-100 transition shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-2/3 ${submitColorClass} text-white px-6 py-3 rounded-xl font-bold text-lg disabled:opacity-50 transition shadow-xl`}
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Updating...
                                    </span>
                                ) : (
                                    'Update Item Report'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditLostFound;
