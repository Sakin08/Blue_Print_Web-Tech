import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import MessageButton from '../components/MessageButton.jsx';
import ImageGallery from '../components/ImageGallery.jsx';
import FavoriteButton from '../components/FavoriteButton.jsx';
import PosterInfo from '../components/PosterInfo.jsx';
import CommentsSection from '../components/CommentsSection.jsx';
import {
    Home, MapPin, Calendar, Users, Phone, Mail,
    Wifi, Zap, Droplet, Car, Shield, Sofa, Wind, CheckCircle,
    Eye, ArrowLeft, MessageCircle, Building
} from 'lucide-react';

const HousingDetails = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPost();
    }, [id]);

    const loadPost = async () => {
        try {
            const res = await api.get(`/housing/${id}`);
            setPost(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load housing:', err);
            setLoading(false);
        }
    };

    const getFacilityIcon = (facility) => {
        const icons = {
            attached_bath: Droplet,
            wifi: Wifi,
            gas: Zap,
            generator: Zap,
            parking: Car,
            lift: Building,
            security: Shield,
            furnished: Sofa,
            balcony: Wind,
            kitchen: Home
        };
        return icons[facility] || Home;
    };

    const getFacilityLabel = (facility) => {
        const labels = {
            attached_bath: 'Attached Bath',
            wifi: 'WiFi',
            gas_line: 'Gas Line',
            gas_cylinder: 'Gas Cylinder',
            generator: 'Generator/IPS',
            parking: 'Parking',
            lift: 'Lift/Elevator',
            security: 'Security Guard',
            house_maid: 'House Maid',
            furnished: 'Furnished',
            balcony: 'Balcony',
            kitchen: 'Shared Kitchen'
        };
        return labels[facility] || facility;
    };

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

    if (!post) return (
        <div className="container mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800">Housing post not found</p>
                <Link to="/housing" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
                    ← Back to Housing
                </Link>
            </div>
        </div>
    );

    const images = post.images && post.images.length > 0 ? post.images : [];
    const isOwnPost = currentUser && post.user && currentUser._id === post.user._id;
    const isAvailable = post.postType === 'available';

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <Link
                    to="/housing"
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Housing
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {images.length > 0 && (
                                <div className="relative">
                                    <ImageGallery images={images} />
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isAvailable
                                            ? 'bg-green-500 text-white'
                                            : 'bg-blue-500 text-white'
                                            }`}>
                                            {isAvailable ? 'Available' : 'Looking For'}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white text-gray-800 capitalize">
                                            {post.housingType}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <FavoriteButton postType="housing" postId={post._id} />
                                    </div>
                                </div>
                            )}

                            <div className="p-6">
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

                                {/* Price & Location */}
                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    <div>
                                        <span className="text-3xl font-bold text-indigo-600">Tk {post.rent}</span>
                                        <span className="text-gray-600 ml-2">/month</span>
                                        {post.negotiable && (
                                            <span className="ml-2 text-sm text-green-600 font-medium">Negotiable</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 text-gray-700 mb-4">
                                    <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold">{post.location}</p>
                                        <p className="text-sm text-gray-600">{post.address}</p>
                                        {post.distanceFromCampus && (
                                            <p className="text-sm text-gray-500 mt-1">📍 {post.distanceFromCampus} from campus</p>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Info Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                    <div className="bg-indigo-50 rounded-lg p-4 text-center">
                                        <Calendar className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                                        <p className="text-xs text-gray-600">{isAvailable ? 'Available From' : 'Need By'}</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(post.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>

                                    {post.totalSeats && (
                                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                                            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                            <p className="text-xs text-gray-600">Total Seats</p>
                                            <p className="font-semibold text-gray-900">{post.totalSeats}</p>
                                        </div>
                                    )}

                                    {post.availableSeats && (
                                        <div className="bg-green-50 rounded-lg p-4 text-center">
                                            <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                            <p className="text-xs text-gray-600">Available</p>
                                            <p className="font-semibold text-gray-900">{post.availableSeats}</p>
                                        </div>
                                    )}

                                    {post.totalRooms && (
                                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                                            <Home className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                            <p className="text-xs text-gray-600">Rooms</p>
                                            <p className="font-semibold text-gray-900">{post.totalRooms}</p>
                                        </div>
                                    )}

                                    {post.floorNumber && (
                                        <div className="bg-orange-50 rounded-lg p-4 text-center">
                                            <Building className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                                            <p className="text-xs text-gray-600">Floor</p>
                                            <p className="font-semibold text-gray-900">{post.floorNumber}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-indigo-600" />
                                {isAvailable ? 'Description' : 'Requirements'}
                            </h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{post.description}</p>
                        </div>

                        {/* Facilities */}
                        {post.facilities && post.facilities.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                                    {isAvailable ? 'Facilities' : 'Desired Facilities'}
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {post.facilities.map((facility, index) => {
                                        const Icon = getFacilityIcon(facility);
                                        return (
                                            <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                                <Icon className="w-5 h-5 text-indigo-600" />
                                                <span className="text-sm font-medium text-gray-700">
                                                    {getFacilityLabel(facility)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Additional Info */}
                        {isAvailable && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h2>
                                <div className="space-y-3">
                                    {post.advanceDeposit && (
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Advance Deposit</span>
                                            <span className="font-semibold text-gray-900">৳{post.advanceDeposit}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Utilities Included</span>
                                        <span className={`font-semibold ${post.utilitiesIncluded ? 'text-green-600' : 'text-gray-900'}`}>
                                            {post.utilitiesIncluded ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Gender Preference</span>
                                        <span className="font-semibold text-gray-900 capitalize">{post.genderPreference}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">Preferred Tenant</span>
                                        <span className="font-semibold text-gray-900 capitalize">{post.preferredTenant}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <CommentsSection postType="housing" postId={post._id} />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Contact Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>

                            {/* Poster Info */}
                            <PosterInfo user={post.user} createdAt={post.createdAt} />

                            {/* Contact Details */}
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Phone className="w-5 h-5 text-indigo-600" />
                                    <div>
                                        <p className="text-xs text-gray-600">Phone</p>
                                        <a href={`tel:${post.phone}`} className="font-semibold text-gray-900 hover:text-indigo-600">
                                            {post.phone}
                                        </a>
                                    </div>
                                </div>

                                {post.preferredContact && (
                                    <div className="text-xs text-gray-500 text-center">
                                        Preferred: {post.preferredContact === 'both' ? 'Phone & Message' : post.preferredContact}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {!isOwnPost && post.user && (
                                <div className="mt-4 space-y-2">
                                    <MessageButton recipientId={post.user._id} />
                                    {post.user.email && (
                                        <a
                                            href={`mailto:${post.user.email}`}
                                            className="w-full bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border-2 border-gray-300"
                                        >
                                            <Mail className="w-4 h-4" />
                                            Send Email
                                        </a>
                                    )}
                                    <a
                                        href={`tel:${post.phone}`}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Phone className="w-4 h-4" />
                                        Call Now
                                    </a>
                                </div>
                            )}

                            {isOwnPost && (
                                <div className="mt-4 bg-gray-100 border border-gray-300 rounded-lg p-3 text-center">
                                    <p className="text-sm text-gray-600">This is your post</p>
                                </div>
                            )}

                            {/* Views */}
                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2 text-gray-500">
                                <Eye className="w-4 h-4" />
                                <span className="text-sm">{post.views || 0} views</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HousingDetails;
