import { useState, useEffect } from 'react';
import { getMySavedPosts } from '../api/savedPosts';
import housingApi from '../api/housing';
import buysellApi from '../api/buysell';
import eventsApi from '../api/events';
import HousingCard from '../components/HousingCard';
import BuySellCard from '../components/BuySellCard';
import EventCard from '../components/EventCard';

const SavedPosts = () => {
    const [savedPosts, setSavedPosts] = useState([]);
    const [postsData, setPostsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadSavedPosts();
    }, []);

    const loadSavedPosts = async () => {
        try {
            const res = await getMySavedPosts();
            const saved = res.data;
            console.log('Saved posts from API:', saved);
            setSavedPosts(saved);

            // Fetch actual post data
            const postsWithData = await Promise.all(
                saved.map(async (item) => {
                    try {
                        let postData;
                        console.log(`Fetching ${item.postType} post with ID:`, item.postId);
                        switch (item.postType) {
                            case 'housing':
                                postData = await housingApi.getById(item.postId);
                                break;
                            case 'buysell':
                                postData = await buysellApi.getById(item.postId);
                                break;
                            case 'event':
                                postData = await eventsApi.getById(item.postId);
                                break;
                            default:
                                console.log('Unknown post type:', item.postType);
                                return null;
                        }
                        console.log(`Loaded ${item.postType} post:`, postData.data);
                        return {
                            ...item,
                            data: postData.data,
                        };
                    } catch (error) {
                        console.error(`Failed to load ${item.postType} post:`, error);
                        return null;
                    }
                })
            );

            const validPosts = postsWithData.filter(p => p !== null);
            console.log('Valid posts with data:', validPosts);
            setPostsData(validPosts);
            setLoading(false);
        } catch (error) {
            console.error('Error loading saved posts:', error);
            setLoading(false);
        }
    };

    const filteredPosts = filter === 'all'
        ? postsData
        : postsData.filter(p => p.postType === filter);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading saved posts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Saved Posts</h1>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    {['all', 'housing', 'buysell', 'event'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${filter === type
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {type === 'all' ? 'All' : type === 'buysell' ? 'Buy & Sell' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="mb-4 text-sm text-gray-600">
                    {filteredPosts.length} saved {filteredPosts.length === 1 ? 'post' : 'posts'}
                </div>

                {filteredPosts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <p className="text-gray-500 text-lg">No saved posts yet</p>
                        <p className="text-gray-400 text-sm mt-2">
                            Save posts by clicking the bookmark icon
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredPosts.map((item) => {
                            if (!item.data) return null;

                            switch (item.postType) {
                                case 'housing':
                                    return <HousingCard key={item.postId} post={item.data} />;
                                case 'buysell':
                                    return <BuySellCard key={item.postId} post={item.data} />;
                                case 'event':
                                    return <EventCard key={item.postId} event={item.data} onUpdate={loadSavedPosts} />;
                                default:
                                    return null;
                            }
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedPosts;
