import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canDelete } from '../utils/permissions';
import UserAvatar from './UserAvatar';
import api from '../api/axios';
import { Locate, Phone, Hospital, Calendar, AlertTriangle, CheckCircle, XCircle, HeartPulse, User, Trash2, ShieldCheck, MessageCircle } from 'lucide-react';

const RequestCard = ({ request, onUpdate }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isUrgent = request.urgency === 'urgent';
    const isOwner = user && request.requester && user._id === request.requester._id;
    const showDelete = canDelete(user, request.requester);

    const statusConfig = {
        active: { bg: 'bg-green-100', text: 'text-green-700', icon: <HeartPulse size={18} />, label: 'Active' },
        fulfilled: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <ShieldCheck size={18} />, label: 'Fulfilled' },
        cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', icon: <XCircle size={18} />, label: 'Cancelled' }
    };
    const status = statusConfig[request.status] || statusConfig.active;

    const handleMarkFulfilled = async () => {
        if (!confirm('Mark this request as fulfilled?')) return;
        try {
            await api.patch(
                `/blood-donation/requests/${request._id}/status`,
                { status: 'fulfilled' }
            );
            if (onUpdate) onUpdate();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this blood request?')) return;
        try {
            await api.delete(`/blood-donation/requests/${request._id}`);
            if (onUpdate) onUpdate();
        } catch (err) {
            alert('Failed to delete request');
        }
    };

    // Dynamic styling based on urgency
    const primaryClass = isUrgent ? 'border-red-500' : 'border-blue-500';
    const urgencyBarClass = isUrgent ? 'bg-gradient-to-r from-red-600 to-red-700 animate-pulse shadow-red-500/50' : 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-500/50';

    const handleCardClick = (e) => {
        // Don't navigate if clicking on buttons or links
        if (e.target.closest('button') || e.target.closest('a')) {
            return;
        }
        navigate(`/blood-donation/request/${request._id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className={`
                bg-white rounded-2xl shadow-xl 
                hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 
                overflow-hidden border-t-4 border-l-2 ${primaryClass} flex flex-col cursor-pointer
            `}
        >
            {/* Urgency Bar - Used as a clean accent top border */}
            <div className={`h-1.5 ${urgencyBarClass}`}></div>

            <div className="p-6 flex flex-col flex-grow">

                {/* 1. HEADER: Requester & Blood Group */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                    <div className="flex items-center gap-3">
                        <Link to={`/profile/${request.requester._id}`}>
                            <UserAvatar user={request.requester} size="md" />
                        </Link>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Requested By</p>
                            <Link
                                to={`/profile/${request.requester._id}`}
                                className="font-bold text-lg text-gray-900 hover:text-red-600 transition truncate"
                            >
                                {request.requester.name}
                            </Link>
                            <p className="text-xs text-gray-600">{request.requester.department}</p>
                        </div>
                    </div>

                    {/* Blood Group Needed (Prominent) */}
                    <div className="flex flex-col items-center bg-red-50/70 px-4 py-2 rounded-xl border border-red-200 shadow-sm">
                        <HeartPulse size={24} className="text-red-600" />
                        <div className="text-3xl font-extrabold text-red-700 leading-none mt-1">{request.bloodGroup}</div>
                        <div className="text-xs font-medium text-red-500 mt-1">Needed</div>
                    </div>
                </div>

                {/* 2. PATIENT INFO (Accentuated) */}
                <div className="rounded-xl p-4 mb-4 bg-gray-100/70 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <User size={20} className="text-gray-600" />
                        <h4 className="text-base font-extrabold text-gray-900">
                            Patient: {request.patientName}
                        </h4>
                    </div>
                    <div className="pl-7 space-y-0.5">
                        {request.patientAge && (
                            <p className="text-sm text-gray-700"><span className="font-medium">Age:</span> {request.patientAge} years</p>
                        )}
                    </div>
                </div>

                {/* 3. DETAILS GRID */}
                <div className="space-y-3 mb-5">

                    {/* Hospital & Location */}
                    <div className="flex items-start gap-3 bg-gray-50 px-3 py-2 rounded-lg">
                        <Hospital size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <p className="text-xs text-gray-600">Hospital</p>
                            <p className="text-sm font-semibold text-gray-900">{request.hospital}</p>
                            <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                                <Locate size={12} /> {request.location}
                            </p>
                        </div>
                    </div>

                    {/* Contact & Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                            <Phone size={18} className="text-green-600 flex-shrink-0" />
                            <a href={`tel:${request.contactNumber}`} className="text-sm font-medium text-gray-700 hover:text-green-700 transition">
                                {request.contactNumber}
                            </a>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                            <Calendar size={18} className="text-gray-500 flex-shrink-0" />
                            <span className="text-xs text-gray-600 font-medium">
                                Needed by: {new Date(request.requiredDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. URGENCY & STATUS BADGES */}
                <div className="flex gap-3 mb-4 mt-auto">
                    {isUrgent && (
                        <div className="flex-1 bg-red-100 border border-red-300 rounded-lg p-3 shadow-md">
                            <div className="flex items-center justify-center gap-2">
                                <AlertTriangle size={20} className="text-red-600 animate-pulse" />
                                <span className="text-sm font-extrabold text-red-700">URGENT CALL</span>
                            </div>
                        </div>
                    )}
                    <div className={`flex-1 ${status.bg} rounded-lg p-3 flex items-center justify-center gap-1.5 border ${status.bg} border-b-2`}>
                        {status.icon}
                        <p className={`text-sm font-bold ${status.text}`}>
                            {status.label}
                        </p>
                    </div>
                </div>

                {/* 5. Description */}
                {request.description && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">Case Details:</p>
                        <p className="text-sm text-gray-700 leading-relaxed mt-1">{request.description}</p>
                    </div>
                )}


                {/* 6. Action Buttons (Functionality Unchanged) */}
                {isOwner ? (
                    <div className="flex gap-3 mt-2">
                        {request.status === 'active' && isOwner && (
                            <button
                                onClick={handleMarkFulfilled}
                                className="flex-1 flex items-center justify-center gap-2 text-center bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold transition shadow-lg text-sm"
                            >
                                <CheckCircle size={20} /> Mark Fulfilled
                            </button>
                        )}
                        {showDelete && (
                            <button
                                onClick={handleDelete}
                                className={`flex-shrink-0 flex items-center justify-center gap-2 ${request.status === 'active' && isOwner ? 'w-1/3' : 'w-full'} text-center bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold transition shadow-lg text-sm`}
                            >
                                <Trash2 size={20} /> Delete
                            </button>
                        )}
                    </div>
                ) : user ? (
                    <div className="flex gap-2">
                        <Link
                            to={`/blood-donation/request/${request._id}`}
                            className="flex-1 text-center flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-lg text-sm"
                        >
                            View Details
                        </Link>
                        <Link
                            to={`/chat/${request.requester._id}`}
                            className="flex-1 text-center flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition shadow-lg text-sm"
                        >
                            <MessageCircle size={18} /> Help
                        </Link>
                    </div>
                ) : (
                    <Link
                        to={`/blood-donation/request/${request._id}`}
                        className="block w-full text-center flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-lg text-base"
                    >
                        View Details
                    </Link>
                )}
            </div>
        </div>
    );
};

export default RequestCard;