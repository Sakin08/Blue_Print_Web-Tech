import { useState, useEffect } from 'react';
import { Bus, Upload, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const BusSchedule = () => {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [title, setTitle] = useState('SUST Bus Schedule');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const isAdmin = user && user.role === 'admin';

    useEffect(() => {
        loadSchedule();
    }, []);

    const loadSchedule = async () => {
        try {
            const res = await api.get('/bus-schedule');
            setSchedule(res.data);
        } catch (error) {
            console.error('Failed to load schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            alert('Please select an image');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('title', title);
            formData.append('description', description);

            await api.post('/bus-schedule', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowUploadModal(false);
            setImageFile(null);
            setImagePreview(null);
            setTitle('SUST Bus Schedule');
            setDescription('');
            loadSchedule();
        } catch (error) {
            alert('Failed to upload schedule');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete current bus schedule?')) return;
        try {
            await api.delete(`/bus-schedule/${schedule._id}`);
            setSchedule(null);
        } catch (error) {
            alert('Failed to delete schedule');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <Bus className="w-10 h-10 text-blue-600" />
                        <h1 className="text-4xl font-bold text-gray-900">Bus Schedule</h1>
                    </div>
                    <p className="text-gray-600">SUST Campus Transportation</p>

                    {isAdmin && (
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="mt-4 flex items-center gap-2 mx-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                        >
                            <Upload className="w-5 h-5" />
                            Upload New Schedule
                        </button>
                    )}
                </div>

                {schedule ? (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-green-600 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{schedule.title}</h2>
                                {schedule.description && (
                                    <p className="text-blue-100 text-sm mt-1">{schedule.description}</p>
                                )}
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={handleDelete}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <div className="p-6">
                            <img
                                src={schedule.imageUrl}
                                alt="Bus Schedule"
                                className="w-full rounded-lg shadow-md"
                            />
                            <p className="text-xs text-gray-500 mt-4 text-center">
                                Last updated: {new Date(schedule.updatedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <Bus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No bus schedule available</p>
                        {isAdmin && (
                            <p className="text-sm text-gray-400 mt-2">Upload a schedule to get started</p>
                        )}
                    </div>
                )}

                {/* Upload Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload Bus Schedule</h3>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="e.g., Updated for Spring 2025"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Schedule Image *
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        {imagePreview ? (
                                            <div>
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="max-h-64 mx-auto rounded-lg mb-4"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImageFile(null);
                                                        setImagePreview(null);
                                                    }}
                                                    className="text-sm text-red-600 hover:text-red-800"
                                                >
                                                    Remove Image
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                <label className="cursor-pointer">
                                                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                                                        Click to upload
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                                    >
                                        {uploading ? 'Uploading...' : 'Upload Schedule'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUploadModal(false);
                                            setImageFile(null);
                                            setImagePreview(null);
                                        }}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusSchedule;
