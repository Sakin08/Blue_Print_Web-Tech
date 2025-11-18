import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPost();
    }, [id]);

    const loadPost = async () => {
        try {
            const res = await axios.get(`${API_URL}/posts/${id}`, {
                withCredentials: true
            });
            setPost(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load post:', err);
            setError('Post not found');
            setLoading(false);
        }
    };

    const handleUpdate = (updatedPost) => {
        setPost(updatedPost);
    };

    const handleDelete = () => {
        navigate('/feed');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading post...</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'This post may have been deleted.'}</p>
                    <button
                        onClick={() => navigate('/feed')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Back to Feed
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                <PostCard
                    post={post}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
};

export default PostDetail;
