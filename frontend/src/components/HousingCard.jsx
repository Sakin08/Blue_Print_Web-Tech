import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canDelete } from '../utils/permissions';
import PosterInfo from './PosterInfo';
import SaveButton from './SaveButton';
import { MapPin, Phone, UserPlus, Camera, Home, Trash2, ArrowRight } from 'lucide-react'; // Suggested icons

const HousingCard = ({ post, onDelete }) => {
    const { user: currentUser } = useAuth();
    const showDelete = onDelete && canDelete(currentUser, post.user);
    const mainImage = post.images?.[0];

    // Helper to format rent price
    const formatRent = (rent) => {
        return rent?.toLocaleString('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).replace('BDT', '৳');
    };

    return (
        <div className="
            group bg-white rounded-xl border border-gray-200 
            hover:shadow-lg hover:border-blue-400 transition-all duration-300 
            transform hover:-translate-y-0.5 overflow-hidden flex flex-col
        ">
            {/* 1. IMAGE & BADGES SECTION */}
            <Link to={`/housing/${post._id}`} className="block relative h-52 bg-gray-100 overflow-hidden">
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt={post.address || 'Housing listing'}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                        <Home className="w-16 h-16 text-gray-400 opacity-70" />
                    </div>
                )}

                {/* Save Button */}
                <div className="absolute top-3 left-3 z-10" onClick={(e) => e.preventDefault()}>
                    <SaveButton postId={post._id} postType="housing" />
                </div>

                {/* Roommate/Type Badge */}
                {post.roommatesNeeded ? (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                        <UserPlus size={14} />
                        {post.roommatesNeeded} roommate{post.roommatesNeeded > 1 ? 's' : ''} needed
                    </div>
                ) : post.type && ( // Example: show housing type if no roommate needed
                    <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                        {post.type}
                    </div>
                )}

                {/* Image Count */}
                {post.images?.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 backdrop-blur-sm">
                        <Camera size={12} /> {post.images.length}
                    </div>
                )}
            </Link>

            {/* 2. CONTENT SECTION */}
            <div className="p-4 flex flex-col flex-grow">

                {/* RENT */}
                <div className="flex justify-between items-baseline mb-2 border-b border-gray-100 pb-2">
                    <h3 className="font-extrabold text-3xl text-gray-900 leading-tight">
                        {formatRent(post.rent)}
                        <span className="text-sm font-medium text-gray-500">/mo</span>
                    </h3>
                </div>

                {/* ADDRESS (Location) */}
                <div className="flex items-center text-base text-gray-700 font-medium mb-3">
                    <MapPin size={18} className="mr-2 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{post.address}</span>
                </div>

                {/* DESCRIPTION */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                    {post.description}
                </p>

                {/* POSTER INFO (Phone removed for clean footer) */}
                <div className="border-t border-gray-100 pt-3">
                    <PosterInfo user={post.user} createdAt={post.createdAt} />
                </div>

                {/* FOOTER ACTIONS */}
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100">

                    {/* View Details Link (Primary Action) */}
                    <Link
                        to={`/housing/${post._id}`}
                        className="flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                    >
                        View Details
                        <ArrowRight size={16} className="ml-1" />
                    </Link>

                    {/* Contact (Phone) - Moved to secondary position */}
                    {post.phone && (
                        <a href={`tel:${post.phone}`} className="flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors mr-3">
                            <Phone size={16} className="mr-1" />
                            Call
                        </a>
                    )}

                    {/* Delete Button */}
                    {showDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this housing post?')) {
                                    onDelete(post._id);
                                }
                            }}
                            className="text-red-600 hover:text-white hover:bg-red-500 px-3 py-1 rounded-md text-xs font-semibold transition"
                        >
                            <Trash2 size={14} className="inline-block mr-1" />
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HousingCard;