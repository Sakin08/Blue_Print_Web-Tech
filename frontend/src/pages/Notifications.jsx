import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import notificationsApi from '../api/notifications';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const navigate = useNavigate();
    const { socket } = useSocket();

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('newNotification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
            });

            return () => socket.off('newNotification');
        }
    }, [socket]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await notificationsApi.getAll();
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }
        setLoading(false);
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationsApi.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await notificationsApi.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('Delete all notifications? This action cannot be undone.')) return;
        try {
            await notificationsApi.deleteAll();
            setNotifications([]);
        } catch (err) {
            console.error('Failed to delete all notifications:', err);
            alert('Failed to delete notifications');
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification._id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            'event_created': '📅',
            'event_posted': '📅',
            'event_interest': '❤️',
            'new_message': '💬',
            'item_posted': '🛍️',
            'buysell_posted': '🛍️',
            'housing_posted': '🏠',
            'job_posted': '💼',
            'food_posted': '🍕',
            'lostfound_posted': '🔍',
            'studygroup_posted': '📚',
            'comment_added': '💬',
            'post_liked': '❤️',
            'like_added': '❤️',
            'rsvp_added': '✅',
            'interested_added': '✅',
            'join_added': '👥',
            'blood_posted': '🩸',
            'blood_request': '🩸',
            'blood_response': '🩸',
            'admin_announcement': '📢',
            'admin_warning': '⚠️',
            'admin_info': 'ℹ️',
            'system_alert': '🔔',
        };
        return icons[type] || '🔔';
    };

    const getNotificationStyle = (type) => {
        if (type.startsWith('admin_warning') || type === 'system_alert') {
            return 'border-l-4 border-red-500 bg-red-50';
        }
        if (type.startsWith('admin_announcement')) {
            return 'border-l-4 border-purple-500 bg-purple-50';
        }
        if (type.startsWith('admin_')) {
            return 'border-l-4 border-blue-500 bg-blue-50';
        }
        return '';
    };

    const formatTime = (date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now - notifDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return notifDate.toLocaleDateString();
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'read') return n.read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                    <p className="text-gray-600">
                        {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>

                {/* Actions Bar */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Filter Tabs */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'all'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                All ({notifications.length})
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'unread'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Unread ({unreadCount})
                            </button>
                            <button
                                onClick={() => setFilter('read')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'read'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Read ({notifications.length - unreadCount})
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                                >
                                    Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleDeleteAll}
                                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                >
                                    Delete all
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
                        <p className="text-gray-600">
                            {filter === 'unread' ? "You don't have any unread notifications" :
                                filter === 'read' ? "You don't have any read notifications" :
                                    "You don't have any notifications yet"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition cursor-pointer group ${!notification.read ? 'bg-indigo-50 border-indigo-200' : ''
                                    } ${getNotificationStyle(notification.type)}`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon/Avatar */}
                                    {notification.sender?.profilePicture ? (
                                        <img
                                            src={notification.sender.profilePicture}
                                            alt={notification.sender.name}
                                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                        />
                                    ) : notification.sender ? (
                                        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                                            {notification.sender.name?.charAt(0).toUpperCase()}
                                        </div>
                                    ) : (
                                        <div className="text-3xl flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-base font-semibold text-gray-900 mb-1">
                                                    {notification.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {formatTime(notification.createdAt)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {!notification.read && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkAsRead(notification._id);
                                                        }}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                                                        title="Mark as read"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteNotification(notification._id);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete notification"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
