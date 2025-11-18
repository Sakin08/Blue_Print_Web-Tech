import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { user } = useAuth();

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const res = await api.get('/jobs');
            setJobs(res.data);
        } catch (err) {
            console.error('Failed to load jobs:', err);
        }
        setLoading(false);
    };

    const handleDelete = async (jobId) => {
        try {
            await api.delete(`/jobs/${jobId}`);
            setJobs(jobs.filter(job => job._id !== jobId));
        } catch (err) {
            console.error('Failed to delete job:', err);
            alert(err.response?.data?.message || 'Failed to delete job. Please try again.');
        }
    };

    const filteredJobs = jobs.filter(job => {
        if (filter === 'all') return true;
        return job.type === filter;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">💼 Jobs & Internships</h1>
                        <p className="text-gray-600 mt-1">Find opportunities to grow your career</p>
                    </div>
                    {user && (
                        <Link
                            to="/jobs/create"
                            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition shadow-lg"
                        >
                            + Post Job
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-8">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'all', label: 'All Jobs', icon: '📋' },
                            { value: 'full-time', label: 'Full-Time', icon: '💼' },
                            { value: 'part-time', label: 'Part-Time', icon: '⏰' },
                            { value: 'internship', label: 'Internship', icon: '🎓' },
                            { value: 'freelance', label: 'Freelance', icon: '💻' },
                            { value: 'work-study', label: 'Work-Study', icon: '📚' }
                        ].map(({ value, label, icon }) => (
                            <button
                                key={value}
                                onClick={() => setFilter(value)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${filter === value
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {icon} {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Jobs List */}
                {filteredJobs.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                        <div className="text-6xl mb-3">💼</div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Jobs Found</h3>
                        <p className="text-gray-600">Check back later for new opportunities!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredJobs.map(job => (
                            <JobCard key={job._id} job={job} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Jobs;
