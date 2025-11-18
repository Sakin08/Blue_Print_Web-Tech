import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CommentsSection from '../components/CommentsSection';
import ImageLightbox from '../components/ImageLightbox';
import PosterInfo from '../components/PosterInfo';
import MessageButton from '../components/MessageButton';
import FavoriteButton from '../components/FavoriteButton';
import {
    ArrowLeft, MapPin, Calendar, Tag, HardHat, AlertTriangle,
    CheckCircle, Mail, Trash2, Eye, MessageCircle, Search
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const LostFoundDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLightbox, setShowLightbox] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const isLost = item?.type === 'lost';
    const bgPrimaryClass = isLost ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';

    useEffect(() => {
        loadItem();
    }, [id]);

    const loadItem = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/lost-found/${id}`);
            setItem(res.data);
        } catch (err) {
            console.error('Failed to load item:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        const message = isLost
            ? 'Confirm you found this item? The poster will be notified.'
            : 'Confirm this is your item? The poster will be notified.';

        if (!confirm(message)) return;

        try {
            const res = await axios.post(`${API_URL}/lost-found/${id}/claim`, {}, { withCredentials: true });
            setItem(res.data);
            alert(`Success! Status updated to "Claimed". Please contact the poster.`);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit claim.');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to permanently delete this post?')) return;
        try {
            await axios.delete(`${API_URL}/lost-found/${id}`, { withCredentials: true });
            navigate('/lost-found');
        } catch (err) {
            alert('Failed to delete post.');
        }
    };

    if (loading || !item) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    const isOwner = item.poster?._id === user?._id;

    const renderStatusBadge = () => {
        let statusClass = '';
        let statusIcon = '';
        let statusLabel = '';

        switch (item.status) {
            case 'active':
                statusClass = 'bg-green-100 text-green-700';
                statusIcon = <CheckCircle size={16} />;
                statusLabel = 'Active';
                break;
            case 'claimed':
                statusClass = 'bg-yellow-100 text-yellow-700';
                statusIcon = <AlertTriangle size={16} />;
                statusLabel = 'Claimed';
                break;
            case 'resolved':
                statusClass = 'bg-gray-100 text-gray-700';
                statusIcon = <Tag size={16} />;
                statusLabel = 'Resolved';
                break;
            default:
                statusClass = 'bg-gray-100 text-gray-700';
                statusIcon = <Tag size={16} />;
                statusLabel = 'Unknown';
        }

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${statusClass}`}>
                {statusIcon} {statusLabel}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <Link
                    to="/lost-found"
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Lost & Found
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* Image Gallery */}
                            {item.images && item.images.length > 0 && (
                                <div className="relative">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4">
                                        {item.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`${item.title} ${idx + 1}`}
                                                className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                                                onClick={() => {
                                                    setLightboxIndex(idx);
                                                    setShowLightbox(true);
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <div className="absolute top-8 left-8 flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white flex items-center gap-1 ${isLost ? 'bg-red-500' : 'bg-green-500'}`}>
                                            <Search className="w-4 h-4" />
                                            {isLost ? 'LOST' : 'FOUND'}
                                        </span>
                                        {renderStatusBadge()}
                                    </div>
                                    <div className="absolute top-8 right-8">
                                        <FavoriteButton postType="lostfound" postId={item._id} />
                                    </div>
                                </div>
                            )}

                            <div className="p-6">
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>

                                {/* Category Badge */}
                                <div className="mb-6">
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                        {item.category}
                                    </span>
                                </div>

                                {/* Quick Info Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-indigo-50 rounded-lg p-4 text-center">
                                        <MapPin className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                                        <p className="text-xs text-gray-600">Location</p>
                                        <p className="font-semibold text-gray-900 text-sm">{item.location}</p>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                                        <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                        <p className="text-xs text-gray-600">Date</p>
                                        <p className="font-semibold text-gray-900 text-sm">
                                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>

                                    {item.color && (
                                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                                            <Tag className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                            <p className="text-xs text-gray-600">Color</p>
                                            <p className="font-semibold text-gray-900 text-sm">{item.color}</p>
                                        </div>
                                    )}

                                    {item.brand && (
                                        <div className="bg-orange-50 rounded-lg p-4 text-center">
                                            <HardHat className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                                            <p className="text-xs text-gray-600">Brand</p>
                                            <p className="font-semibold text-gray-900 text-sm">{item.brand}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-indigo-600" />
                                Item Description
                            </h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</p>
                        </div>

                        {/* Identifying Features */}
                        {item.identifyingFeatures && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <HardHat className="w-5 h-5 text-indigo-600" />
                                    Unique Marks / Features
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.identifyingFeatures}</p>
                            </div>
                        )}

                        {/* Comments Section */}
                        <CommentsSection postType="lostfound" postId={id} />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Poster Info Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Posted By</h3>
                            <PosterInfo user={item.poster} createdAt={item.createdAt} />

                            {/* Contact Info */}
                            {item.contactInfo && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Contact Info</p>
                                    <p className="text-sm font-semibold text-gray-900">{item.contactInfo}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-4 space-y-2">
                                {/* Claim Status */}
                                {item.status === 'claimed' && item.claimedBy && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm font-semibold text-yellow-800 mb-1 flex items-center gap-2">
                                            <AlertTriangle size={16} /> Claimed
                                        </p>
                                        <p className="text-xs text-yellow-900">
                                            Claimed by {item.claimedBy.name}
                                        </p>
                                    </div>
                                )}

                                {/* Claim Button */}
                                {user && !isOwner && item.status === 'active' && (
                                    <button
                                        onClick={handleClaim}
                                        className={`w-full ${bgPrimaryClass} text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2`}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        {isLost ? 'I Found This Item!' : 'This is My Item!'}
                                    </button>
                                )}

                                {/* Contact Buttons */}
                                {user && !isOwner && item.poster && (
                                    <>
                                        <MessageButton recipientId={item.poster._id} />
                                        {item.poster.email && (
                                            <a
                                                href={`mailto:${item.poster.email}`}
                                                className="w-full bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border-2 border-gray-300"
                                            >
                                                <Mail className="w-4 h-4" />
                                                Send Email
                                            </a>
                                        )}
                                    </>
                                )}

                                {/* Login Prompt */}
                                {!user && (
                                    <Link
                                        to="/login"
                                        className="w-full text-center block bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
                                    >
                                        Log in to Contact or Claim
                                    </Link>
                                )}

                                {/* Owner Message */}
                                {isOwner && (
                                    <>
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                                            <p className="text-sm text-blue-800">This is your post</p>
                                        </div>
                                        <button
                                            onClick={handleDelete}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                                        >
                                            <Trash2 size={16} />
                                            Delete Post
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Views Counter */}
                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2 text-gray-500">
                                <Eye className="w-4 h-4" />
                                <span className="text-sm">{item.views || 0} views</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lightbox */}
                {item.images && item.images.length > 0 && (
                    <ImageLightbox
                        images={item.images}
                        isOpen={showLightbox}
                        onClose={() => setShowLightbox(false)}
                        initialIndex={lightboxIndex}
                    />
                )}
            </div>
        </div>
    );
};

export default LostFoundDetails;
