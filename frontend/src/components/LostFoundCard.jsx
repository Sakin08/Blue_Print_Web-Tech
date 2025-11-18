import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canDelete } from '../utils/permissions';
import UserAvatar from './UserAvatar';

const LostFoundCard = ({ item, onDelete }) => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const showDelete = onDelete && canDelete(currentUser, item.poster);
    const isLost = item.type === 'lost';
    const statusConfig = {
        active: { bg: 'bg-green-100', text: 'text-green-700', icon: '🟢', label: 'Active' },
        claimed: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🟡', label: 'Claimed' },
        resolved: { bg: 'bg-gray-100', text: 'text-gray-700', icon: '⚪', label: 'Resolved' }
    };

    const status = statusConfig[item.status] || statusConfig.active;

    const handleCardClick = (e) => {
        // Don't navigate if clicking on interactive elements
        if (e.target.closest('a') || e.target.closest('button')) {
            return;
        }
        navigate(`/lost-found/${item._id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 cursor-pointer"
        >
            {/* Type Indicator Bar */}
            <div className={`h-2 ${isLost ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'}`}></div>

            {/* Image Section */}
            {item.images?.[0] ? (
                <div className="block relative group">
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                        <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {/* Image Count Badge */}
                        {item.images.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm">
                                📷 {item.images.length} photos
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className={`h-56 flex items-center justify-center ${isLost ? 'bg-gradient-to-br from-red-50 to-red-100' : 'bg-gradient-to-br from-green-50 to-green-100'}`}>
                    <svg className={`w-20 h-20 ${isLost ? 'text-red-300' : 'text-green-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            )}

            {/* Content Section */}
            <div className="p-5">
                {/* Type and Category Badges */}
                <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${isLost ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {isLost ? '❌ LOST' : '✅ FOUND'}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {item.category}
                    </span>
                </div>

                {/* Title */}
                <h3 className={`text-xl font-bold text-gray-900 mb-2 hover:${isLost ? 'text-red-600' : 'text-green-600'} transition line-clamp-2`}>
                    {item.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {item.description}
                </p>

                {/* Location and Date */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">{item.location}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(item.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`${status.bg} ${status.text} px-3 py-2 rounded-lg text-xs font-semibold text-center mb-4`}>
                    {status.icon} {status.label}
                </div>

                {/* Poster Info */}
                {item.poster && (
                    <div className="pt-4 border-t border-gray-100 mb-4">
                        <div className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition">
                            <UserAvatar user={item.poster} size="sm" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {item.poster.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {item.poster.department}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* View Details Button */}
                <div className={`block text-center ${isLost ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white py-2.5 rounded-lg font-semibold text-sm transition shadow-md hover:shadow-lg`}>
                    View Details →
                </div>

                {/* Delete Button */}
                {showDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this item?')) {
                                onDelete(item._id);
                            }
                        }}
                        className="mt-3 w-full text-red-600 hover:bg-red-600 hover:text-white px-3 py-2 rounded-lg border border-red-200 transition-all duration-200 text-sm font-semibold"
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
};

export default LostFoundCard;
