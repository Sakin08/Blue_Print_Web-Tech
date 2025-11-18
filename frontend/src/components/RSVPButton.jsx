import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const RSVPButton = ({ event, onUpdate }) => {
    const { user } = useAuth();
    const [rsvpStatus, setRsvpStatus] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [guestCount, setGuestCount] = useState(1);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            checkRSVP();
        }
    }, [user, event._id]);

    const checkRSVP = async () => {
        try {
            const res = await axios.get(`${API_URL}/rsvp/my-rsvps`, {
                withCredentials: true
            });
            const myRsvp = res.data.find(r => r.event._id === event._id);
            if (myRsvp) {
                setRsvpStatus(myRsvp.status);
            }
        } catch (err) {
            console.error('Failed to check RSVP:', err);
        }
    };

    const handleRSVP = async (status) => {
        if (!user) {
            alert('Please login to RSVP');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/rsvp`, {
                eventId: event._id,
                status,
                guestCount,
                notes
            }, { withCredentials: true });

            setRsvpStatus(status);
            setShowModal(false);
            if (onUpdate) {
                onUpdate(res.data.event);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to RSVP');
        }
        setLoading(false);
    };

    const handleCancelRSVP = async () => {
        setLoading(true);
        try {
            await axios.delete(`${API_URL}/rsvp/event/${event._id}`, {
                withCredentials: true
            });
            setRsvpStatus(null);
            if (onUpdate) {
                const updatedEvent = { ...event, rsvpCount: Math.max(0, event.rsvpCount - 1) };
                onUpdate(updatedEvent);
            }
        } catch (err) {
            alert('Failed to cancel RSVP');
        }
        setLoading(false);
    };

    const isFull = event.capacity > 0 && event.rsvpCount >= event.capacity;

    if (!event.requiresRSVP) {
        return null;
    }

    return (
        <>
            <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-700">
                        {event.capacity > 0 ? (
                            <>
                                <span className="text-indigo-600 font-bold">{event.rsvpCount}</span>
                                <span className="text-gray-500"> / {event.capacity} spots filled</span>
                            </>
                        ) : (
                            <>
                                <span className="text-indigo-600 font-bold">{event.rsvpCount}</span>
                                <span className="text-gray-500"> people going</span>
                            </>
                        )}
                    </div>
                    {rsvpStatus && (
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${rsvpStatus === 'going' ? 'bg-green-100 text-green-700' :
                                rsvpStatus === 'maybe' ? 'bg-yellow-100 text-yellow-700' :
                                    rsvpStatus === 'waitlist' ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-100 text-gray-700'
                            }`}>
                            {rsvpStatus === 'going' ? '✓ Going' :
                                rsvpStatus === 'maybe' ? '? Maybe' :
                                    rsvpStatus === 'waitlist' ? '⏳ Waitlist' :
                                        'Not Going'}
                        </span>
                    )}
                </div>

                {!rsvpStatus ? (
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={isFull && !event.waitlistEnabled}
                        className={`w-full py-2 rounded-lg font-semibold transition ${isFull && !event.waitlistEnabled
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                    >
                        {isFull ? (event.waitlistEnabled ? 'Join Waitlist' : 'Event Full') : 'RSVP Now'}
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex-1 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition"
                        >
                            Change RSVP
                        </button>
                        <button
                            onClick={handleCancelRSVP}
                            disabled={loading}
                            className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {/* RSVP Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">RSVP to {event.title}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Response
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleRSVP('going')}
                                        disabled={loading}
                                        className="py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        ✓ Going
                                    </button>
                                    <button
                                        onClick={() => handleRSVP('maybe')}
                                        disabled={loading}
                                        className="py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition disabled:opacity-50"
                                    >
                                        ? Maybe
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Number of Guests
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={guestCount}
                                    onChange={(e) => setGuestCount(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    rows="2"
                                    placeholder="Any special requirements?"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full mt-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default RSVPButton;
