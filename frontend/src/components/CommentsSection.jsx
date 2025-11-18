import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import { Reply, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const CommentsSection = ({ postType, postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        loadComments();
    }, [postType, postId]);

    const loadComments = async () => {
        try {
            const res = await axios.get(`${API_URL}/comments?postType=${postType}&postId=${postId}`);
            setComments(res.data);
        } catch (err) {
            console.error('Failed to load comments:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const payload = {
                content: newComment,
                postType,
                postId
            };

            // Add reply info if replying
            if (replyingTo) {
                payload.parentComment = replyingTo.commentId;
                payload.replyTo = replyingTo.userId;
            }

            const res = await axios.post(`${API_URL}/comments`, payload, {
                withCredentials: true
            });

            // Reload comments to get updated structure
            await loadComments();
            setNewComment('');
            setReplyingTo(null);
        } catch (err) {
            alert('Failed to post comment');
        }
        setLoading(false);
    };

    const handleReply = (comment) => {
        setReplyingTo({
            commentId: comment._id,
            userId: comment.author._id,
            userName: comment.author.name
        });
        setNewComment(`@${comment.author.name} `);
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setNewComment('');
    };

    const handleLike = async (commentId) => {
        if (!user) {
            alert('Please login to like comments');
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/comments/${commentId}/like`, {}, {
                withCredentials: true
            });

            setComments(comments.map(c =>
                c._id === commentId
                    ? { ...c, likes: Array(res.data.likes).fill(null) }
                    : c
            ));
        } catch (err) {
            console.error('Failed to like comment:', err);
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm('Delete this comment?')) return;

        try {
            await axios.delete(`${API_URL}/comments/${commentId}`, {
                withCredentials: true
            });
            setComments(comments.filter(c => c._id !== commentId));
        } catch (err) {
            alert('Failed to delete comment');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
                💬 Comments ({comments.length})
            </h3>

            {/* Comment Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-6">
                    {replyingTo && (
                        <div className="mb-2 flex items-center gap-2 text-sm text-gray-600 bg-indigo-50 px-3 py-2 rounded-lg">
                            <Reply className="w-4 h-4" />
                            <span>Replying to <strong>{replyingTo.userName}</strong></span>
                            <button
                                type="button"
                                onClick={cancelReply}
                                className="ml-auto text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <UserAvatar user={user} size="sm" />
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                                rows="3"
                            />
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500">
                                    Tip: Use @username to mention someone
                                </span>
                                <div className="flex gap-2">
                                    {replyingTo && (
                                        <button
                                            type="button"
                                            onClick={cancelReply}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading || !newComment.trim()}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
                                    >
                                        {loading ? 'Posting...' : replyingTo ? 'Reply' : 'Post Comment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
                    <p className="text-gray-600">Please login to comment</p>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment._id} className="space-y-3">
                            {/* Main Comment */}
                            <div className="flex gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                <UserAvatar user={comment.author} size="sm" />

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900">{comment.author?.name || 'Unknown User'}</span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {comment.replyTo && (
                                        <div className="text-xs text-indigo-600 mb-1">
                                            Replying to @{comment.replyTo.name}
                                        </div>
                                    )}

                                    <p className="text-gray-700 mb-2 whitespace-pre-wrap">{comment.content}</p>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleLike(comment._id)}
                                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 transition"
                                        >
                                            <svg className="w-4 h-4" fill={comment.likes?.some(l => l === user?._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            {comment.likes?.length || 0}
                                        </button>

                                        {user && (
                                            <button
                                                onClick={() => handleReply(comment)}
                                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 transition"
                                            >
                                                <Reply className="w-4 h-4" />
                                                Reply
                                            </button>
                                        )}

                                        {user && comment.author?._id === user._id && (
                                            <button
                                                onClick={() => handleDelete(comment._id)}
                                                className="text-sm text-red-600 hover:text-red-700 transition"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="ml-12 space-y-3">
                                    {comment.replies.map(reply => (
                                        <div key={reply._id} className="flex gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-200 transition">
                                            <UserAvatar user={reply.author} size="sm" />

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-900">{reply.author?.name || 'Unknown User'}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(reply.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {reply.replyTo && (
                                                    <div className="text-xs text-indigo-600 mb-1">
                                                        Replying to @{reply.replyTo.name}
                                                    </div>
                                                )}

                                                <p className="text-gray-700 mb-2 whitespace-pre-wrap">{reply.content}</p>

                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => handleLike(reply._id)}
                                                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 transition"
                                                    >
                                                        <svg className="w-4 h-4" fill={reply.likes?.some(l => l === user?._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                        {reply.likes?.length || 0}
                                                    </button>

                                                    {user && (
                                                        <button
                                                            onClick={() => handleReply(reply)}
                                                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 transition"
                                                        >
                                                            <Reply className="w-4 h-4" />
                                                            Reply
                                                        </button>
                                                    )}

                                                    {user && reply.author?._id === user._id && (
                                                        <button
                                                            onClick={() => handleDelete(reply._id)}
                                                            className="text-sm text-red-600 hover:text-red-700 transition"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentsSection;
