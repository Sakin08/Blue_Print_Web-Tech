import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import eventsApi from '../api/events';

const ActivityFeed = () => {
    const [activities, setActivities] = useState([]);
    const { socket, eventUpdates } = useSocket();

    useEffect(() => {
        loadRecentActivity();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('newNotification', (notification) => {
                addActivity({
                    type: notification.type,
                    message: notification.message,
                    timestamp: new Date(),
                    link: notification.link
                });
            });

            return () => socket.off('newNotification');
        }
    }, [socket]);

    useEffect(() => {
        if (eventUpdates) {
            const { type, data } = eventUpdates;
            if (type === 'created') {
                addActivity({
                    type: 'event_created',
                    message: `New event: ${data.title}`,
                    timestamp: new Date(),
                    link: '/events'
                });
            } else if (type === 'interestUpdated') {
                addActivity({
                    type: 'event_interest',
                    message: `${data.interestedCount} people interested in an event`,
                    timestamp: new Date(),
                    link: '/events'
                });
            }
        }
    }, [eventUpdates]);

    const loadRecentActivity = async () => {
        try {
            const res = await eventsApi.getAll();
            const recentEvents = res.data.slice(0, 5).map(event => ({
                type: 'event_created',
                message: `${event.user?.name} posted: ${event.title}`,
                timestamp: new Date(event.createdAt),
                link: '/events'
            }));
            setActivities(recentEvents);
        } catch (err) {
            console.error('Failed to load activity:', err);
        }
    };

    const addActivity = (activity) => {
        setActivities(prev => [activity, ...prev].slice(0, 10));
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'event_created':
                return '📅';
            case 'event_interest':
                return '❤️';
            case 'new_message':
                return '💬';
            case 'item_posted':
                return '🛍️';
            case 'housing_posted':
                return '🏠';
            default:
                return '🔔';
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const activityDate = new Date(date);
        const diffMs = now - activityDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return activityDate.toLocaleDateString();
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">🔥 Live Activity</h2>
                <span className="flex items-center gap-1 text-sm text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live
                </span>
            </div>

            <div className="space-y-3">
                {activities.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No recent activity</p>
                ) : (
                    activities.map((activity, index) => (
                        <Link
                            key={index}
                            to={activity.link}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition group animate-fade-in"
                        >
                            <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 group-hover:text-indigo-600 transition">
                                    {activity.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{formatTime(activity.timestamp)}</p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
