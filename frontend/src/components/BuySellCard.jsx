import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canDelete } from "../utils/permissions";
import PosterInfo from "./PosterInfo";
import SaveButton from "./SaveButton";
import { MapPin, Eye, Camera } from "lucide-react";

const BuySellCard = ({ post, onDelete }) => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    // Check if current user can delete this post
    const showDelete = onDelete && canDelete(currentUser, post.user);

    const mainImage = post.images?.[0] || post.image;
    const hasMultipleImages = post.images && post.images.length > 1;

    const formatPrice = (price) =>
        "৳" + Number(price).toLocaleString("en-BD");

    const handleCardClick = (e) => {
        if (
            e.target.closest("button") ||
            e.target.closest("a") ||
            e.target.closest(".save-area")
        ) {
            return;
        }
        navigate(`/buysell/${post._id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="
                group bg-white rounded-xl shadow-sm border border-gray-100
                hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 
                cursor-pointer overflow-hidden flex flex-col relative
                hover:border-blue-100
            "
        >
            {/* IMAGE SECTION */}
            <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                {mainImage ? (
                    <>
                        <img
                            src={mainImage}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            alt={post.title}
                        />
                        {/* Enhanced gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                    </>
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <Camera className="w-20 h-20 text-gray-300" strokeWidth={1.5} />
                    </div>
                )}

                {/* Save Button - Enhanced */}
                <div
                    className="absolute top-4 right-4 z-20 save-area opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="backdrop-blur-md bg-white/90 rounded-full p-0.5 shadow-lg">
                        <SaveButton postId={post._id} postType="buysell" />
                    </div>
                </div>

                {/* Multiple images badge - Enhanced */}
                {hasMultipleImages && (
                    <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 shadow-lg">
                        <Camera size={16} strokeWidth={2} />
                        <span>{post.images.length} photos</span>
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="p-4 flex flex-col flex-grow">

                {/* TITLE */}
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                    {post.title}
                </h3>

                {/* PRICE - Enhanced styling */}
                <div className="mb-3">
                    <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 tracking-tight">
                        {formatPrice(post.price)}
                    </p>
                </div>

                {/* LOCATION - Enhanced */}
                <div className="flex items-center text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg px-3 py-2 max-w-full">
                    <MapPin size={16} className="mr-2 text-blue-500 flex-shrink-0" strokeWidth={2} />
                    <span className="truncate font-medium">{post.location}</span>
                </div>

                {/* DESCRIPTION */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                    {post.description}
                </p>

                {/* POSTER INFO */}
                <div className="border-t border-gray-100 pt-3 mt-auto bg-gradient-to-r from-gray-50/50 to-transparent -mx-4 px-4 pb-1 rounded-b-lg">
                    <PosterInfo user={post.user} createdAt={post.createdAt} />
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-gray-100">
                    {/* Views - Enhanced */}
                    <div className="flex items-center text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                        <Eye size={16} className="mr-2 text-gray-400" strokeWidth={2} />
                        <span className="font-semibold text-gray-700">{post.views?.toLocaleString() || 0}</span>
                        <span className="ml-1">views</span>
                    </div>

                    {/* Delete Button - Enhanced */}
                    {showDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Delete this post?")) {
                                    onDelete(post._id);
                                }
                            }}
                            className="
                                text-red-600 px-4 py-2 rounded-lg border border-red-200
                                hover:bg-red-600 hover:text-white hover:border-red-600
                                transition-all duration-200 text-xs font-semibold
                                hover:shadow-md active:scale-95
                            "
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuySellCard;