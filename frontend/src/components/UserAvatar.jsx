import { useSocket } from '../context/SocketContext';

const UserAvatar = ({ user, size = 'md', showOnline = true }) => {
    const { onlineUsers } = useSocket();
    const isOnline = onlineUsers.includes(user?._id);

    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-2xl',
    };

    const onlineIndicatorSize = {
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
        xl: 'w-4 h-4',
    };

    return (
        <div className="relative inline-block">
            {user?.profilePicture ? (
                <img
                    src={user.profilePicture}
                    alt={user.name}
                    className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm`}
                />
            ) : (
                <div className={`${sizeClasses[size]} bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm`}>
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
            )}

            {showOnline && isOnline && (
                <div className={`absolute bottom-0 right-0 ${onlineIndicatorSize[size]} bg-green-500 border-2 border-white rounded-full`}></div>
            )}
        </div>
    );
};

export default UserAvatar;
