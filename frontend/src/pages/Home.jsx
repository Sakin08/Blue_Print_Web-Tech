import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
    Newspaper, MessageCircle, Calendar, ShoppingBag, GraduationCap, Droplet,
    Users, Briefcase, MapPin, TrendingUp, Sparkles, ArrowRight, CheckCircle,
    Home as HousingIcon, BookOpen, Heart, Zap, Shield, Clock
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Home = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        activeStudents: 0,
        dailyPosts: 0,
        verifiedDonors: 0,
        activeGroups: 0
    });
    const [trendingPost, setTrendingPost] = useState(null);
    const [upcomingEvent, setUpcomingEvent] = useState(null);
    const [urgentRequest, setUrgentRequest] = useState(null);
    const [marketplaceItems, setMarketplaceItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHomeData();
    }, []);

    const loadHomeData = async () => {
        try {
            const [statsRes, postsRes, eventsRes, bloodRes, marketRes] = await Promise.all([
                axios.get(`${API_URL}/posts/campus-stats`, { withCredentials: true }).catch(() => ({ data: {} })),
                axios.get(`${API_URL}/posts/feed?limit=1&filter=trending`, { withCredentials: true }).catch(() => ({ data: { posts: [] } })),
                axios.get(`${API_URL}/events?limit=1`, { withCredentials: true }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/blood-donation/requests?limit=1`, { withCredentials: true }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/buysell?limit=2`, { withCredentials: true }).catch(() => ({ data: [] }))
            ]);

            setStats({
                activeStudents: statsRes.data.activeUsers || 5300,
                dailyPosts: statsRes.data.postsToday || 120,
                verifiedDonors: 40,
                activeGroups: 20
            });

            if (postsRes.data.posts?.length > 0) setTrendingPost(postsRes.data.posts[0]);
            if (eventsRes.data.length > 0) setUpcomingEvent(eventsRes.data[0]);
            if (bloodRes.data.length > 0) setUrgentRequest(bloodRes.data[0]);
            setMarketplaceItems(marketRes.data.slice(0, 2));

            setLoading(false);
        } catch (err) {
            console.error('Failed to load home data:', err);
            setLoading(false);
        }
    };

    // Check if user has "other" role - show limited features
    const isOtherRole = user?.role === 'other';

    const allFeatures = [
        { icon: Newspaper, title: 'Newsfeed', desc: 'See what\'s happening on campus right now', link: '/feed', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', allowedRoles: ['student', 'teacher', 'admin'] },
        { icon: MessageCircle, title: 'Chat', desc: 'Instant messaging with friends & groups', link: '/messages', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50', allowedRoles: ['student', 'teacher', 'admin'] },
        { icon: Calendar, title: 'Events', desc: 'Discover & join campus events', link: '/events', color: 'from-green-500 to-emerald-500', bg: 'bg-green-50', allowedRoles: ['student', 'teacher', 'admin'] },
        { icon: ShoppingBag, title: 'Marketplace', desc: 'Buy/sell books, gadgets, room rentals', link: '/buysell', color: 'from-orange-500 to-red-500', bg: 'bg-orange-50', allowedRoles: ['student', 'teacher', 'admin'] },
        { icon: MapPin, title: 'Lost & Found', desc: 'Report lost items or find what you\'ve lost', link: '/lost-found', color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50', allowedRoles: ['student', 'teacher', 'admin'] },
        { icon: Droplet, title: 'Blood Donation', desc: 'Find donors or respond to urgent requests', link: '/blood-donation', color: 'from-red-500 to-rose-500', bg: 'bg-red-50', allowedRoles: ['student', 'teacher', 'admin', 'other'] },
        { icon: ShoppingBag, title: 'Campus Eats', desc: 'Order food from campus restaurants', link: '/restaurants', color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-50', allowedRoles: ['student', 'teacher', 'admin', 'other'] }
    ];

    const quickAccessFeatures = isOtherRole
        ? allFeatures.filter(f => f.allowedRoles.includes('other'))
        : allFeatures.filter(f => !f.allowedRoles || f.allowedRoles.includes(user?.role || 'student'));

    const allCategories = [
        { name: 'Events', icon: '�', link: '/events', allowedRoles: ['student', 'teacher', 'admin'] },
        { name: 'Blood Donation', icon: '🩸', link: '/blood-donation', allowedRoles: ['student', 'teacher', 'admin', 'other'] },
        { name: 'Jobs', icon: '💼', link: '/jobs', allowedRoles: ['student', 'teacher', 'admin'] },
        { name: 'Housing', icon: '🏠', link: '/housing', allowedRoles: ['student', 'teacher', 'admin'] },
        { name: 'Food', icon: '🍔', link: '/restaurants', allowedRoles: ['student', 'teacher', 'admin', 'other'] },
        { name: 'Marketplace', icon: '🛒', link: '/buysell', allowedRoles: ['student', 'teacher', 'admin'] },
        { name: 'Lost & Found', icon: '🔍', link: '/lost-found', allowedRoles: ['student', 'teacher', 'admin'] }
    ];

    const categories = isOtherRole
        ? allCategories.filter(c => c.allowedRoles.includes('other'))
        : allCategories.filter(c => !c.allowedRoles || c.allowedRoles.includes(user?.role || 'student'));

    const whyChoose = [
        { icon: Zap, title: 'All-in-One', desc: 'One unified platform for everything at SUST.' },
        { icon: Clock, title: 'Real-time', desc: 'Live feed, chats, alerts, notifications.' },
        { icon: Shield, title: 'Student-Verified', desc: 'Every user is a real SUST student.' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
                {/* SUST Campus Background Image */}
                <div className="absolute inset-0 opacity-70">
                    <img
                        src="/image/gallery_img_63aaf27b9989c.jpg"
                        alt="SUST Campus"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 opacity-10"></div>
                </div>

                {/* Background Pattern Overlay */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-semibold">Welcome to SUST Connect</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
                            Your Smart Campus
                        </h1>

                        <p className="text-xl sm:text-2xl text-indigo-100 mb-10 max-w-3xl mx-auto">
                            News, Events, Marketplace, Study Groups, Blood Donation & More
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {!user ? (
                                <>
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition shadow-2xl hover:scale-105 transform"
                                    >
                                        Get Started
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center justify-center gap-2 bg-indigo-500 bg-opacity-30 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-opacity-40 transition border-2 border-white border-opacity-30"
                                    >
                                        Login
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    to="/feed"
                                    className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition shadow-2xl hover:scale-105 transform"
                                >
                                    Go to Newsfeed
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(249, 250, 251)" />
                    </svg>
                </div>
            </div>

            {/* Quick Access Feature Cards */}
            <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10 mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quickAccessFeatures.map((feature, index) => (
                        <Link
                            key={index}
                            to={feature.link}
                            className={`${feature.bg} rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group`}
                        >
                            <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                <feature.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.desc}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Dynamic Feed Preview - Hidden for "other" role */}
            {user && !isOtherRole && (
                <div className="max-w-7xl mx-auto px-4 mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-8 h-8 text-indigo-600" />
                            Live Campus Activity
                        </h2>
                        <Link to="/feed" className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Trending Post */}
                        {trendingPost && (
                            <Link to={`/post/${trendingPost._id}`} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer block">
                                <div className="flex items-center gap-2 text-orange-600 font-semibold mb-4">
                                    <TrendingUp className="w-5 h-5" />
                                    Top Trending Post
                                </div>
                                <p className="text-gray-800 mb-4 line-clamp-3">{trendingPost.content?.text}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>❤️ {trendingPost.likes?.length || 0} likes</span>
                                    <span>💬 {trendingPost.comments?.length || 0} comments</span>
                                </div>
                            </Link>
                        )}

                        {/* Upcoming Event */}
                        {upcomingEvent && (
                            <Link to="/events" className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer block">
                                <div className="flex items-center gap-2 text-purple-600 font-semibold mb-4">
                                    <Calendar className="w-5 h-5" />
                                    Upcoming Event
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{upcomingEvent.title}</h3>
                                <p className="text-gray-600 text-sm mb-4">{new Date(upcomingEvent.date).toLocaleDateString()}</p>
                                <span className="text-purple-600 font-semibold hover:underline">
                                    View Details →
                                </span>
                            </Link>
                        )}

                        {/* Urgent Blood Request */}
                        {urgentRequest && (
                            <Link to="/blood-donation" className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl shadow-lg p-6 hover:shadow-xl transition border-2 border-red-200 cursor-pointer block">
                                <div className="flex items-center gap-2 text-red-600 font-semibold mb-4">
                                    <Droplet className="w-5 h-5" />
                                    Urgent Blood Request
                                </div>
                                <p className="text-gray-800 mb-2">Blood Type: <span className="font-bold text-red-600">{urgentRequest.bloodType}</span></p>
                                <p className="text-gray-600 text-sm mb-4">{urgentRequest.location}</p>
                                <span className="text-red-600 font-semibold hover:underline">
                                    Respond Now →
                                </span>
                            </Link>
                        )}

                        {/* Marketplace Picks */}
                        {marketplaceItems.length > 0 && (
                            <Link to="/buysell" className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer block">
                                <div className="flex items-center gap-2 text-green-600 font-semibold mb-4">
                                    <ShoppingBag className="w-5 h-5" />
                                    Marketplace Picks
                                </div>
                                <div className="space-y-3">
                                    {marketplaceItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            {item.image && (
                                                <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
                                            )}
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                                                <p className="text-green-600 font-bold">৳{item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <span className="text-green-600 font-semibold hover:underline mt-4 inline-block">
                                    View More →
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Community Highlights */}
            <div className="bg-white py-16 mb-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-extrabold text-indigo-600 mb-2">{stats.activeStudents.toLocaleString()}+</div>
                            <div className="text-gray-600 font-medium">Active Students</div>
                        </div>
                        <div>
                            <div className="text-4xl font-extrabold text-purple-600 mb-2">{stats.dailyPosts}+</div>
                            <div className="text-gray-600 font-medium">Daily Posts</div>
                        </div>
                        <div>
                            <div className="text-4xl font-extrabold text-red-600 mb-2">{stats.verifiedDonors}+</div>
                            <div className="text-gray-600 font-medium">Verified Donors</div>
                        </div>
                        <div>
                            <div className="text-4xl font-extrabold text-green-600 mb-2">{stats.activeGroups}+</div>
                            <div className="text-gray-600 font-medium">Items Found</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-7xl mx-auto px-4 mb-20">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Explore Categories</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    {categories.map((cat, idx) => (
                        <Link
                            key={idx}
                            to={cat.link}
                            className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md hover:shadow-xl transition-all hover:scale-105 font-semibold text-gray-700 hover:text-indigo-600"
                        >
                            <span className="text-2xl">{cat.icon}</span>
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Why SUST Connect */}
            <div className="max-w-7xl mx-auto px-4 mb-20">
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why SUST Connect?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {whyChoose.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <item.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                            <p className="text-gray-600">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* SUST Campus Gallery Carousel */}
            <CampusCarousel />

            {/* CTA Section */}
            {!user && (
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-20 mb-0">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h2 className="text-4xl font-bold mb-4">Join the SUST Community Today</h2>
                        <p className="text-xl text-indigo-100 mb-8">
                            Connect with fellow students and access everything you need in one place
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition shadow-2xl hover:scale-105 transform"
                        >
                            Create Free Account
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

// Campus Carousel Component
const CampusCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const campusImages = [
        '/image/482960815_993190686245235_4424343453997937682_n.jpg',
        '/image/482984952_993190959578541_8366529342364279980_n.jpg',
        '/image/484187055_993183852912585_3503423309300225521_n.jpg',
        '/image/484475559_993185912912379_40001677160909400_n.jpg',
        '/image/97228811_102348561497001_192103811156803584_n.jpg',
        '/image/gallery_img_63aaf27b9989c.jpg'
    ];

    // Auto-slide every 5 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % campusImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [campusImages.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % campusImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + campusImages.length) % campusImages.length);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Our Beautiful Campus</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                Shahjalal University of Science and Technology - Where innovation meets nature
            </p>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {/* Main Image */}
                <div className="relative h-96 md:h-[500px]">
                    {campusImages.map((image, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <img
                                src={image}
                                alt={`SUST Campus ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-30"></div>
                        </div>
                    ))}
                </div>

                {/* Previous Button */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-900 p-3 rounded-full shadow-lg transition z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Next Button */}
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-900 p-3 rounded-full shadow-lg transition z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    {campusImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all ${index === currentSlide
                                ? 'bg-white w-8'
                                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                }`}
                        />
                    ))}
                </div>

                {/* Slide Counter */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
                    {currentSlide + 1} / {campusImages.length}
                </div>
            </div>
        </div>
    );
};

export default Home;
