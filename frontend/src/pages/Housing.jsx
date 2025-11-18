import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HousingCard from '../components/HousingCard.jsx';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PlusCircle, Search, Frown, Filter, X } from 'lucide-react';

const Housing = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [postTypeFilter, setPostTypeFilter] = useState('all');
  const [housingTypeFilter, setHousingTypeFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [maxRent, setMaxRent] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/housing');
      setPosts(res.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load housing posts:', err);
      setError('Failed to load listings. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to permanently delete this listing?')) {
      try {
        await api.delete(`/housing/${id}`);
        setPosts(posts.filter(p => p._id !== id));
      } catch (err) {
        console.error('Failed to delete listing:', err);
        alert('Failed to delete listing. Please try again.');
      }
    }
  };

  // Apply filters
  const displayPosts = posts
    .filter(post => post.user)
    .filter(post => {
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        return (
          post.title?.toLowerCase().includes(s) ||
          post.location?.toLowerCase().includes(s) ||
          post.address?.toLowerCase().includes(s) ||
          post.description?.toLowerCase().includes(s)
        );
      }
      return true;
    })
    .filter(post => (postTypeFilter !== 'all' ? post.postType === postTypeFilter : true))
    .filter(post => (housingTypeFilter !== 'all' ? post.housingType === housingTypeFilter : true))
    .filter(post => (genderFilter !== 'all' ? post.genderPreference === genderFilter : true))
    .filter(post => (maxRent ? (post.rent || 0) <= Number(maxRent) : true));

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-xl animate-fade-in">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Fetching housing listings...</p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="container mx-auto p-10 mt-10 text-center bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md animate-fade-in">
        <p className="text-xl font-semibold text-red-700">{error}</p>
      </div>
    );
  }

  // --- Main UI ---
  return (
    <div className="min-h-screen bg-gray-50 py-10 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4 sm:mb-0">
            🏡 Housing & Roommates
          </h1>

          {user ? (
            <Link
              to="/housing/create"
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              New Listing
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-blue-600 border border-blue-400 px-4 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              Log in to post a listing
            </Link>
          )}
        </header>

        {/* Search + Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            {/* Toggle Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition shadow-sm ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 animate-slide-down">

              {/* Post Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Post Type</label>
                <select
                  value={postTypeFilter}
                  onChange={(e) => setPostTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="wanted">Wanted</option>
                </select>
              </div>

              {/* Housing Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Housing Type</label>
                <select
                  value={housingTypeFilter}
                  onChange={(e) => setHousingTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="flat">Flat</option>
                  <option value="sublet">Sublet</option>
                  <option value="hostel">Hostel</option>
                  <option value="mess">Mess</option>
                </select>
              </div>

              {/* Gender Preference */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Gender Preference</label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="any">Any</option>
                </select>
              </div>

              {/* Max Rent */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Max Rent (৳)</label>
                <input
                  type="number"
                  value={maxRent}
                  placeholder="e.g., 5000"
                  onChange={(e) => setMaxRent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(searchTerm || postTypeFilter !== 'all' || housingTypeFilter !== 'all' || genderFilter !== 'all' || maxRent) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-600">Active Filters:</span>

              {searchTerm && (
                <FilterBadge label={`Search: ${searchTerm}`} onClear={() => setSearchTerm('')} />
              )}
              {postTypeFilter !== 'all' && (
                <FilterBadge label={postTypeFilter} onClear={() => setPostTypeFilter('all')} />
              )}
              {housingTypeFilter !== 'all' && (
                <FilterBadge label={housingTypeFilter} onClear={() => setHousingTypeFilter('all')} />
              )}
              {genderFilter !== 'all' && (
                <FilterBadge label={genderFilter} onClear={() => setGenderFilter('all')} />
              )}
              {maxRent && (
                <FilterBadge label={`৳${maxRent}`} onClear={() => setMaxRent('')} />
              )}

              <button
                onClick={() => {
                  setSearchTerm('');
                  setPostTypeFilter('all');
                  setHousingTypeFilter('all');
                  setGenderFilter('all');
                  setMaxRent('');
                }}
                className="text-sm text-red-600 hover:text-red-800 font-medium ml-2"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mb-6 text-lg font-medium text-gray-700">
          Showing <span className="font-bold text-blue-600">{displayPosts.length}</span> result
          {displayPosts.length !== 1 ? 's' : ''}.
        </div>

        {/* Posts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayPosts.length === 0 ? (
            <EmptyState />
          ) : (
            displayPosts.map(post => (
              <HousingCard key={post._id} post={post} onDelete={handleDelete} />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

/* ------------ Reusable Components ------------ */

const FilterBadge = ({ label, onClear }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
    {label}
    <X className="w-4 h-4 ml-2 cursor-pointer" onClick={onClear} />
  </span>
);

const EmptyState = () => (
  <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 shadow-md animate-fade-in">
    <Frown className="w-10 h-10 text-gray-400 mx-auto mb-4" />
    <p className="text-xl font-semibold text-gray-700">No housing listings found.</p>
    <p className="text-gray-500 mt-2">Be the first to post a listing in this area!</p>
  </div>
);

export default Housing;
