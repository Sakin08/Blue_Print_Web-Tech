import { useState, useEffect } from 'react';
import eventsApi from '../api/events.js';
import { useAuth } from '../context/AuthContext';
import { canDelete } from '../utils/permissions';
import PosterInfo from './PosterInfo';
import ReportModal from './ReportModal';
import ShareButton from './ShareButton';
import RSVPButton from './RSVPButton';
import SaveButton from './SaveButton';

const EventCard = ({ event, onUpdate }) => {
    const { user } = useAuth();
    const [timeLeft, setTimeLeft] = useState('');
    const [status, setStatus] = useState({ text: '', color: '' });
    const [interestedCount, setInterestedCount] = useState(event.interested?.length || 0);
    const [isInterested, setIsInterested] = useState(
        event.interested?.some(u => u._id === user?._id || u === user?._id) || false
    );
    const [showReportModal, setShowReportModal] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const eventDate = new Date(event.date);
            const diff = eventDate - now;

            if (diff < 0) {
                setStatus({ text: 'Past Event', color: 'bg-gray-100 text-gray-600' });
                setTimeLeft('Event has ended');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days === 0 && hours === 0 && minutes < 60) {
                setStatus({ text: 'Starting Soon!', color: 'bg-red-100 text-red-700 animate-pulse' });
                setTimeLeft(`${minutes}m ${seconds}s`);
            } else if (days === 0) {
                setStatus({ text: 'Today!', color: 'bg-green-100 text-green-700' });
                setTimeLeft(`${hours}h ${minutes}m`);
            } else if (days === 1) {
                setStatus({ text: 'Tomorrow', color: 'bg-blue-100 text-blue-700' });
                setTimeLeft(`${hours}h ${minutes}m`);
            } else if (days <= 7) {
                setStatus({ text: `In ${days} days`, color: 'bg-yellow-100 text-yellow-700' });
                setTimeLeft(`${days}d ${hours}h`);
            } else {
                setStatus({ text: `In ${days} days`, color: 'bg-purple-100 text-purple-700' });
                setTimeLeft(`${days} days`);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [event.date]);

    const mainImage = event.images && event.images.length > 0 ? event.images[0] : null;

    const handleInterested = async () => {
        if (!user) {
            alert('Please login to mark interest');
            return;
        }

        try {
            const res = await eventsApi.markInterested(event._id);
            if (res?.data) {
                setInterestedCount(res.data.interested.length);
                setIsInterested(res.data.interested.some(u => u._id === user._id || u === user._id));
                if (onUpdate) onUpdate(res.data);
            }
        } catch (err) {
            console.error('Error marking interest:', err);
            alert('Failed to update interest');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            return;
        }

        try {
            await eventsApi.remove(event._id);
            if (onUpdate) onUpdate();
            alert('Event deleted successfully');
        } catch (err) {
            console.error('Error deleting event:', err);
            alert('Failed to delete event');
        }
    };

    const isOwner = user && event.user && user._id === event.user._id;
    const showDelete = canDelete(user, event.user);

    return (
        <>
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                {mainImage && (
                    <div className="relative h-64 overflow-hidden">
                        <img src={mainImage} alt={event.title} className="w-full h-full object-cover" />
                        {event.images.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                                📷 {event.images.length}
                            </div>
                        )}
                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                            {status.text}
                        </div>
                        {showDelete ? (
                            <button
                                onClick={handleDelete}
                                className="absolute top-3 left-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition shadow-lg"
                                title="Delete this event"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        ) : user && (
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="absolute top-3 left-3 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full transition"
                                title="Report this event"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                <div className="md:flex">
                    {/* Date Display */}
                    <div className="md:w-48 bg-gradient-to-br from-purple-500 to-indigo-600 p-6 flex flex-col items-center justify-center text-white">
                        <div className="text-5xl font-bold">{new Date(event.date).getDate()}</div>
                        <div className="text-xl font-semibold mt-2">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-sm opacity-90">{new Date(event.date).getFullYear()}</div>
                        <div className="mt-4 text-center">
                            <div className="text-xs opacity-75">Time</div>
                            <div className="text-sm font-semibold">
                                {new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </div>
                        </div>
                    </div>

                    {/* Event Details */}
                    <div className="p-6 flex-1">
                        {!mainImage && (
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-2xl font-bold text-gray-900 flex-1">{event.title}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-3 ${status.color}`}>
                                    {status.text}
                                </span>
                            </div>
                        )}
                        {mainImage && (
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{event.title}</h3>
                        )}

                        {/* Countdown Timer */}
                        {timeLeft && timeLeft !== 'Event has ended' && (
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 mb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Countdown:</span>
                                    </div>
                                    <span className="text-lg font-bold text-purple-600">{timeLeft}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center text-gray-600 mb-3">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-medium">{event.location}</span>
                        </div>

                        <p className="text-gray-700 leading-relaxed">{event.description}</p>

                        {/* RSVP Section */}
                        <RSVPButton event={event} onUpdate={onUpdate} />

                        {/* Interest Count Display */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">
                                    {interestedCount} {interestedCount === 1 ? 'person' : 'people'} interested
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <ShareButton
                                    title={event.title}
                                    description={event.description}
                                    url={`${window.location.origin}/events`}
                                />
                                <SaveButton postId={event._id} postType="event" />
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <PosterInfo user={event.user} createdAt={event.createdAt} />

                            <div className="flex flex-col sm:flex-row gap-2 mt-3">
                                {user ? (
                                    <button
                                        onClick={handleInterested}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${isInterested ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-purple-600 text-white hover:bg-purple-700'
                                            }`}
                                    >
                                        {isInterested ? (
                                            <>
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                </svg>
                                                Interested
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                Mark Interested
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleInterested}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-400 text-white hover:bg-gray-500 transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        Login to Mark Interest
                                    </button>
                                )}

                                {/* Delete Button */}
                                {showDelete && (
                                    <button
                                        onClick={handleDelete}
                                        className="sm:flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition whitespace-nowrap"
                                        title="Delete event"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                reportedItem={event._id}
                reportedUser={event.user?._id}
                itemType="event"
            />
        </>
    );
};

export default EventCard;
