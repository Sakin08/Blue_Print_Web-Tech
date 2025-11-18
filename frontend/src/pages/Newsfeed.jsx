import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import {
    TrendingUp, Users, Calendar, Briefcase, Home as HousingIcon,
    Search, X, Sparkles, Clock, Filter, RefreshCw, BookOpen,
    Heart, MessageCircle, Droplet, ShoppingBag, MapPin
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Newsfeed = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [trendingTopics, setTrendingTopics] = useState([]);
    const [campusStats, setCampusStats] = useState({ activeUsers: 0, postsToday: 0, eventsThisWeek: 0 });
    const [followingUsers, setFollowingUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const observerTarget = useRef(null);
    const centerColumnRef = useRef(null);

    useEffect(() => {
        loadPosts(1);
        loadTrendingTopics();
        loadCampusStats();
        loadFollowingUsers();
    }, [filter]);

    // Socket listeners for online users
    useEffect(() => {
        if (!socket) return;

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
            socket.off('onlineUsers');
            socket.off('userOnline');
            socket.off('userOffline');
        };
    }, [socket]);

    // Infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadPosts(page + 1);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loading, page]);

    const loadPosts = async (pageNum = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/posts/feed?filter=${filter}&page=${pageNum}&limit=10`, {
                withCredentials: true
            });

            if (pageNum === 1) {
                setPosts(res.data.posts);
                if (centerColumnRef.current) {
                    centerColumnRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else {
                setPosts(prev => [...prev, ...res.data.posts]);
            }

            setHasMore(res.data.currentPage < res.data.totalPages);
            setPage(pageNum);
        } catch (err) {
            console.error('Failed to load posts:', err);
        }
        setLoading(false);
    };

    // Filter posts based on search query
    const filteredPosts = searchQuery.trim()
        ? posts.filter(post => {
            const searchLower = searchQuery.toLowerCase();
            const textMatch = post.content?.text?.toLowerCase().includes(searchLower);
            const authorMatch = post.author?.name?.toLowerCase().includes(searchLower);
            const tagsMatch = post.tags?.some(tag => tag.toLowerCase().includes(searchLower));
            return textMatch || authorMatch || tagsMatch;
        })
        : posts;

    const loadTrendingTopics = async () => {
        try {
            const res = await axios.get(`${API_URL}/posts/trending-topics?limit=5`, {
                withCredentials: true
            });
            setTrendingTopics(res.data);
        } catch (err) {
            console.error('Failed to load trending topics:', err);
        }
    };

    const loadCampusStats = async () => {
        try {
            const res = await axios.get(`${API_URL}/posts/campus-stats`, {
                withCredentials: true
            });
            setCampusStats(res.data);
        } catch (err) {
            console.error('Failed to load campus stats:', err);
        }
    };

    const loadFollowingUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/users/${user._id}/following`, {
                withCredentials: true
            });
            setFollowingUsers(res.data);
        } catch (err) {
            console.error('Failed to load following users:', err);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadPosts(1), loadTrendingTopics(), loadCampusStats()]);
        setRefreshing(false);
    };

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    const handlePostUpdate = (updatedPost) => {
        setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
    };

    const handlePostDelete = (postId) => {
        setPosts(posts.filter(p => p._id !== postId));
    };

    const quickLinks = [
        { icon: Calendar, label: 'Events', link: '/events', color: 'text-purple-600', bg: 'bg-purple-50', gradient: 'from-purple-500 to-pink-500' },
        { icon: Briefcase, label: 'Jobs', link: '/jobs', color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500 to-cyan-500' },
        { icon: HousingIcon, label: 'Housing', link: '/housing', color: 'text-green-600', bg: 'bg-green-50', gradient: 'from-green-500 to-emerald-500' },
        { icon: Users, label: 'Study Groups', link: '/study-groups', color: 'text-orange-600', bg: 'bg-orange-50', gradient: 'from-orange-500 to-red-500' },
        { icon: Droplet, label: 'Blood Donation', link: '/blood-donation', color: 'text-red-600', bg: 'bg-red-50', gradient: 'from-red-500 to-rose-500' },
        { icon: ShoppingBag, label: 'Buy & Sell', link: '/buy-sell', color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500 to-purple-500' },
        { icon: MapPin, label: 'Lost & Found', link: '/lost-found', color: 'text-yellow-600', bg: 'bg-yellow-50', gradient: 'from-yellow-500 to-orange-500' },
        { icon: MessageCircle, label: 'Messages', link: '/messages', color: 'text-pink-600', bg: 'bg-pink-50', gradient: 'from-pink-500 to-rose-500' }
    ];

    // Prevent body scroll on mount
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const trendingColors = ['text-purple-600', 'text-blue-600', 'text-green-600', 'text-orange-600', 'text-indigo-600'];

    const formatLastActive = (lastActive) => {
        if (!lastActive) return 'Never';
        const now = new Date();
        const lastActiveDate = new Date(lastActive);
        const diffMs = now - lastActiveDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return lastActiveDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
            <div className="max-w-7xl mx-auto px-4 py-2 w-full flex-shrink-0">
                {/* Header Section */}
                <div className="mb-2">
                    <div className="flex items-center justify-between mb-1.5">
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            Newsfeed
                        </h1>

                        <div className="flex items-center gap-1.5">
                            {/* Search Toggle */}
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className="p-1.5 bg-white rounded-md shadow-sm hover:shadow transition text-gray-700 hover:text-indigo-600"
                            >
                                {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                            </button>

                            {/* Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-1.5 bg-white rounded-md shadow-sm hover:shadow transition text-gray-700 hover:text-indigo-600 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    {showSearch && (
                        <div className="bg-white rounded-md shadow-sm p-2 mb-1.5 animate-fadeIn">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search posts, people, topics..."
                                    className="w-full pl-9 pr-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Filter Tabs */}
                    <div className="bg-white rounded-md shadow-sm p-1 flex items-center gap-1 overflow-x-auto">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition whitespace-nowrap ${filter === 'all'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <TrendingUp className="w-3 h-3" />
                            All Posts
                        </button>
                        <button
                            onClick={() => setFilter('following')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition whitespace-nowrap ${filter === 'following'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Users className="w-3 h-3" />
                            Following
                        </button>
                        <button
                            onClick={() => setFilter('trending')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition whitespace-nowrap ${filter === 'trending'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Sparkles className="w-3 h-3" />
                            Trending
                        </button>
                        <button
                            onClick={() => setFilter('recent')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition whitespace-nowrap ${filter === 'recent'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Clock className="w-3 h-3" />
                            Recent
                        </button>
                    </div>
                </div>
            </div>

            {/* Three Column Layout - Full Height with Independent Scrolling */}
            <div className="max-w-7xl mx-auto px-4 w-full flex-1 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                    {/* Left Sidebar - Quick Links */}
                    <div className="lg:col-span-3 space-y-6 overflow-y-auto h-full pb-6">
                        {/* User Profile Card */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <Link to={`/profile/${user._id}`} className="flex flex-col items-center text-center group">
                                {user.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt={user.name}
                                        className="w-20 h-20 rounded-full object-cover border-4 border-indigo-100 group-hover:border-indigo-300 transition mb-3"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-indigo-100 group-hover:border-indigo-300 transition mb-3">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition">{user.name}</h3>
                                <p className="text-sm text-gray-600">{user.department}</p>
                            </Link>

                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-gray-900">{user.followers?.length || 0}</div>
                                    <div className="text-xs text-gray-600">Followers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-gray-900">{user.following?.length || 0}</div>
                                    <div className="text-xs text-gray-600">Following</div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-white rounded-xl shadow-md p-6 hidden lg:block">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Filter className="w-5 h-5 text-indigo-600" />
                                Quick Access
                            </h3>
                            <div className="space-y-2">
                                {quickLinks.map((link, index) => (
                                    <Link
                                        key={index}
                                        to={link.link}
                                        className={`flex items-center gap-3 p-3 ${link.bg} ${link.color} rounded-lg hover:shadow-md transition group`}
                                    >
                                        <div className={`p-2 bg-gradient-to-br ${link.gradient} rounded-lg text-white group-hover:scale-110 transition`}>
                                            <link.icon className="w-4 h-4" />
                                        </div>
                                        <span className="font-semibold text-sm">{link.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Center - Main Feed */}
                    <div ref={centerColumnRef} className="lg:col-span-6 overflow-y-auto h-full pb-6">
                        {/* Create Post */}
                        <CreatePost onPostCreated={handlePostCreated} />

                        {/* Posts Feed */}
                        <div className="space-y-6">
                            {loading && page === 1 ? (
                                <div className="flex justify-center py-20">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
                                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                                    </div>
                                </div>
                            ) : filteredPosts.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                    <div className="text-6xl mb-4">{searchQuery.trim() ? '🔍' : '📭'}</div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {searchQuery.trim() ? 'No results found' : 'No posts yet'}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {searchQuery.trim()
                                            ? `No posts match "${searchQuery}". Try a different search term.`
                                            : filter === 'following'
                                                ? 'Follow some users to see their posts here!'
                                                : 'Be the first to post something!'}
                                    </p>
                                    {searchQuery.trim() ? (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition"
                                        >
                                            <X className="w-5 h-5" />
                                            Clear Search
                                        </button>
                                    ) : filter === 'following' && (
                                        <Link
                                            to="/explore"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition"
                                        >
                                            <Users className="w-5 h-5" />
                                            Discover People
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {filteredPosts.map(post => (
                                        <PostCard
                                            key={post._id}
                                            post={post}
                                            onUpdate={handlePostUpdate}
                                            onDelete={handlePostDelete}
                                        />
                                    ))}

                                    {/* Infinite Scroll Trigger */}
                                    <div ref={observerTarget} className="h-10"></div>

                                    {/* Loading More */}
                                    {loading && page > 1 && (
                                        <div className="flex justify-center py-6">
                                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}

                                    {/* No More Posts */}
                                    {!hasMore && filteredPosts.length > 0 && !searchQuery.trim() && (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 font-medium">🎉 You're all caught up!</p>
                                            <p className="text-sm text-gray-400 mt-1">No more posts to show</p>
                                        </div>
                                    )}

                                    {/* Search Results Count */}
                                    {searchQuery.trim() && filteredPosts.length > 0 && (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-gray-500">
                                                Showing {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} for "{searchQuery}"
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Trending & Suggestions */}
                    <div className="lg:col-span-3 space-y-6 overflow-y-auto h-full pb-6">
                        {/* Following Users */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600" />
                                Following ({followingUsers.length})
                            </h3>
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {followingUsers.length > 0 ? (
                                    followingUsers.map((followedUser) => {
                                        const isOnline = onlineUsers.has(followedUser._id);
                                        return (
                                            <Link
                                                key={followedUser._id}
                                                to={`/messages?userId=${followedUser._id}`}
                                                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition group"
                                            >
                                                <div className="relative flex-shrink-0">
                                                    {followedUser.profilePicture ? (
                                                        <img
                                                            src={followedUser.profilePicture}
                                                            alt={followedUser.name}
                                                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                                            {followedUser.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    {isOnline && (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600">
                                                        {followedUser.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {isOnline ? (
                                                            <span className="text-green-600 font-medium">Online</span>
                                                        ) : (
                                                            <span>{formatLastActive(followedUser.lastActive)}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </Link>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-6">
                                        <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-500">Not following anyone yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Discover people to follow!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Trending Topics */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                Trending Topics
                            </h3>
                            <div className="space-y-3">
                                {trendingTopics.length > 0 ? (
                                    trendingTopics.map((topic, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSearchQuery(topic.tag)}
                                            className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition group"
                                        >
                                            <div className={`font-bold ${trendingColors[index % trendingColors.length]} group-hover:underline`}>
                                                {topic.tag}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">{topic.displayCount} posts</div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500">No trending topics yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Start using hashtags in your posts!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Campus Stats */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-md p-6 text-white">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Campus Activity
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-indigo-100">Active Users</span>
                                    <span className="font-bold">{campusStats.activeUsers.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-indigo-100">Posts Today</span>
                                    <span className="font-bold">{campusStats.postsToday.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-indigo-100">Events This Week</span>
                                    <span className="font-bold">{campusStats.eventsThisWeek.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md p-6 border-2 border-green-200">
                            <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                                💡 Quick Tip
                            </h3>
                            <p className="text-sm text-green-800">
                                Use hashtags like #SUSTLife to make your posts more discoverable to the community!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Newsfeed;
