import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios.js';
import { X, Calendar as CalendarIcon } from 'lucide-react';

const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        capacity: 0,
        requiresRSVP: false,
        waitlistEnabled: false,
        category: 'other',
        tags: ''
    });

    useEffect(() => {
        loadEvent();
        return () => {
            newImagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [id]);

    const loadEvent = async () => {
        try {
            const res = await api.get(`/events/${id}`);
            const event = res.data;

            // Check if user owns this event
            if (event.user._id !== user._id) {
                alert('You are not authorized to edit this event');
                navigate('/events');
                return;
            }

            // Format date for input
            const formattedDate = event.date
                ? new Date(event.date).toISOString().slice(0, 16)
                : '';

            setFormData({
                title: event.title || '',
                description: event.description || '',
                date: formattedDate,
                location: event.location || '',
                capacity: event.capacity || 0,
                requiresRSVP: event.requiresRSVP || false,
                waitlistEnabled: event.waitlistEnabled || false,
                category: event.category || 'other',
                tags: event.tags ? event.tags.join(', ') : ''
            });

            setExistingImages(event.images || []);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load event:', err);
            alert('Failed to load event');
            navigate('/events');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + existingImages.length + newImages.length > 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        setNewImages([...newImages, ...files]);

        const previews = files.map(file => URL.createObjectURL(file));
        setNewImagePreviews([...newImagePreviews, ...previews]);
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
        setError('');

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('date', formData.date);
        data.append('location', formData.location);
        data.append('capacity', formData.capacity);
        data.append('requiresRSVP', formData.requiresRSVP);
        data.append('waitlistEnabled', formData.waitlistEnabled);
        data.append('category', formData.category);

        if (formData.tags) {
            const tagsArray = formData.tags.split(',').map(t => t.trim());
            data.append('tags', JSON.stringify(tagsArray));
        }

        // Append existing images that weren't removed
        data.append('existingImages', JSON.stringify(existingImages));

        // Append new images
        newImages.forEach(img => data.append('images', img));

        try {
            await api.put(`/events/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/events');
        } catch (err) {
            console.error('Update error:', err);
            setError(err.response?.data?.message || 'Failed to update event');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <CalendarIcon className="w-10 h-10 text-purple-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Event</h1>
                    <p className="text-gray-600">Update your event details</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="e.g., Tech Fest 2024"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="5"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="Describe your event in detail..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date & Time *
                            </label>
                            <input
                                type="datetime-local"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                min={new Date().toISOString().slice(0, 16)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            />
                        </div>

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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="e.g., SUST Auditorium, Room 301"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            >
                                <option value="academic">📚 Academic</option>
                                <option value="sports">⚽ Sports</option>
                                <option value="cultural">🎭 Cultural</option>
                                <option value="social">🎉 Social</option>
                                <option value="workshop">🛠️ Workshop</option>
                                <option value="other">📌 Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags (comma-separated)
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="e.g., tech, networking, free food"
                            />
                        </div>

                        {/* RSVP Settings */}
                        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                            <h3 className="font-semibold text-gray-900">RSVP Settings</h3>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="requiresRSVP"
                                    checked={formData.requiresRSVP}
                                    onChange={(e) => setFormData({ ...formData, requiresRSVP: e.target.checked })}
                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-700">Require RSVP for this event</span>
                            </label>

                            {formData.requiresRSVP && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Capacity (0 = unlimited)
                                        </label>
                                        <input
                                            type="number"
                                            name="capacity"
                                            min="0"
                                            value={formData.capacity}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                        />
                                    </div>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="waitlistEnabled"
                                            checked={formData.waitlistEnabled}
                                            onChange={(e) => setFormData({ ...formData, waitlistEnabled: e.target.checked })}
                                            className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                        />
                                        <span className="text-sm text-gray-700">Enable waitlist when full</span>
                                    </label>
                                </>
                            )}
                        </div>

                        {/* Images */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Images (up to 5)
                            </label>

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                                    <div className="grid grid-cols-5 gap-2">
                                        {existingImages.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img src={image} alt={`Existing ${index + 1}`} className="w-full h-20 object-cover rounded-lg" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExistingImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
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
                                    <div className="grid grid-cols-5 gap-2">
                                        {newImagePreviews.map((preview, idx) => (
                                            <div key={idx} className="relative">
                                                <img src={preview} alt={`New ${idx + 1}`} className="w-full h-20 object-cover rounded-lg border-2 border-green-300" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveNewImage(idx)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload Button */}
                            {(existingImages.length + newImages.length) < 5 && (
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleNewImageChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                />
                            )}
                            <p className="text-xs text-gray-500 mt-1">Add photos to make your event more attractive</p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/events')}
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition shadow-lg"
                            >
                                {submitting ? 'Updating...' : 'Update Event'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditEvent;
