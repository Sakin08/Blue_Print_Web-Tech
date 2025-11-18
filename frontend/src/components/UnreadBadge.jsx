import { useEffect, useState } from 'react';
import chatApi from '../api/chat.js';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const UnreadBadge = () => {
    const [count, setCount] = useState(0);
    const { socket } = useSocket();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            loadCount();
        }
    }, [user]);

    useEffect(() => {
        if (!socket) return;

        socket.on('newMessageNotification', () => {
            loadCount();
        });

        socket.on('receiveMessage', () => {
            loadCount();
        });

        return () => {
            socket.off('newMessageNotification');
            socket.off('receiveMessage');
        };
    }, [socket]);

    const loadCount = async () => {
        try {
            const res = await chatApi.getUnreadCount();
            setCount(res.data.count);
        } catch (err) {
            console.error('Failed to load unread count:', err);
        }
    };

    if (count === 0) return null;

    return (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {count > 9 ? '9+' : count}
        </span>
    );
};

export default UnreadBadge;
