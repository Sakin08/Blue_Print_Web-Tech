import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, Tag, Palette, Search, PlusCircle, X, Camera, AlertTriangle, CheckCircle } from 'lucide-react'; // Suggested icons

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const CreateLostFound = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'lost', // Default to 'lost'
        category: 'other',
        location: '',
        date: '',
        contactInfo: '',
        color: '',
        brand: '',
        identifyingFeatures: ''
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Determine color based on item type
    const isLost = formData.type === 'lost';
    const focusColor = isLost ? 'red' : 'green';
    const focusRingClass = `focus:ring-${focusColor}-500`;
    const submitColorClass = isLost 
        ? 'bg-red-600 hover:bg-red-700' 
        : 'bg-green-600 hover:bg-green-700';

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 3); // Limit to 3 files
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

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });
        images.forEach(img => data.append('images', img));

        try {
            await axios.post(`${API_URL}/lost-found`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            navigate('/lost-found');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create post');
            setLoading(false);
        }
    };

    const inputClass = `w-full px-4 py-3 border border-gray-300 rounded-lg ${focusRingClass} focus:border-${focusColor}-500 transition shadow-sm`;
    const labelClass = "block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1";


    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <div className={`w-16 h-16 ${isLost ? 'bg-red-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <Search size={32} className={`${isLost ? 'text-red-600' : 'text-green-600'}`} />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Report Lost or Found Item</h1>
                    <p className="text-gray-600">Fill out the details carefully to maximize the chances of reunion.</p>
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
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                            />
                            {imagePreviews.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    {imagePreviews.map((preview, idx) => (
                                        <div key={idx} className="relative">
                                            <img 
                                                src={preview} 
                                                alt={`Preview ${idx + 1}`} 
                                                className="w-full h-32 object-cover rounded-lg shadow-md border border-gray-200" 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => removeImage(idx)} 
                                                className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tip Box (Enhanced) */}
                        <div className={`p-4 rounded-xl ${isLost ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border mt-6`}>
                            <p className={`text-sm font-semibold ${isLost ? 'text-red-800' : 'text-green-800'}`}>
                                💡 Important: <span className="font-normal">Details like brand, color, and unique features greatly speed up the reunion process. For ID cards, list the type (e.g., Student ID).</span>
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/lost-found')}
                                className="w-1/3 px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-100 transition shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-2/3 ${submitColorClass} text-white px-6 py-3 rounded-xl font-bold text-lg disabled:opacity-50 transition shadow-xl`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Posting...
                                    </span>
                                ) : (
                                    'Post Item Report'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateLostFound;