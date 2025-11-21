import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/buysell.js';
import { X, ShoppingBag } from 'lucide-react';

const EditBuySellPost = () => {
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
        price: '',
        location: ''
    });

    useEffect(() => {
        loadPost();
        return () => {
            newImagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [id]);

    const loadPost = async () => {
        try {
            const res = await api.getOne(id);
            const post = res.data;

            // Check if user owns this post
            if (post.user._id !== user._id) {
                alert('You are not authorized to edit this post');
                navigate('/buysell');
                return;
            }

            setFormData({
                title: post.title || '',
                description: post.description || '',
                price: post.price || '',
                location: post.location || ''
            });

            setExistingImages(post.images || (post.image ? [post.image] : []));
            setLoading(false);
        } catch (err) {
            console.error('Failed to load post:', err);
            alert('Failed to load post');
            navigate('/buysell');
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(files);

        const previews = files.map(file => URL.createObjectURL(file));
        setNewImagePreviews(previews);
    };

    const handleRemoveNewImage = (index) => {
        const updatedImages = newImages.filter((_, i) => i !== index);
        const updatedPreviews = newImagePreviews.filter((_, i) => i !== index);

        URL.revokeObjectURL(newImagePreviews[index]);

        setNewImages(updatedImages);
        setNewImagePreviews(updatedPreviews);
    };

    const handleRemoveExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate that we have at least one image
        if (existingImages.length === 0 && newImages.length === 0) {
            alert('Please add at least one image');
            return;
        }

        setSubmitting(true);

        try {
            const data = new FormData();

            // Append form fields
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('location', formData.location);

            // Append existing images that weren't removed
            data.append('existingImages', JSON.stringify(existingImages));

            // Append new images
            newImages.forEach(image => {
                data.append('images', image);
            });

            await api.update(id, data);
            navigate(`/buysell/${id}`);
        } catch (err) {
            console.error('Update error:', err);
            alert('Failed to update post: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <ShoppingBag className="w-8 h-8 text-blue-600" />
                        Edit Marketplace Post
                    </h1>
                    <p className="text-gray-600 mb-6">Update your listing details</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g., iPhone 13 Pro"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="5"
                                placeholder="Describe your item in detail..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Price & Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Price (৳) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    placeholder="15000"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    placeholder="SUST Campus"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Images */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Photos <span className="text-red-500">*</span>
                            </label>

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-2">Current Photos:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {existingImages.map((image, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={image}
                                                    alt={`Existing ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExistingImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove image"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Images */}
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleNewImageChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Add new photos (up to 5 total). At least one photo is required.
                            </p>

                            {newImagePreviews.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600 mb-2">New Photos:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {newImagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`New ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border-2 border-green-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveNewImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove image"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                            >
                                {submitting ? 'Updating...' : 'Update Post'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(`/buysell/${id}`)}
                                className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditBuySellPost;
