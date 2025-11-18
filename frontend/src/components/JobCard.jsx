import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canDelete } from '../utils/permissions';
import PosterInfo from './PosterInfo';

const JobCard = ({ job, onDelete }) => {
    const { user } = useAuth();
    const showDelete = onDelete && canDelete(user, job.poster);

    return (
        <div className="relative">
            <Link
                to={`/jobs/${job._id}`}
                className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6"
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">{job.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.type === 'full-time' ? 'bg-blue-100 text-blue-700' :
                                job.type === 'part-time' ? 'bg-yellow-100 text-yellow-700' :
                                    job.type === 'internship' ? 'bg-purple-100 text-purple-700' :
                                        job.type === 'freelance' ? 'bg-green-100 text-green-700' :
                                            'bg-gray-100 text-gray-700'
                                }`}>
                                {job.type.replace('-', ' ').toUpperCase()}
                            </span>
                        </div>

                        <p className="text-lg text-indigo-600 font-semibold mb-3">{job.company}</p>
                        <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {job.location}
                            </span>
                            {job.salary && (
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {job.salary}
                                </span>
                            )}
                            {job.duration && (
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {job.duration}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {job.views || 0} views
                            </span>
                        </div>

                        {job.skills && job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {job.skills.slice(0, 5).map((skill, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Poster Info */}
                        {job.poster && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <PosterInfo user={job.poster} createdAt={job.createdAt} />
                            </div>
                        )}
                    </div>

                    <div className="text-right ml-4 flex flex-col justify-between">
                        <div>
                            {job.applicationDeadline && (
                                <div className="text-sm text-gray-500 mb-2">
                                    Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                                </div>
                            )}
                        </div>

                        {/* Delete Button */}
                        {showDelete && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (window.confirm('Are you sure you want to delete this job posting?')) {
                                        onDelete(job._id);
                                    }
                                }}
                                className="text-red-600 hover:bg-red-600 hover:text-white px-3 py-2 rounded-lg border border-red-200 transition-all duration-200 text-sm font-semibold mt-4"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default JobCard;
