import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import chatApi from '../api/chat.js';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
// Importing Lucide icons for a modern, consistent look
import { Search, Send, Paperclip, X, User, MessageSquare, Image, File, CheckCheck } from 'lucide-react';

const Messages = () => {
    // --- State and Context (LOGIC UNCHANGED) ---
    const [chats, setChats] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    const { socket } = useSocket();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    // --- Effects (LOGIC UNCHANGED) ---
    useEffect(() => {
        loadChats();
    }, []);

    // Handle userId from URL query parameter
    useEffect(() => {
        const userId = searchParams.get('userId');
        if (userId && chats.length > 0) {
            const chat = chats.find(c => c.otherUser._id === userId);
            if (chat) {
                setSelectedChat(chat);
            }
        }
    }, [searchParams, chats]);

    useEffect(() => {
        if (!socket) return;
        socket.on('newMessageNotification', () => {
            loadChats();
        });

        // Listen for online users updates
        socket.on('onlineUsers', (users) => {
            setOnlineUsers(new Set(users));
        });

        socket.on('userOnline', (userId) => {
            setOnlineUsers(prev => new Set([...prev, userId]));
        });

        socket.on('userOffline', (userId) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        });

        return () => {
            socket.off('newMessageNotification');
            socket.off('onlineUsers');
            socket.off('userOnline');
            socket.off('userOffline');
        };
    }, [socket]);

    useEffect(() => {
        if (!selectedChat || !socket) return;
        const chatId = [user._id, selectedChat.otherUser._id].sort().join(':');
        socket.emit('joinRoom', chatId);
        socket.on('receiveMessage', (message) => {
            setMessages(prev => [...prev, message]);
            scrollToBottom();
        });
        socket.on('userTyping', ({ isTyping }) => {
            setIsTyping(isTyping);
        });
        socket.on('messagesRead', () => {
            setMessages(prev => prev.map(msg => ({ ...msg, read: true })));
        });
        socket.on('messageDeleted', ({ messageId }) => {
            setMessages(prev => prev.map(msg =>
                msg._id === messageId
                    ? { ...msg, deletedForEveryone: true }
                    : msg
            ));
        });
        socket.emit('markAsRead', { chatId, userId: user._id });
        loadMessages(selectedChat.otherUser._id);
        return () => {
            socket.off('receiveMessage');
            socket.off('userTyping');
            socket.off('messagesRead');
            socket.off('messageDeleted');
        };
    }, [selectedChat, socket]);

    // --- Handlers (LOGIC UNCHANGED) ---
    const loadChats = async () => {
        try {
            const res = await chatApi.getRecentChats();
            setChats(res.data);
        } catch (err) {
            console.error('Failed to load chats:', err);
        }
    };

    const loadMessages = async (userId) => {
        try {
            const res = await chatApi.getChatHistory(userId);
            setMessages(res.data);
            scrollToBottom();
        } catch (err) {
            console.error('Failed to load messages:', err);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedFile(file);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const [showDeleteMenu, setShowDeleteMenu] = useState(null);

    const handleDeleteForMe = async (messageId) => {
        try {
            await chatApi.deleteMessageForMe(messageId);
            setMessages(prev => prev.map(msg =>
                msg._id === messageId
                    ? { ...msg, deletedForMe: true }
                    : msg
            ));
            setShowDeleteMenu(null);
        } catch (err) {
            console.error('Failed to delete message:', err);
            alert('Failed to delete message');
        }
    };

    const handleDeleteForEveryone = async (messageId) => {
        try {
            await chatApi.deleteMessageForEveryone(messageId);
            setMessages(prev => prev.map(msg =>
                msg._id === messageId
                    ? { ...msg, deletedForEveryone: true }
                    : msg
            ));
            setShowDeleteMenu(null);

            // Emit socket event to notify other user
            if (socket && selectedChat) {
                const chatId = [user._id, selectedChat.otherUser._id].sort().join(':');
                socket.emit('messageDeleted', { chatId, messageId });
            }
        } catch (err) {
            console.error('Failed to delete message:', err);
            alert('Failed to delete message');
        }
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await chatApi.uploadFile(formData);
        return res.data;
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !socket || !selectedChat) return;
        const chatId = [user._id, selectedChat.otherUser._id].sort().join(':');
        setUploading(true);
        try {
            let attachments = [];
            let messageType = 'text';
            if (selectedFile) {
                const fileData = await uploadFile(selectedFile);
                attachments = [fileData];
                messageType = selectedFile.type.startsWith('image/') ? 'image' : 'file';
            }
            socket.emit('sendMessage', {
                chatId,
                senderId: user._id,
                receiverId: selectedChat.otherUser._id,
                message: newMessage.trim(),
                messageType,
                attachments,
            });
            setNewMessage('');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            socket.emit('typing', { chatId, userId: user._id, isTyping: false });
        } catch (error) {
            alert('Failed to send message');
        } finally {
            setUploading(false);
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (!socket || !selectedChat) return;
        const chatId = [user._id, selectedChat.otherUser._id].sort().join(':');
        socket.emit('typing', { chatId, userId: user._id, isTyping: true });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing', { chatId, userId: user._id, isTyping: false });
        }, 1000);
    };

    // --- Helper Functions (Visual Refinements) ---
    const formatTime = (date) => {
        const now = new Date();
        const msgDate = new Date(date);
        const diffMs = now - msgDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return 'Now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return msgDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    };

    const formatMessageTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const filteredChats = chats.filter(chat =>
        chat.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
    };

    const getAttachmentIcon = (type) => {
        if (type === 'image') return <Image size={18} />;
        return <File size={18} />;
    };

    // Prevent body scroll on mount
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // --- Render Component ---
    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-100 overflow-hidden">

            {/* 1. CHAT LIST SIDEBAR */}
            <div className={`
                ${selectedChat ? 'hidden' : 'flex'} 
                w-full md:w-96 bg-white border-r border-gray-200 
                flex-col shadow-lg md:shadow-none
            `}>
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h1 className="text-2xl font-extrabold text-indigo-800 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6" /> Messages
                    </h1>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-gray-300 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredChats.length === 0 ? (
                        <div className="text-center text-gray-500 mt-12 px-6">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-semibold">No recent conversations</p>
                            <p className="text-sm mt-1 text-gray-400">Start connecting with other users!</p>
                        </div>
                    ) : (
                        <div>
                            {filteredChats.map(chat => (
                                <button
                                    key={chat.chatId}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`w-full p-4 border-b border-gray-100 transition text-left 
                                        ${selectedChat?.chatId === chat.chatId ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-shrink-0">
                                            {chat.otherUser.profilePicture ? (
                                                <img
                                                    src={chat.otherUser.profilePicture.startsWith('http') ? chat.otherUser.profilePicture : `http://localhost:5001${chat.otherUser.profilePicture}`}
                                                    alt={chat.otherUser.name}
                                                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                                    {getInitials(chat.otherUser.name)}
                                                </div>
                                            )}
                                            {onlineUsers.has(chat.otherUser._id) && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h3 className="font-semibold text-gray-900 truncate mr-2">{chat.otherUser.name}</h3>
                                                <span className="text-xs text-gray-500 flex-shrink-0">{formatTime(chat.lastMessageTime)}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">
                                                {chat.lastMessage || (chat.lastMessageType === 'image' ? 'Image 🖼️' : 'File 📎')}
                                            </p>
                                        </div>
                                        {chat.unreadCount > 0 && (
                                            <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 ml-2">
                                                {chat.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. CHAT WINDOW */}
            <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-gray-100`}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-4 shadow-md flex-shrink-0">
                            <button
                                onClick={() => setSelectedChat(null)}
                                className="md:hidden text-indigo-600 hover:text-indigo-700"
                                title="Back to Chats"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                            <button
                                onClick={() => navigate(`/profile/${selectedChat.otherUser._id}`)}
                                className="relative hover:opacity-90 transition-opacity"
                                title="View profile"
                            >
                                {selectedChat.otherUser.profilePicture ? (
                                    <img
                                        src={selectedChat.otherUser.profilePicture.startsWith('http') ? selectedChat.otherUser.profilePicture : `http://localhost:5001${selectedChat.otherUser.profilePicture}`}
                                        alt={selectedChat.otherUser.name}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                        {getInitials(selectedChat.otherUser.name)}
                                    </div>
                                )}
                                {onlineUsers.has(selectedChat.otherUser._id) && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                )}
                            </button>
                            <div>
                                <button
                                    onClick={() => navigate(`/profile/${selectedChat.otherUser._id}`)}
                                    className="font-bold text-gray-900 hover:text-indigo-600 transition-colors text-lg"
                                >
                                    {selectedChat.otherUser.name}
                                </button>
                                {isTyping ? (
                                    <p className="text-xs text-green-500 animate-pulse font-semibold">typing...</p>
                                ) : onlineUsers.has(selectedChat.otherUser._id) ? (
                                    <p className="text-xs text-green-600 font-medium">Online</p>
                                ) : (
                                    <p className="text-xs text-gray-500">Offline</p>
                                )}
                            </div>
                        </div>

                        {/* Message Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500 pt-16">
                                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">Start the conversation!</p>
                                    <p className="text-sm mt-1 text-gray-400">Your messages will appear here.</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isOwn = msg.senderId._id === user._id;
                                    const attachment = msg.attachments && msg.attachments.length > 0 ? msg.attachments[0] : null;

                                    return (
                                        <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative`}>
                                            <div className={`
                                                max-w-[80%] lg:max-w-[60%] p-3 rounded-xl relative
                                                ${isOwn ? 'bg-indigo-600 text-white rounded-br-none shadow-md' : 'bg-white text-gray-900 rounded-bl-none shadow-lg border border-gray-200'}
                                            `}>
                                                {/* Delete menu button - for own messages show both options, for received messages show only "Delete for me" */}
                                                {!msg.deletedForMe && !msg.deletedForEveryone && (
                                                    <div className={`absolute ${isOwn ? '-left-8' : '-right-8'} top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                        <button
                                                            onClick={() => setShowDeleteMenu(showDeleteMenu === msg._id ? null : msg._id)}
                                                            className="bg-gray-700 hover:bg-gray-800 text-white p-1.5 rounded-full shadow-lg"
                                                            title="Delete options"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>

                                                        {/* Delete dropdown menu */}
                                                        {showDeleteMenu === msg._id && (
                                                            <>
                                                                <div
                                                                    className="fixed inset-0 z-10"
                                                                    onClick={() => setShowDeleteMenu(null)}
                                                                ></div>
                                                                <div className={`absolute ${isOwn ? 'right-full mr-2' : 'left-full ml-2'} top-0 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20 w-40`}>
                                                                    <button
                                                                        onClick={() => handleDeleteForMe(msg._id)}
                                                                        className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2 whitespace-nowrap"
                                                                    >
                                                                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        Delete for me
                                                                    </button>
                                                                    {isOwn && (
                                                                        <button
                                                                            onClick={() => handleDeleteForEveryone(msg._id)}
                                                                            className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 whitespace-nowrap"
                                                                        >
                                                                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                            Delete for everyone
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                {msg.deletedForMe || msg.deletedForEveryone ? (
                                                    <p className="text-sm italic text-white opacity-70">
                                                        {msg.deletedForEveryone ? 'This message was deleted' : 'You deleted this message'}
                                                    </p>
                                                ) : (
                                                    <>
                                                        {attachment && (
                                                            <div className={`mb-2 ${msg.message && 'pb-2 border-b border-white/20'}`}>
                                                                {msg.messageType === 'image' ? (
                                                                    <img
                                                                        src={attachment.url}
                                                                        alt="attachment"
                                                                        className="rounded-lg max-w-full max-h-64 object-cover cursor-pointer"
                                                                        onClick={() => window.open(attachment.url, '_blank')}
                                                                    />
                                                                ) : (
                                                                    <a
                                                                        href={attachment.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={`flex items-center gap-2 p-2 rounded-lg font-semibold transition ${isOwn ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                                                    >
                                                                        {getAttachmentIcon(msg.messageType)}
                                                                        <span className="truncate max-w-[200px]">{attachment.filename || 'File Attachment'}</span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                        {msg.message && <p className="text-sm leading-relaxed break-words">{msg.message}</p>}
                                                    </>
                                                )}
                                                <div className={`flex items-center justify-end text-xs mt-1 ${isOwn ? 'text-indigo-200' : 'text-gray-500'}`}>
                                                    <span>{formatMessageTime(msg.createdAt)}</span>
                                                    {isOwn && (
                                                        <CheckCheck size={14} className={`ml-1 ${msg.read ? 'text-green-300' : 'text-indigo-400'}`} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <form onSubmit={handleSend} className="bg-white border-t border-gray-200 p-4 flex-shrink-0 shadow-inner">
                            {selectedFile && (
                                <div className="mb-3 p-3 bg-indigo-50 rounded-xl flex items-center justify-between border border-indigo-200">
                                    <span className="text-sm text-indigo-800 font-medium truncate flex items-center gap-2">
                                        <Paperclip size={16} />
                                        {selectedFile.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className="text-indigo-600 hover:text-indigo-800 ml-2 p-1 rounded-full hover:bg-indigo-100 transition"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-full transition"
                                    title="Attach file"
                                >
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={handleTyping}
                                    placeholder="Type a message…"
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-900"
                                    disabled={uploading}
                                />
                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !selectedFile) || uploading}
                                    className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-lg"
                                    title="Send message"
                                >
                                    {uploading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Send size={20} />
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    /* Default View (No chat selected) */
                    <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-100">
                        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
                            <p className="text-xl font-bold text-gray-700">Select a Conversation</p>
                            <p className="text-sm mt-2 text-gray-500">Choose from the sidebar to view chat history and start messaging.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;