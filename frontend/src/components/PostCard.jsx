import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canDelete } from '../utils/permissions';
import UserAvatar from './UserAvatar';
import api from '../api/axios';

const PostCard = ({ post, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Keyboard navigation for image viewer
  useEffect(() => {
    if (!showImageViewer) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowImageViewer(false);
      } else if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1);
      } else if (e.key === 'ArrowRight' && currentImageIndex < (post.content.images?.length || 0) - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImageViewer, currentImageIndex, post.content.images]);

  // Safety checks
  if (!post || !post.author) {
    return null;
  }

  const isLiked = post.likes?.some(like => like.user?._id === user?._id || like.user === user?._id);
  const isSaved = post.saves?.some(save => save.user === user?._id);
  const showDelete = canDelete(user, post.author);

  const handleLike = async () => {
    try {
      const res = await api.post(`/posts/${post._id}/like`);
      onUpdate(res.data);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      const res = await api.post(`/posts/${post._id}/comment`, {
        text: commentText
      });

      onUpdate(res.data);
      setCommentText('');
    } catch (err) {
      alert('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await api.post(`/posts/${post._id}/save`);
      onUpdate(res.data);
    } catch (err) {
      console.error('Failed to save post:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;

    try {
      await api.delete(`/posts/${post._id}`);
      onDelete(post._id);
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  };

  const getLikesText = () => {
    if (!post.likes || post.likes.length === 0) return '0 likes';

    const likeCount = post.likes.length;
    const names = post.likes.slice(0, 3).map(like => like.user?.name || 'Someone').filter(Boolean);

    if (likeCount === 1) {
      return names[0];
    } else if (likeCount === 2) {
      return `${names[0]} and ${names[1]}`;
    } else if (likeCount === 3) {
      return `${names[0]}, ${names[1]} and ${names[2]}`;
    } else {
      return `${names[0]}, ${names[1]} and ${likeCount - 2} others`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <Link to={`/profile/${post.author._id}`} className="flex items-center gap-3 hover:opacity-80 transition">
            <UserAvatar user={post.author} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{post.author.name}</p>
                {post.author.isStudentVerified && (
                  <span className="text-blue-500 text-sm" title="Verified Student">✓</span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {post.author.department} • {formatTime(post.createdAt)}
              </p>
            </div>
          </Link>

          {showDelete && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-600 transition"
              title="Delete post"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-800 whitespace-pre-line">{post.content.text}</p>
        </div>

        {/* Images */}
        {post.content.images && post.content.images.length > 0 && (
          <div className={`grid gap-2 mb-4 ${post.content.images.length === 1 ? 'grid-cols-1' :
            post.content.images.length === 2 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
            {post.content.images.map((image, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg group cursor-pointer"
                onClick={() => {
                  setCurrentImageIndex(index);
                  setShowImageViewer(true);
                }}
              >
                <img
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-64 object-cover transition-all duration-300 group-hover:brightness-95 group-hover:scale-[1.02]"
                />
                {/* Subtle zoom icon hint */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white bg-opacity-90 rounded-full p-2 shadow-lg">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Shared Post */}
        {post.sharedPost && (
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Shared post</p>
            <p className="text-gray-800">{post.sharedPost.content?.text}</p>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 py-3 border-t border-gray-100">
          <div className="relative">
            {post.likes?.length > 0 ? (
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="flex items-center gap-2 hover:underline text-left"
              >
                {/* Reaction Icon */}
                <div className="flex items-center -space-x-1">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-xs">❤️</span>
                  </div>
                </div>
                <span className="text-gray-700">{getLikesText()}</span>
              </button>
            ) : (
              <span>0 likes</span>
            )}

            {/* Reactions Modal */}
            {showReactions && post.likes?.length > 0 && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-10 w-64 max-h-80 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Reactions</h4>
                  <button
                    onClick={() => setShowReactions(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2">
                  {post.likes.map((like, index) => {
                    // Handle both populated and non-populated user data
                    const userId = typeof like.user === 'object' ? like.user?._id : like.user;
                    const userName = typeof like.user === 'object' ? like.user?.name : null;
                    const userPicture = typeof like.user === 'object' ? like.user?.profilePicture : null;
                    const userDept = typeof like.user === 'object' ? like.user?.department : null;

                    // Skip if no valid user ID
                    if (!userId) return null;

                    return (
                      <Link
                        key={index}
                        to={`/profile/${userId}`}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition"
                        onClick={() => setShowReactions(false)}
                      >
                        {userPicture ? (
                          <img
                            src={userPicture}
                            alt={userName || 'User'}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {userName?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {userName || 'SUST User'}
                          </p>
                          {userDept && (
                            <p className="text-xs text-gray-500 truncate">{userDept}</p>
                          )}
                        </div>
                        <div className="text-lg">❤️</div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:underline"
          >
            {post.comments?.length || 0} {post.comments?.length === 1 ? 'comment' : 'comments'}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition ${isLiked
              ? 'text-red-600 bg-red-50'
              : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Like</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Comment</span>
          </button>

          <button
            onClick={handleSave}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition ${isSaved
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          {/* Comment Form */}
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex gap-3">
              <UserAvatar user={user} size="sm" />
              <div className="flex-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !commentText.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment, index) => {
                // Handle both populated and non-populated user data
                const commentUserId = typeof comment.user === 'object' ? comment.user?._id : comment.user;
                const commentUserName = typeof comment.user === 'object' ? comment.user?.name : 'SUST User';

                return (
                  <div key={index} className="flex gap-3">
                    <Link to={`/profile/${commentUserId}`}>
                      <UserAvatar user={comment.user} size="sm" />
                    </Link>
                    <div className="flex-1">
                      <div className="bg-white rounded-lg p-3">
                        <Link
                          to={`/profile/${commentUserId}`}
                          className="font-semibold text-gray-900 hover:text-indigo-600 text-sm"
                        >
                          {commentUserName}
                        </Link>
                        <p className="text-gray-800 text-sm mt-1">{comment.text}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-1 px-3">
                        <span className="text-xs text-gray-500">
                          {formatTime(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && post.content.images && post.content.images.length > 0 && (
        <div
          className="fixed inset-0 bg-white bg-opacity-98 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn"
          onClick={() => setShowImageViewer(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowImageViewer(false)}
            className="absolute top-4 right-4 bg-gray-900 bg-opacity-80 hover:bg-opacity-100 text-white p-2 rounded-full transition z-10 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Counter */}
          {post.content.images.length > 1 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 bg-opacity-80 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              {currentImageIndex + 1} / {post.content.images.length}
            </div>
          )}

          {/* Previous Button */}
          {post.content.images.length > 1 && currentImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(currentImageIndex - 1);
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-900 bg-opacity-80 hover:bg-opacity-100 text-white p-3 rounded-full transition shadow-lg hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next Button */}
          {post.content.images.length > 1 && currentImageIndex < post.content.images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(currentImageIndex + 1);
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-900 bg-opacity-80 hover:bg-opacity-100 text-white p-3 rounded-full transition shadow-lg hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Main Image */}
          <div
            className="max-w-7xl max-h-screen p-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={post.content.images[currentImageIndex]}
              alt={`Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Thumbnail Strip */}
          {post.content.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-gray-900 bg-opacity-80 p-3 rounded-xl max-w-full overflow-x-auto shadow-lg">
              {post.content.images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-3 transition ${index === currentImageIndex
                    ? 'border-indigo-500 scale-110 shadow-lg'
                    : 'border-gray-600 opacity-60 hover:opacity-100 hover:border-gray-400'
                    }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Download Button */}
          <a
            href={post.content.images[currentImageIndex]}
            download
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
        </div>
      )}
    </div>
  );
};

export default PostCard;
