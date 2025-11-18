import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';

const PosterInfo = ({ user, createdAt }) => {
    if (!user) return null;

    const timeAgo = getTimeAgo(createdAt);

    return (
        <div className="flex items-center gap-3 py-3 border-t border-gray-100">
            <Link
                to={`/profile/${user._id}`}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition flex-1"
            >
                <UserAvatar user={user} size="md" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate">
                            {user.name}
                        </p>
                        {user.isStudentVerified && (
                            <span className="text-blue-500 text-sm" title="Verified Student">
                                ✓
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">
                        {user.department} {user.batch && `• ${user.batch}`}
                    </p>
                    {createdAt && (
                        <p className="text-xs text-gray-400">{timeAgo}</p>
                    )}
                </div>
            </Link>
        </div>
    );
};

function getTimeAgo(date) {
    if (!date) return '';

    const now = new Date();
    const posted = new Date(date);
    const diffMs = now - posted;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return posted.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default PosterInfo;
