import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CommentsSection from '../components/CommentsSection';
import PosterInfo from '../components/PosterInfo';
import MessageButton from '../components/MessageButton';
import FavoriteButton from '../components/FavoriteButton';
import {
    ArrowLeft, MapPin, DollarSign, Clock, Eye, Mail, Phone,
    ExternalLink, Briefcase, Calendar, Tag, MessageCircle, Trash2, CheckCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const JobDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        loadJob();
    }, [id]);

    const loadJob = async () => {
        try {
            const res = await axios.get(`${API_URL}/jobs/${id}`);
            setJob(res.data);
            setHasApplied(res.data.applicants?.includes(user?._id));
        } catch (err) {
            console.error('Failed to load job:', err);
        }
        setLoading(false);
    };

    const handleApply = async () => {
        if (!user) {
            alert('You must be logged in to apply for a job.');
            navigate('/login');
            return;
        }

        try {
            setHasApplied(true);
            await axios.post(`${API_URL}/jobs/${id}/apply`, {}, { withCredentials: true });
            alert('Application submitted successfully!');
        } catch (err) {
            setHasApplied(false);
            alert(err.response?.data?.message || 'Failed to apply.');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this job posting?')) return;

        try {
            await axios.delete(`${API_URL}/jobs/${id}`, { withCredentials: true });
            navigate('/jobs');
        } catch (err) {
            alert('Failed to delete job.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center bg-white p-10 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
                    <Link to="/jobs" className="text-indigo-600 hover:text-indigo-700 font-medium">
                        ← Back to Jobs
                    </Link>
                </div>
            </div>
        );
    }

    const isOwner = job.poster && user && job.poster._id === user._id;

    const jobTypeClasses = (type) => {
        switch (type) {
            case 'full-time': return 'bg-blue-500';
            case 'part-time': return 'bg-yellow-500';
            case 'internship': return 'bg-purple-500';
            case 'freelance': return 'bg-teal-500';
            default: return 'bg-gray-500';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <Link
                    to="/jobs"
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Jobs
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* Images Gallery */}
                            {job.images && job.images.length > 0 && (
                                <div className="relative">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4">
                                        {job.images.map((image, idx) => (
                                            <a
                                                key={idx}
                                                href={image}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="relative group overflow-hidden rounded-lg"
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${job.company} - Image ${idx + 1}`}
                                                    className="w-full h-48 object-cover group-hover:scale-110 transition"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                    <div className="absolute top-8 left-8 flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${jobTypeClasses(job.type)}`}>
                                            {job.type.replace('-', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="absolute top-8 right-8">
                                        <FavoriteButton postType="job" postId={job._id} />
                                    </div>
                                </div>
                            )}

                            <div className="p-6">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                                <p className="text-xl text-indigo-600 font-semibold mb-4 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5" />
                                    {job.company}
                                </p>

                                {/* Deadline */}
                                {job.applicationDeadline && (
                                    <div className="mb-6">
                                        <span className="text-sm text-red-600 flex items-center gap-1 font-medium bg-red-50 px-3 py-1.5 rounded-full inline-flex">
                                            <Calendar className="w-4 h-4" />
                                            Deadline: {formatDate(job.applicationDeadline)}
                                        </span>
                                    </div>
                                )}

                                {/* Quick Info Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-indigo-50 rounded-lg p-4 text-center">
                                        <MapPin className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                                        <p className="text-xs text-gray-600">Location</p>
                                        <p className="font-semibold text-gray-900 text-sm">{job.location}</p>
                                    </div>

                                    {job.salary && (
                                        <div className="bg-green-50 rounded-lg p-4 text-center">
                                            {/* <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" /> */}
                                            TK
                                            <p className="text-xs text-gray-600">Salary</p>
                                            <p className="font-semibold text-gray-900 text-sm">{job.salary}</p>
                                        </div>
                                    )}

                                    {job.duration && (
                                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                                            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                            <p className="text-xs text-gray-600">Duration</p>
                                            <p className="font-semibold text-gray-900 text-sm">{job.duration}</p>
                                        </div>
                                    )}

                                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                                        <Eye className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                        <p className="text-xs text-gray-600">Views</p>
                                        <p className="font-semibold text-gray-900 text-sm">{job.views || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-indigo-600" />
                                Job Description
                            </h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
                        </div>

                        {/* Requirements */}
                        {job.requirements && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                                    Requirements
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.requirements}</p>
                            </div>
                        )}

                        {/* Skills */}
                        {job.skills && job.skills.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-indigo-600" />
                                    Required Skills
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {job.skills.map((skill, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <CommentsSection postType="job" postId={id} />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Poster Info Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Posted By</h3>
                            <PosterInfo user={job.poster} createdAt={job.createdAt} />

                            {/* Contact Details */}
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Mail className="w-5 h-5 text-indigo-600" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-600">Email</p>
                                        <a href={`mailto:${job.contactEmail}`} className="font-semibold text-gray-900 hover:text-indigo-600 text-sm truncate block">
                                            {job.contactEmail}
                                        </a>
                                    </div>
                                </div>

                                {job.contactPhone && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Phone className="w-5 h-5 text-indigo-600" />
                                        <div>
                                            <p className="text-xs text-gray-600">Phone</p>
                                            <a href={`tel:${job.contactPhone}`} className="font-semibold text-gray-900 hover:text-indigo-600 text-sm">
                                                {job.contactPhone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {job.applicationLink && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <ExternalLink className="w-5 h-5 text-indigo-600" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-600">Application Link</p>
                                            <a
                                                href={job.applicationLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-semibold text-indigo-600 hover:text-indigo-700 text-sm truncate block"
                                            >
                                                Apply Here
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 space-y-2">
                                {/* Apply Button */}
                                {user && !isOwner && !hasApplied && (
                                    <button
                                        onClick={handleApply}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Apply Now
                                    </button>
                                )}

                                {user && !isOwner && hasApplied && (
                                    <button
                                        disabled
                                        className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Applied
                                    </button>
                                )}

                                {/* Contact Buttons */}
                                {user && !isOwner && job.poster && (
                                    <>
                                        <MessageButton recipientId={job.poster._id} />
                                        <a
                                            href={`mailto:${job.contactEmail}`}
                                            className="w-full bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border-2 border-gray-300"
                                        >
                                            <Mail className="w-4 h-4" />
                                            Send Email
                                        </a>
                                    </>
                                )}

                                {/* Login Prompt */}
                                {!user && (
                                    <Link
                                        to="/login"
                                        className="w-full text-center block bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
                                    >
                                        Log in to Apply
                                    </Link>
                                )}

                                {/* Owner Actions */}
                                {isOwner && (
                                    <>
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                                            <p className="text-sm text-blue-800">This is your post</p>
                                        </div>
                                        <button
                                            onClick={handleDelete}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                                        >
                                            <Trash2 size={16} />
                                            Delete Job
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;
