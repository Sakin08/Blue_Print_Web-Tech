import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LostFoundCard from '../components/LostFoundCard';
import { Search, PlusCircle, AlertTriangle, CheckCircle, Frown } from 'lucide-react'; // Suggested icons

const LostFound = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { user } = useAuth();

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const res = await api.get('/lost-found?status=all');
            setItems(res.data);
        } catch (err) {
            console.error('Failed to load items:', err);
        }
        setLoading(false);
    };

    const handleDelete = async (itemId) => {
        try {
            await api.delete(`/lost-found/${itemId}`);
            setItems(items.filter(item => item._id !== itemId));
        } catch (err) {
            console.error('Failed to delete item:', err);
            alert(err.response?.data?.message || 'Failed to delete item. Please try again.');
        }
    };

    const filteredItems = items.filter(item => {
        if (filter === 'all') return true;
        return item.type === filter;
    });

    // --- Loading State Enhancement ---
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center p-8 bg-gray-50 rounded-xl shadow-lg">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-gray-700">Searching for missing items...</p>
                </div>
            </div>
        );
    }

    // --- Main Render (Enhanced UI) ---
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl">

                {/* Header and Action Button */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                            <Search size={32} className="inline-block mr-2 text-red-600" /> Lost & Found
                        </h1>
                        <p className="text-gray-600 mt-1">Help reunite people with their missing belongings quickly.</p>
                    </div>
                    {user && (
                        <Link
                            to="/lost-found/create"
                            className="flex items-center bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg transform hover:-translate-y-0.5 text-lg"
                        >
                            <PlusCircle size={20} className="mr-2" />
                            Report Item
                        </Link>
                    )}
                </div>

                {/* Filters (Enhanced design) */}
                <div className="bg-white rounded-2xl shadow-xl p-3 mb-10 border border-gray-100">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex items-center px-5 py-2 rounded-xl font-semibold transition ${filter === 'all' ? 'bg-red-600 text-white shadow-md' : 'text-gray-700 hover:bg-red-50'}`}
                        >
                            All Items
                        </button>
                        <button
                            onClick={() => setFilter('lost')}
                            className={`flex items-center px-5 py-2 rounded-xl font-semibold transition ${filter === 'lost' ? 'bg-red-600 text-white shadow-md' : 'text-gray-700 hover:bg-red-50'}`}
                        >
                            <AlertTriangle size={18} className={`mr-2 ${filter === 'lost' ? 'text-white' : 'text-red-500'}`} /> Lost
                        </button>
                        <button
                            onClick={() => setFilter('found')}
                            className={`flex items-center px-5 py-2 rounded-xl font-semibold transition ${filter === 'found' ? 'bg-green-600 text-white shadow-md' : 'text-gray-700 hover:bg-green-50'}`}
                        >
                            <CheckCircle size={18} className={`mr-2 ${filter === 'found' ? 'text-white' : 'text-green-500'}`} /> Found
                        </button>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map(item => (
                        <LostFoundCard key={item._id} item={item} onDelete={handleDelete} />
                    ))}
                </div>

                {/* Empty State (Enhanced design) */}
                {filteredItems.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 shadow-md mt-8">
                        <Frown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Nothing found here</h3>
                        <p className="text-gray-500 text-base">
                            {filter === 'all' ? 'No items have been reported yet.' : `No ${filter} items matching this filter at the moment.`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LostFound;