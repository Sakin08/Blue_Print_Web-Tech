const FilterBar = ({ filters, onFilterChange, type }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Sort */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                        value={filters.sort}
                        onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        {type === 'buysell' && (
                            <>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </>
                        )}
                        {type === 'housing' && (
                            <>
                                <option value="rent-low">Rent: Low to High</option>
                                <option value="rent-high">Rent: High to Low</option>
                            </>
                        )}
                    </select>
                </div>

                {/* Price/Rent Range */}
                {type === 'buysell' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (৳)</label>
                            <input
                                type="number"
                                value={filters.minPrice || ''}
                                onChange={(e) => onFilterChange({ ...filters, minPrice: e.target.value })}
                                placeholder="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (৳)</label>
                            <input
                                type="number"
                                value={filters.maxPrice || ''}
                                onChange={(e) => onFilterChange({ ...filters, maxPrice: e.target.value })}
                                placeholder="Any"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </>
                )}

                {type === 'housing' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Min Rent (৳)</label>
                            <input
                                type="number"
                                value={filters.minRent || ''}
                                onChange={(e) => onFilterChange({ ...filters, minRent: e.target.value })}
                                placeholder="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Rent (৳)</label>
                            <input
                                type="number"
                                value={filters.maxRent || ''}
                                onChange={(e) => onFilterChange({ ...filters, maxRent: e.target.value })}
                                placeholder="Any"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </>
                )}

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                        type="text"
                        value={filters.location || ''}
                        onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
                        placeholder="Any location"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <button
                onClick={() => onFilterChange({ sort: 'newest' })}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
                Clear Filters
            </button>
        </div>
    );
};

export default FilterBar;
