import { useState, useEffect } from 'react';

const SearchFilter = ({ onFilterChange, type = 'events' }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        sortBy: 'date',
        priceMin: '',
        priceMax: '',
        dateFrom: '',
        dateTo: '',
        location: '',
    });
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const debounce = setTimeout(() => {
            onFilterChange({ searchTerm, ...filters });
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchTerm, filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({
            sortBy: 'date',
            priceMin: '',
            priceMax: '',
            dateFrom: '',
            dateTo: '',
            location: '',
        });
    };

    const hasActiveFilters = searchTerm || filters.priceMin || filters.priceMax ||
        filters.dateFrom || filters.dateTo || filters.location;

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            {/* Search Bar */}
            <div className="flex gap-3 items-center">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder={`Search ${type}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 flex items-center gap-2 transition"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Filters
                    {hasActiveFilters && (
                        <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                            Active
                        </span>
                    )}
                </button>

                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Advanced Filters */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Sort By */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="date">Date</option>
                            <option value="popular">Most Popular</option>
                            <option value="recent">Recently Added</option>
                            {type === 'buysell' && <option value="price-low">Price: Low to High</option>}
                            {type === 'buysell' && <option value="price-high">Price: High to Low</option>}
                        </select>
                    </div>

                    {/* Price Range (for buy/sell) */}
                    {type === 'buysell' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                                <input
                                    type="number"
                                    placeholder="$0"
                                    value={filters.priceMin}
                                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                                <input
                                    type="number"
                                    placeholder="$1000"
                                    value={filters.priceMax}
                                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </>
                    )}

                    {/* Date Range (for events) */}
                    {type === 'events' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </>
                    )}

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                            type="text"
                            placeholder="Enter location"
                            value={filters.location}
                            onChange={(e) => handleFilterChange('location', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchFilter;
