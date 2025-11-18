import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const MessageButton = ({ postOwnerId, recipientId, className }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Support both prop names for backward compatibility
    const targetUserId = recipientId || postOwnerId;

    // Don't show if not logged in or if viewing own post
    if (!user || user._id === targetUserId) return null;

    const defaultClassName = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2";

    return (
        <button
            onClick={() => navigate(`/chat/${targetUserId}`)}
            className={className || defaultClassName}
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Send Message
        </button>
    );
};

export default MessageButton;
