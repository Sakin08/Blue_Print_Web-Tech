import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios.js';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import 'leaflet/dist/leaflet.css';

// Fix marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
const LocationPicker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? <Marker position={position} /> : null;
};

const CreateEvent = () => {
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
    const [coordinates, setCoordinates] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSearchLocation = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (err) {
            console.error('Search failed:', err);
            alert('Failed to search location');
        }
        setSearching(false);
    };

    const handleSelectLocation = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setCoordinates([lat, lng]);
        setFormData({ ...formData, location: result.display_name });
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCoordinates([latitude, longitude]);
                    // Reverse geocode to get address
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.display_name) {
                                setFormData({ ...formData, location: data.display_name });
                            }
                        })
                        .catch(err => console.error('Reverse geocoding failed:', err));
                },
                (error) => {
                    alert('Unable to get your location. Please enable location services.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);

        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
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

        if (coordinates) {
            data.append('coordinates', JSON.stringify({
                lat: coordinates[0],
                lng: coordinates[1]
            }));
        }

        images.forEach(img => data.append('images', img));

        try {
            await api.post('/events', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/events');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event');
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <span className="text-4xl">📅</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Campus Event</h1>
                        <p className="text-gray-600">Share exciting events with the SUST community</p>
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
                                <p className="text-xs text-gray-500 mt-1">Select when your event will take place</p>
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

                                {/* Quick Actions */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowMap(!showMap)}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 px-3 py-1 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        {showMap ? 'Hide Map' : 'Show Map'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleUseCurrentLocation}
                                        className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1 px-3 py-1 bg-green-50 rounded-lg hover:bg-green-100 transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Use My Location
                                    </button>
                                </div>

                                {showMap && (
                                    <div className="mt-3 border border-gray-300 rounded-lg overflow-hidden">
                                        {/* Location Search */}
                                        <div className="bg-gray-50 p-3 border-b border-gray-200">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchLocation())}
                                                    placeholder="Search for a place (e.g., SUST Library, Sylhet)"
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleSearchLocation}
                                                    disabled={searching || !searchQuery.trim()}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                >
                                                    {searching ? '...' : '🔍'}
                                                </button>
                                            </div>

                                            {/* Search Results */}
                                            {searchResults.length > 0 && (
                                                <div className="mt-2 bg-white border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                                                    {searchResults.map((result, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => handleSelectLocation(result)}
                                                            className="w-full text-left px-3 py-2 hover:bg-indigo-50 border-b border-gray-100 last:border-0 transition"
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                <span className="text-indigo-600 mt-0.5">📍</span>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 truncate">{result.display_name}</p>
                                                                    <p className="text-xs text-gray-500">{result.type}</p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-blue-50 px-3 py-2 text-sm text-blue-700">
                                            💡 Search for a place above or click on the map to set location
                                        </div>

                                        <MapContainer
                                            center={coordinates || [24.9158, 91.8708]}
                                            zoom={coordinates ? 16 : 15}
                                            style={{ height: '350px', width: '100%' }}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            />
                                            <LocationPicker position={coordinates} setPosition={setCoordinates} />
                                        </MapContainer>

                                        {coordinates && (
                                            <div className="bg-green-50 px-3 py-2 text-sm text-green-700 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span>✓ Location pinned:</span>
                                                    <span className="text-xs font-mono">{coordinates[0].toFixed(5)}, {coordinates[1].toFixed(5)}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setCoordinates(null)}
                                                    className="text-red-600 hover:text-red-700 font-medium"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Category */}
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

                            {/* Tags */}
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Event Images (up to 5, optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                />
                                {imagePreviews.length > 0 && (
                                    <div className="mt-4 grid grid-cols-5 gap-2">
                                        {imagePreviews.map((preview, idx) => (
                                            <div key={idx} className="relative">
                                                <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-20 object-cover rounded-lg" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
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
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition shadow-lg"
                                >
                                    {loading ? 'Creating...' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default CreateEvent;
