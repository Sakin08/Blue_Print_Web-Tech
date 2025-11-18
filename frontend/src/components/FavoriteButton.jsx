import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';

const FavoriteButton = ({ postType, postId }) => {
    const { user } = useAuth();
    const [favorited, setFavorited] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            checkFavorite();
        }
    }, [postId, user]);

    const checkFavorite = async () => {
        try {
            const res = await api.get(`/favorites/check?postType=${postType}&postId=${postId}`);
            setFavorited(res.data.favorited);
        } catch (err) {
            console.error('Failed to check favorite:', err);
        }
    };

    const toggleFavorite = async () => {
        if (!user) {
            alert('Please login to save favorites');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/favorites/toggle', { postType, postId });
            setFavorited(res.data.favorited);
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`p-2 rounded-full transition ${favorited
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } disabled:opacity-50`}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            <svg
                className="w-6 h-6"
                fill={favorited ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
        </button>
    );
};

export default FavoriteButton;
