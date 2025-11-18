import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import eventsApi from '../api/events';

const TrendingSection = () => {
    const [trendingEvents, setTrendingEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTrending();
    }, []);

    const loadTrending = async () => {
        try {
            const res = await eventsApi.getAll();
            // Get top 3 most popular events
            const sorted = res.data
                .sort((a, b) => (b.interested?.length || 0) - (a.interested?.length || 0))
                .slice(0, 3);
            setTrendingEvents(sorted);
        } catch (err) {
            console.error('Failed to load trending:', err);
        }
        setLoading(false);
    };

    if (loading || trendingEvents.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <h2 className="text-2xl font-bold">🔥 Trending Now</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trendingEvents.map((event, index) => (
                    <Link
                        key={event._id}
                        to="/events"
                        className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition group"
                    >
                        <div className="flex items-start gap-3">
                            <div className="text-3xl font-bold text-white/50">#{index + 1}</div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white truncate group-hover:text-yellow-300 transition">
                                    {event.title}
                                </h3>
                                <p className="text-sm text-white/80 mt-1">
                                    📍 {event.location}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                        </svg>
                                        {event.interested?.length || 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                        {event.views || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default TrendingSection;
