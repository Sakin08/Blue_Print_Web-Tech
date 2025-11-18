import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BuySellCard from '../components/BuySellCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import FilterBar from '../components/FilterBar.jsx';
import api from '../api/buysell.js';

const BuySell = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ sort: 'newest' });

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allPosts, searchQuery, filters]);

  const loadPosts = async () => {
    try {
      const res = await api.getAll();
      setAllPosts(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setError('Failed to load posts');
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await api.remove(postId);
      // Remove the deleted post from state
      setAllPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert(err.response?.data?.message || 'Failed to delete post. Please try again.');
    }
  };

  const applyFilters = () => {
    let result = [...allPosts];

    // Search filter
    if (searchQuery) {
      result = result.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    if (filters.minPrice) {
      result = result.filter(post => post.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(post => post.price <= Number(filters.maxPrice));
    }

    // Location filter
    if (filters.location) {
      result = result.filter(post =>
        post.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Sort
    switch (filters.sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
    }

    setFilteredPosts(result);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) return <div className="container mx-auto p-6 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                🛍️ Buy & Sell
              </h1>
              <p className="text-gray-600">Find great deals or sell your items</p>
            </div>
            <Link
              to="/buysell/create"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Post
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search for items, locations, or descriptions..."
          />
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            type="buysell"
          />
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-gray-900">
              {filteredPosts.length}
            </span>
            <span className="text-gray-600">
              {filteredPosts.length === 1 ? 'item' : 'items'} found
            </span>
            {filteredPosts.length !== allPosts.length && (
              <span className="text-gray-400">
                (filtered from {allPosts.length} total)
              </span>
            )}
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear search
            </button>
          )}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || filters.location || filters.minPrice || filters.maxPrice
                    ? "Try adjusting your search or filters"
                    : "Be the first to post an item!"}
                </p>
                {(searchQuery || filters.location || filters.minPrice || filters.maxPrice) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({ sort: 'newest' });
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredPosts.map(post => (
              <BuySellCard
                key={post._id}
                post={post}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BuySell;