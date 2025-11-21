import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

    const showDelete = canDelete(user, event.user);

    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300">
                {/* Image Section */}
                {mainImage && (
                    <div className="relative h-64 w-full overflow-hidden">
                        <img src={mainImage} alt={event.title} className="w-full h-full object-cover" />
                        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                            {status.text}
                        </span>
                        {showDelete ? (
                            <button
                                onClick={handleDelete}
                                className="absolute top-3 left-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="absolute top-3 left-3 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                {/* Content Section */}
                <div className="p-6 flex flex-col gap-4">
                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 truncate">{event.title}</h3>

                    {/* Date & Location */}
                    <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
                        <div className="flex items-center gap-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-7H3v7a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{event.location}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 line-clamp-3">{event.description}</p>

                    {/* Countdown */}
                    {timeLeft && timeLeft !== 'Event has ended' && (
                        <div className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg inline-block text-sm font-semibold">
                            ⏳ {timeLeft}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        <RSVPButton event={event} onUpdate={onUpdate} />
                        <button
                            onClick={handleInterested}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${isInterested ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                        >
                            {isInterested ? 'Interested' : 'Mark Interested'}
                        </button>
                        <ShareButton title={event.title} description={event.description} url={`${window.location.origin}/events`} />
                        <SaveButton postId={event._id} postType="event" />
                        {showDelete && (
                            <>
                                <Link
                                    to={`/events/edit/${event._id}`}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>

                    {/* Poster Info */}
                    <div className="mt-4">
                        <PosterInfo user={event.user} createdAt={event.createdAt} />
                    </div>
                </div>
            </div>

            {/* Report Modal */}
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
