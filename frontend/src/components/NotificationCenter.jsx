import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import notificationsApi from '../api/notifications';

const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { socket } = useSocket();

    useEffect(() => {
        loadNotifications();
        loadUnreadCount();
    }, []);

    // Listen for real-time notifications
    useEffect(() => {
        if (socket) {
            socket.on('newNotification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);

                // Show browser notification if permitted
                if (Notification.permission === 'granted') {
                    new Notification(notification.title, {
                        body: notification.message,
                        icon: '/logo.png'
                    });
                }
            });

            return () => socket.off('newNotification');
        }
    }, [socket]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const loadUnreadCount = async () => {
        try {
            const res = await notificationsApi.getUnreadCount();
            setUnreadCount(res.data.count);
        } catch (err) {
            console.error('Failed to load unread count:', err);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationsApi.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification._id);
        }
        if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };

    const handleDeleteNotification = async (e, id) => {
        e.stopPropagation();
        try {
            await notificationsApi.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            const deletedNotif = notifications.find(n => n._id === id);
            if (deletedNotif && !deletedNotif.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('Delete all notifications? This action cannot be undone.')) return;
        try {
            await notificationsApi.deleteAll();
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to delete all notifications:', err);
            alert('Failed to delete notifications');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'event_created':
            case 'event_posted':
                return '📅';
            case 'event_interest':
                return '❤️';
            case 'new_message':
                return '💬';
            case 'item_posted':
            case 'buysell_posted':
                return '🛍️';
            case 'housing_posted':
                return '🏠';
            case 'job_posted':
                return '💼';
            case 'food_posted':
                return '🍕';
            case 'lostfound_posted':
                return '🔍';
            case 'studygroup_posted':
                return '📚';
            case 'comment_added':
                return '💬';
            case 'post_liked':
            case 'like_added':
                return '❤️';
            case 'rsvp_added':
            case 'interested_added':
                return '✅';
            case 'join_added':
                return '👥';
            case 'blood_posted':
            case 'blood_request':
            case 'blood_response':
                return '🩸';
            case 'admin_announcement':
                return '📢';
            case 'admin_warning':
                return '⚠️';
            case 'admin_info':
                return 'ℹ️';
            case 'system_alert':
                return '🔔';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type) => {
        if (type.startsWith('admin_warning') || type === 'system_alert') {
            return 'bg-red-50 border-l-4 border-red-500';
        }
        if (type.startsWith('admin_announcement')) {
            return 'bg-purple-50 border-l-4 border-purple-500';
        }
        if (type.startsWith('admin_')) {
            return 'bg-blue-50 border-l-4 border-blue-500';
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

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            {notifications.length > 0 && (
                                <div className="flex gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button
                                        onClick={handleDeleteAll}
                                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Delete all
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={() => {
                                    navigate('/notifications');
                                    setIsOpen(false);
                                }}
                                className="text-xs text-gray-600 hover:text-gray-900 font-medium"
                            >
                                View all →
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification, index) => (
                                <div
                                    key={notification._id || `notification-${index}`}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition group ${!notification.read ? 'bg-indigo-50' : ''
                                        } ${getNotificationColor(notification.type)}`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* User Profile Picture or Icon */}
                                        {notification.sender?.profilePicture ? (
                                            <img
                                                src={notification.sender.profilePicture}
                                                alt={notification.sender.name}
                                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                            />
                                        ) : notification.sender ? (
                                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                {notification.sender.name?.charAt(0).toUpperCase()}
                                            </div>
                                        ) : (
                                            <span className="text-2xl flex-shrink-0">{getNotificationIcon(notification.type)}</span>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                            )}
                                            <button
                                                onClick={(e) => handleDeleteNotification(e, notification._id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition"
                                                title="Delete notification"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
