import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [eventUpdates, setEventUpdates] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001', {
                withCredentials: true,
            });

            newSocket.on('connect', () => {
                console.log('Socket connected');
                newSocket.emit('userOnline', user._id);
            });

            newSocket.on('userStatusChange', ({ userId, online }) => {
                setOnlineUsers(prev =>
                    online ? [...prev, userId] : prev.filter(id => id !== userId)
                );
            });

            // Listen for event updates
            newSocket.on('eventUpdate', (update) => {
                console.log('Event update received:', update);
                setEventUpdates(update);
            });

            setSocket(newSocket);

            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, eventUpdates }}>
            {children}
        </SocketContext.Provider>
    );
};
