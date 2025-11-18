import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { ArrowLeft, Trash2, Edit, Eye, Ban, CheckCircle } from 'lucide-react';

const ContentManager = () => {
    const { type } = useParams(); // events, jobs, housing, etc.
    const { user } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        loadItems();
    }, [user, navigate, type]);

    const loadItems = async () => {
        try {
            setLoading(true);
            const endpoint = getEndpoint(type);
            const res = await api.get(endpoint);
            setItems(res.data);
        } catch (error) {
            console.error('Failed to load items:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEndpoint = (contentType) => {
        const endpoints = {
            'events': '/admin/events',
            'jobs': '/admin/jobs',
            'housing': '/admin/housing',
            'marketplace': '/admin/buy-sell',
            'lost-found': '/admin/lost-found',
            'study-groups': '/admin/study-groups',
            'posts': '/admin/posts',
            'blood-donors': '/admin/blood-donors',
            'blood-requests': '/admin/blood-requests',
            'comments': '/admin/comments',
            'reviews': '/admin/reviews',
        };
        return endpoints[contentType] || '/admin/posts';
    };

    const handleDelete = async (itemId) => {
        if (!confirm('Delete this item permanently?')) return;
        try {
            const endpoint = getEndpoint(type);
            await api.delete(`${endpoint}/${itemId}`);
            alert('Item deleted successfully');
            loadItems();
        } catch (error) {
            alert('Failed to delete item');
        }
    };

    const getTitle = () => {
        const titles = {
            'events': 'Events Management',
            'jobs': 'Jobs Management',
            'housing': 'Housing Management',
            'marketplace': 'Marketplace Management',
            'lost-found': 'Lost & Found Management',
            'study-groups': 'Study Groups Management',
            'posts': 'Posts Management',
            'blood-donors': 'Blood Donors Management',
            'blood-requests': 'Blood Requests Management',
            'comments': 'Comments Management',
            'reviews': 'Reviews Management',
        };
        return titles[type] || 'Content Management';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </button>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">{getTitle()}</h1>

                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No items found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Title/Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Author</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item._id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium">
                                                {item.title || item.name || item.itemName || item.subject || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                {item.postedBy?.name || item.organizer?.name || item.creator?.name || item.user?.name || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <p className="text-sm text-gray-500 mt-4">Total: {items.length} items</p>
                </div>
            </div>
        </div>
    );
};

export default ContentManager;
