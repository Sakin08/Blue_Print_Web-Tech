import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
// Import Lucide Icons for a modern look
import {
  Camera, Calendar, ShoppingBag, Home, Briefcase, Pizza, Search, BookOpen, Clock, Trash2, List, MessageSquare, Heart
} from 'lucide-react';

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const [allContent, setAllContent] = useState({
    socialPosts: [],
    events: [],
    buysell: [],
    housing: [],
    jobs: [],
    food: [],
    lostFound: [],
    studyGroups: []
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('all');

  // --- Functionality (Unchanged) ---
  useEffect(() => {
    if (user?._id) {
      loadMyContent();
    }
  }, [user]);

  const loadMyContent = async () => {
    setLoading(true);
    try {
      const [
        socialPostsRes,
        eventsRes,
        buysellRes,
        housingRes,
        jobsRes,
        foodRes,
        lostFoundRes,
        studyGroupsRes
      ] = await Promise.all([
        api.get(`/posts/user/${user._id}`).catch(() => ({ data: [] })),
        api.get('/events').catch(() => ({ data: [] })),
        api.get('/buysell').catch(() => ({ data: [] })),
        api.get('/housing').catch(() => ({ data: [] })),
        api.get('/jobs').catch(() => ({ data: [] })),
        api.get('/food').catch(() => ({ data: [] })),
        api.get('/lost-found').catch(() => ({ data: [] })),
        api.get('/study-groups').catch(() => ({ data: [] }))
      ]);

      setAllContent({
        socialPosts: socialPostsRes.data || [],
        events: (eventsRes.data || []).filter(e => e.user?._id === user._id),
        buysell: (buysellRes.data || []).filter(p => p.user?._id === user._id),
        housing: (housingRes.data || []).filter(h => h.user?._id === user._id),
        jobs: (jobsRes.data || []).filter(j => j.user?._id === user._id),
        food: (foodRes.data || []).filter(f => f.user?._id === user._id),
        lostFound: (lostFoundRes.data || []).filter(l => l.user?._id === user._id),
        studyGroups: (studyGroupsRes.data || []).filter(s => s.creator?._id === user._id)
      });
    } catch (err) {
      console.error('Failed to load content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMessage({ type: '', text: '' });
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const res = await api.post('/auth/upload-profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data);
      setMessage({ type: 'success', text: 'Profile picture updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed' });
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this?')) return;

    try {
      await api.delete(`/${type}/${id}`);
      loadMyContent();
      setMessage({ type: 'success', text: 'Deleted successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Delete failed' });
    }
  };

  const getTotalCount = () => {
    return Object.values(allContent).reduce((sum, arr) => sum + arr.length, 0);
  };

  const getFilteredContent = () => {
    if (activeTab === 'all') {
      const all = [];
      Object.entries(allContent).forEach(([type, items]) => {
        items.forEach(item => all.push({ ...item, _type: type }));
      });
      return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return allContent[activeTab] || [];
  };
  // --- End Functionality ---

  // --- New/Refined UI Logic ---
  const renderPostItem = (item, type) => {
    const configs = {
      socialPosts: {
        title: item.content?.text?.substring(0, 60) || 'Social Post',
        subtitle: `${item.likes?.length || 0} Likes • ${item.comments?.length || 0} Comments`,
        link: `/post/${item._id}`,
        Icon: MessageSquare,
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        label: 'Social',
        stats: (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Heart size={14} className='text-red-500' /> {item.likes?.length || 0}</span>
            <span className="flex items-center gap-1"><MessageSquare size={14} /> {item.comments?.length || 0}</span>
          </div>
        )
      },
      events: {
        title: item.title,
        subtitle: `Event on ${new Date(item.date).toLocaleDateString()} at ${item.location}`,
        link: `/events`,
        Icon: Calendar,
        color: 'from-purple-500 to-pink-600',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600',
        label: 'Event',
        stats: <span className="text-sm text-gray-500 font-medium">Interested: {item.interested?.length || 0}</span>
      },
      buysell: {
        title: item.title,
        subtitle: item.description?.substring(0, 50) || 'Item for Sale',
        link: `/buysell/${item._id}`,
        Icon: ShoppingBag,
        color: 'from-green-500 to-emerald-600',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        label: 'Buy/Sell',
        price: `৳${item.price}`,
        stats: <span className="text-green-600 font-bold text-lg">{`৳${item.price}`}</span>
      },
      housing: {
        title: `Housing: ৳${item.rent}/month`,
        subtitle: item.address,
        link: `/housing/${item._id}`,
        Icon: Home,
        color: 'from-orange-500 to-red-600',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-600',
        label: 'Housing',
        price: `৳${item.rent}/mo`,
        stats: <span className="text-orange-600 font-bold text-lg">{`৳${item.rent}/mo`}</span>
      },
      jobs: {
        title: item.title,
        subtitle: item.company,
        link: `/jobs/${item._id}`,
        Icon: Briefcase,
        color: 'from-cyan-500 to-blue-600',
        bgColor: 'bg-cyan-50',
        textColor: 'text-cyan-600',
        label: 'Job',
        stats: <span className="text-sm text-gray-500 font-medium">{item.type}</span>
      },
      food: {
        title: item.restaurant,
        subtitle: item.description?.substring(0, 50) || 'Food order group',
        link: `/food/${item._id}`,
        Icon: Pizza,
        color: 'from-yellow-500 to-orange-600',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-600',
        label: 'Food',
        stats: <span className="text-sm text-gray-500 font-medium">Joined: {item.participants?.length || 0}</span>
      },
      lostFound: {
        title: item.title,
        subtitle: `Status: ${item.status}`,
        link: `/lost-found/${item._id}`,
        Icon: Search,
        color: 'from-red-500 to-pink-600',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        label: 'Lost/Found',
        stats: <span className={`text-sm font-semibold ${item.status === 'Lost' ? 'text-red-500' : 'text-green-500'}`}>{item.status}</span>
      },
      studyGroups: {
        title: item.name,
        subtitle: `Topic: ${item.topic}`,
        link: `/study-groups/${item._id}`,
        Icon: BookOpen,
        color: 'from-indigo-500 to-purple-600',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-600',
        label: 'Study Group',
        stats: <span className="text-sm text-gray-500 font-medium">Members: {item.members?.length || 0}</span>
      }
    };

    const config = configs[type];
    if (!config) return null;

    const image = item.images?.[0] || item.image || item.photos?.[0] || null;

    return (
      <Link
        key={item._id}
        to={config.link}
        className="block bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-indigo-400 transition-all duration-300 cursor-pointer group flex overflow-hidden"
      >
        {/* Icon/Image Section */}
        <div className="w-24 shrink-0 relative">
          {image ? (
            <img src={image} alt={config.title} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white`}>
              <config.Icon size={36} />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-1">
              <h4 className="font-extrabold text-gray-900 text-base leading-snug group-hover:text-indigo-600 transition line-clamp-2">
                {config.title}
              </h4>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(item._id, type);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg shrink-0"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
            <p className="text-sm text-gray-600 line-clamp-1">{config.subtitle}</p>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            {/* Stats/Price */}
            {config.stats}

            <div className="flex items-center gap-4">
              {/* Date */}
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              {/* Category Tag */}
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${config.bgColor} ${config.textColor}`}>
                {config.label}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const tabConfig = [
    { key: 'all', label: 'All Posts', Icon: List, count: getTotalCount() },
    { key: 'socialPosts', label: 'Social', Icon: MessageSquare, count: allContent.socialPosts.length },
    { key: 'events', label: 'Events', Icon: Calendar, count: allContent.events.length },
    { key: 'buysell', label: 'Buy/Sell', Icon: ShoppingBag, count: allContent.buysell.length },
    { key: 'housing', label: 'Housing', Icon: Home, count: allContent.housing.length },
    { key: 'jobs', label: 'Jobs', Icon: Briefcase, count: allContent.jobs.length },
    { key: 'food', label: 'Food', Icon: Pizza, count: allContent.food.length },
    { key: 'lostFound', label: 'Lost/Found', Icon: Search, count: allContent.lostFound.length },
    { key: 'studyGroups', label: 'Study Groups', Icon: BookOpen, count: allContent.studyGroups.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">My Dashboard</h1>

        {message.text && (
          <div className={`mb-6 px-4 py-3 rounded-xl border-l-4 font-medium ${message.type === 'success'
            ? 'bg-green-50 border-green-500 text-green-700'
            : 'bg-red-50 border-red-500 text-red-700'
            }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar - Modern Design */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-1 sticky top-10">
              <div className="bg-white rounded-3xl p-6">
                {/* Profile Picture Section */}
                <div className="text-center mb-6">
                  <div className="relative inline-block group">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-xl ring-4 ring-indigo-100"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center text-white text-5xl font-bold shadow-xl ring-4 ring-indigo-100">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Camera Button - Always Visible on Mobile, Hover on Desktop */}
                    <label
                      htmlFor="profile-pic-upload"
                      className="absolute bottom-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-full cursor-pointer hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg lg:opacity-0 lg:group-hover:opacity-100 transform hover:scale-110"
                      title="Change Profile Picture"
                    >
                      <Camera className="w-5 h-5" />
                    </label>
                    <input
                      id="profile-pic-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* User Info */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{user?.name}</h2>
                  <p className="text-sm text-gray-500 mb-3">{user?.email}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full text-sm font-bold border border-indigo-200">
                      🎓 {user?.department}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <Link
                  to={`/profile/${user?._id}`}
                  className="w-full block text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-3"
                >
                  ✨ View Full Profile
                </Link>

                {/* Quick Action Buttons */}
                {/* <div className="grid grid-cols-2 gap-2 mb-4">
                  <Link
                    to="/chat"
                    className="text-center bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition text-sm"
                  >
                    💬 Messages
                  </Link>
                  <Link
                    to="/saved"
                    className="text-center bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition text-sm"
                  >
                    ❤️ Saved
                  </Link>
                </div> */}

                {/* Quick Stats Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700">Total Posts</span>
                    <span className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {getTotalCount()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((getTotalCount() / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">Keep creating amazing content! 🚀</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">

            {/* Filter Tabs */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100 overflow-x-auto whitespace-nowrap">
              <div className="flex gap-3">
                {tabConfig.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition flex items-center gap-2 ${activeTab === tab.key
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <tab.Icon size={18} /> {tab.label} <span className={`ml-1 px-2 rounded-full text-xs ${activeTab === tab.key ? 'bg-indigo-700/50' : 'bg-white'}`}>{tab.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content List */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-5 border-b pb-3 border-gray-100">
                {activeTab === 'all' ? 'All My Posts' : `My ${tabConfig.find(t => t.key === activeTab)?.label}`}
              </h2>

              {loading ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-indigo-600 font-semibold mt-3">Loading your content...</p>
                </div>
              ) : getFilteredContent().length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 text-xl font-semibold">No {tabConfig.find(t => t.key === activeTab)?.label} yet</p>
                  <p className="text-gray-400 text-sm mt-2">Start creating content to see it here!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredContent().map(item =>
                    renderPostItem(item, item._type || activeTab)
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;