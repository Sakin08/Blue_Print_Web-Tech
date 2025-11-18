import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import { CheckCircle, MapPin, Phone, UserCheck, Clock, HeartHandshake, Calendar, BarChart3, ChevronRight } from 'lucide-react'; // Suggested icons

const DonorCard = ({ donor, isEligible, daysLeft }) => {
    const { user } = useAuth();
    const eligible = isEligible(donor);
    const daysUntilEligible = daysLeft(donor.nextEligibleDate);
    const isOwnProfile = user && donor.user && user._id === donor.user._id;

    // Dynamic classes based on eligibility status
    const primaryColor = eligible ? 'green' : 'yellow';
    const primaryClass = eligible ? 'border-green-500' : 'border-yellow-500';
    const accentClass = eligible ? 'text-green-600' : 'text-yellow-600';
    const bgAccentClass = eligible ? 'bg-green-50' : 'bg-yellow-50';

    return (
        <div className={`
            bg-white rounded-xl shadow-lg 
            hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 
            overflow-hidden border-2 ${primaryClass} flex flex-col
        `}>
            {/* 1. TOP HEADER & BLOOD GROUP */}
            <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                    {/* User Info (Left) */}
                    <div className="flex-1 min-w-0 flex gap-3 items-center">
                        <Link to={`/profile/${donor.user._id}`}>
                            <UserAvatar user={donor.user} size="lg" />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <Link
                                to={`/profile/${donor.user._id}`}
                                className="font-extrabold text-xl text-gray-900 hover:text-red-600 transition block truncate"
                            >
                                {donor.user.name}
                            </Link>
                            <p className="text-sm text-gray-600 truncate mb-1">{donor.user.department}</p>
                            {/* Verification Badge */}
                            {donor.user.isStudentVerified && (
                                <span className="inline-flex items-center gap-1 text-blue-600 text-xs font-semibold py-0.5 px-2 rounded-full bg-blue-50">
                                    <UserCheck size={14} /> Verified Student
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Blood Group (Right - Accentuated) */}
                    <div className={`flex flex-col items-center bg-red-50/70 px-4 py-2 rounded-xl border border-red-200`}>
                        <div className="text-4xl font-extrabold text-red-700 leading-none">
                            {donor.bloodGroup}
                        </div>
                        <div className="text-xs font-medium text-red-500 mt-1">BLOOD</div>
                    </div>
                </div>
            </div>

            {/* 2. ELIGIBILITY STATUS (MAIN CALLOUT) */}
            <div className={`p-4 mx-4 rounded-xl shadow-inner border-2 ${primaryClass} ${bgAccentClass} mb-4`}>
                {eligible ? (
                    <div className="flex items-center justify-center gap-3">
                        <CheckCircle size={28} className="text-green-600" />
                        <p className="text-lg font-bold text-green-700">
                            Available to Donate Now!
                        </p>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-xl font-extrabold mb-1 text-yellow-700 leading-snug flex items-center justify-center gap-2">
                            <Clock size={24} className="text-yellow-600" />
                            Eligible in <span className="text-2xl">{daysUntilEligible}</span> days
                        </p>
                        {donor.nextEligibleDate && (
                            <p className="text-sm text-gray-600">
                                Next eligible date: {new Date(donor.nextEligibleDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* 3. INFO GRID (Consolidated) */}
            <div className="p-6 pt-0 flex flex-col flex-grow space-y-3">

                {/* Location */}
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl shadow-sm">
                    <MapPin size={20} className="text-red-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{donor.location}</span>
                </div>

                {/* Contact */}
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl shadow-sm">
                    <Phone size={20} className="text-green-500 flex-shrink-0" />
                    <a href={`tel:${donor.phone}`} className="text-sm font-medium text-gray-700 hover:text-green-600 transition">
                        {donor.phone}
                    </a>
                </div>

                {/* Total Donations */}
                <div className="flex items-center justify-between bg-red-50/70 px-4 py-3 rounded-xl shadow-sm border border-red-100">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={20} className="text-red-600" />
                        <span className="text-sm font-semibold text-gray-700">Total Donations</span>
                    </div>
                    <span className="text-xl font-extrabold text-red-700">{donor.totalDonations}</span>
                </div>

                {/* Last Donation Date */}
                {donor.lastDonationDate && (
                    <div className="flex items-center gap-3 px-4 py-2 border-t border-gray-100 mt-2">
                        <Calendar size={18} className="text-gray-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600">
                            Last donated: {new Date(donor.lastDonationDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                )}
            </div>

            {/* 4. Footer Actions */}
            <div className="p-4 pt-0">
                {isOwnProfile ? (
                    <Link
                        to="/blood-donation/edit"
                        className="block w-full text-center py-2.5 rounded-xl font-semibold text-sm transition bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                    >
                        Edit Profile
                    </Link>
                ) : (
                    <div className="flex gap-2">
                        <Link
                            to={`/chat/${donor.user._id}`}
                            className="flex-1 text-center py-2.5 rounded-xl font-semibold text-sm transition bg-red-600 hover:bg-red-700 text-white shadow-md"
                        >
                            Contact
                        </Link>
                        <Link
                            to={`/profile/${donor.user._id}`}
                            className="flex-1 text-center py-2.5 rounded-xl font-semibold text-sm transition bg-gray-100 hover:bg-gray-200 text-gray-700"
                        >
                            Profile
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonorCard;