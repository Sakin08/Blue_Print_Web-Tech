import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PosterInfo from '../components/PosterInfo';
import MessageButton from '../components/MessageButton';
import CommentsSection from '../components/CommentsSection';
import api from '../api/axios';
import {
    ArrowLeft, MapPin, Phone, Calendar, AlertTriangle, CheckCircle,
    XCircle, HeartPulse, User, Trash2, Hospital, MessageCircle, Eye
} from 'lucide-react';

const BloodRequestDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequest();
    }, [id]);

    const loadRequest = async () => {
        try {
            const res = await api.get(`/blood-donation/requests/${id}`);
            setRequest(res.data);
        } catch (err) {
            console.error('Failed to load request:', err);
        }
        setLoading(false);
    };

    const handleMarkFulfilled = async () => {
        if (!confirm('Mark this request as fulfilled?')) return;
        try {
            await api.patch(`/blood-donation/requests/${id}/status`, { status: 'fulfilled' });
            setRequest({ ...request, status: 'fulfilled' });
            alert('Request marked as fulfilled!');
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this blood request? This action cannot be undone.')) return;
        try {
            await api.delete(`/blood-donation/requests/${id}`);
            navigate('/blood-donation');
        } catch (err) {
            alert('Failed to delete request');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center bg-white p-10 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Not Found</h2>
                    <Link to="/blood-donation" className="text-red-600 hover:text-red-700 font-medium">
                        ← Back to Blood Donation
                    </Link>
                </div>
            </div>
        );
    }

    const isOwner = user && request.requester && user._id === request.requester._id;
    const isUrgent = request.urgency === 'urgent' || request.urgency === 'critical';

    const statusConfig = {
        open: { bg: 'bg-green-100', text: 'text-green-700', icon: <HeartPulse size={16} />, label: 'Open' },
        fulfilled: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <CheckCircle size={16} />, label: 'Fulfilled' },
        cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', icon: <XCircle size={16} />, label: 'Cancelled' }
    };
    const status = statusConfig[request.status] || statusConfig.open;

    const urgencyConfig = {
        low: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Low' },
        medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium' },
        high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'High' },
        critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Critical' }
    };
    const urgencyStyle = urgencyConfig[request.urgency] || urgencyConfig.medium;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <Link
                    to="/blood-donation"
                    className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Blood Donation
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-red-500">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Blood Donation Request</h1>
                                        <div className="flex flex-wrap items-center gap-2 mb-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${status.bg} ${status.text}`}>
                                                {status.icon} {status.label}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${urgencyStyle.bg} ${urgencyStyle.text}`}>
                                                {urgencyStyle.label} Urgency
                                            </span>
                                        </div>
                                    </div>

                                    {/* Blood Group Badge */}
                                    <div className="flex flex-col items-center bg-red-50 px-6 py-4 rounded-xl border-2 border-red-200 shadow-md">
                                        <HeartPulse size={32} className="text-red-600 mb-2" />
                                        <div className="text-4xl font-extrabold text-red-700 leading-none">{request.bloodGroup}</div>
                                        <div className="text-xs font-medium text-red-500 mt-1">Needed</div>
                                    </div>
                                </div>

                                {/* Urgent Alert */}
                                {isUrgent && (
                                    <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle size={24} className="text-red-600 animate-pulse flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-extrabold text-red-700">URGENT REQUEST</p>
                                                <p className="text-xs text-red-600">Immediate blood donation needed!</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Quick Info Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="bg-indigo-50 rounded-lg p-4 text-center">
                                        <MapPin className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                                        <p className="text-xs text-gray-600">Location</p>
                                        <p className="font-semibold text-gray-900 text-sm">{request.location}</p>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                                        <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                        <p className="text-xs text-gray-600">Needed By</p>
                                        <p className="font-semibold text-gray-900 text-sm">
                                            {request.neededBy ? new Date(request.neededBy).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'ASAP'}
                                        </p>
                                    </div>

                                    <div className="bg-green-50 rounded-lg p-4 text-center">
                                        <Phone className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                        <p className="text-xs text-gray-600">Contact</p>
                                        <a href={`tel:${request.contactPhone}`} className="font-semibold text-gray-900 text-sm hover:text-green-600">
                                            {request.contactPhone}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Patient Information */}
                        {(request.patientName || request.patientAge) && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-indigo-600" />
                                    Patient Information
                                </h2>
                                <div className="space-y-2">
                                    {request.patientName && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Name:</span>
                                            <span className="text-sm font-semibold text-gray-900">{request.patientName}</span>
                                        </div>
                                    )}
                                    {request.patientAge && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Age:</span>
                                            <span className="text-sm font-semibold text-gray-900">{request.patientAge} years</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Hospital Information */}
                        {request.hospital && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Hospital className="w-5 h-5 text-indigo-600" />
                                    Hospital Information
                                </h2>
                                <p className="text-gray-700">{request.hospital}</p>
                            </div>
                        )}

                        {/* Case Details */}
                        {request.message && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-indigo-600" />
                                    Case Details
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{request.message}</p>
                            </div>
                        )}

                        {/* Comments Section */}
                        <CommentsSection postType="bloodrequest" postId={id} />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Requester Info Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Requested By</h3>
                            <PosterInfo user={request.requester} createdAt={request.createdAt} />

                            {/* Contact Details */}
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Phone className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="text-xs text-gray-600">Emergency Contact</p>
                                        <a href={`tel:${request.contactPhone}`} className="font-semibold text-gray-900 hover:text-green-600">
                                            {request.contactPhone}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 space-y-2">
                                {/* Help Button */}
                                {user && !isOwner && request.status === 'open' && (
                                    <Link
                                        to={`/chat/${request.requester._id}`}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                                    >
                                        <HeartPulse className="w-4 h-4" />
                                        I Can Help!
                                    </Link>
                                )}

                                {/* Contact Buttons */}
                                {user && !isOwner && request.requester && (
                                    <MessageButton recipientId={request.requester._id} />
                                )}

                                {/* Login Prompt */}
                                {!user && (
                                    <Link
                                        to="/login"
                                        className="w-full text-center block bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition"
                                    >
                                        Log in to Help
                                    </Link>
                                )}

                                {/* Owner Actions */}
                                {isOwner && (
                                    <>
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                                            <p className="text-sm text-blue-800">This is your request</p>
                                        </div>
                                        {request.status === 'open' && (
                                            <button
                                                onClick={handleMarkFulfilled}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                                            >
                                                <CheckCircle size={16} />
                                                Mark as Fulfilled
                                            </button>
                                        )}
                                        <button
                                            onClick={handleDelete}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                                        >
                                            <Trash2 size={16} />
                                            Delete Request
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Responses Count */}
                            {request.responses && request.responses.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-center gap-2 text-gray-600">
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="text-sm">{request.responses.length} response(s)</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BloodRequestDetails;
