import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/buysell.js';
import MessageButton from '../components/MessageButton.jsx';
import ImageGallery from '../components/ImageGallery.jsx';
import FavoriteButton from '../components/FavoriteButton.jsx';
import PosterInfo from '../components/PosterInfo.jsx';
import DeleteButton from '../components/DeleteButton.jsx';
import CommentsSection from '../components/CommentsSection.jsx';
import {
  MapPin, Eye, ArrowLeft, Phone, Mail, DollarSign, Tag, MessageCircle, ShoppingBag
} from 'lucide-react';

const BuySellDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      const res = await api.getOne(id);
      setPost(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load post:', err);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.remove(id);
      alert('Post deleted successfully!');
      navigate('/buysell');
    } catch (err) {
      console.error('Failed to delete post:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete post';
      alert(`Error: ${errorMsg}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!post) return <div className="container mx-auto p-6">Post not found</div>;

  // Check if post.user exists (user might have been deleted)
  if (!post.user) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">This post's owner account no longer exists.</p>
          <Link to="/buysell" className="text-blue-600 hover:underline mt-2 inline-block">
            ← Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  const images = post.images && post.images.length > 0 ? post.images : (post.image ? [post.image] : []);
  const isOwnPost = currentUser && post.user && currentUser._id === post.user._id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link
          to="/buysell"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {images.length > 0 && (
                <div className="relative">
                  <ImageGallery images={images} />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500 text-white flex items-center gap-1">
                      <ShoppingBag className="w-4 h-4" />
                      For Sale
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <FavoriteButton postType="buysell" postId={post._id} />
                  </div>
                </div>
              )}

              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

                {/* Price & Location */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    {/* <DollarSign className="w-6 h-6 text-indigo-600" /> */}
                    <span className="text-3xl font-bold text-indigo-600">Tk {post.price}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700 mb-4">
                  <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <span className="font-medium">{post.location}</span>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-indigo-50 rounded-lg p-4 text-center">
                    <Eye className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Views</p>
                    <p className="font-semibold text-gray-900">{post.views || 0}</p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <Tag className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Category</p>
                    <p className="font-semibold text-gray-900">Marketplace</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-600" />
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{post.description}</p>
            </div>

            {/* Comments Section */}
            <CommentsSection postType="buysell" postId={post._id} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Seller Information</h3>

              {/* Poster Info */}
              <PosterInfo user={post.user} createdAt={post.createdAt} />

              {/* Contact Details */}
              {post.user?.phone && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-xs text-gray-600">Phone</p>
                      <a href={`tel:${post.user.phone}`} className="font-semibold text-gray-900 hover:text-indigo-600">
                        {post.user.phone}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!isOwnPost && post.user && (
                <div className="mt-4 space-y-2">
                  <MessageButton recipientId={post.user._id} />
                  {post.user.email && (
                    <a
                      href={`mailto:${post.user.email}`}
                      className="w-full bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border-2 border-gray-300"
                    >
                      <Mail className="w-4 h-4" />
                      Send Email
                    </a>
                  )}
                  {post.user.phone && (
                    <a
                      href={`tel:${post.user.phone}`}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Call Now
                    </a>
                  )}
                </div>
              )}

              {isOwnPost && (
                <div className="mt-4 space-y-2">
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600 mb-2">This is your post</p>
                  </div>
                  <DeleteButton
                    currentUser={currentUser}
                    contentOwner={post.user}
                    onDelete={handleDelete}
                    itemName="post"
                    size="md"
                  />
                </div>
              )}

              {/* No Phone Warning */}
              {!post.user?.phone && !isOwnPost && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800 mb-2">No phone number available</p>
                  <p className="text-xs text-yellow-700">Send a message to contact the seller</p>
                </div>
              )}

              {!post.user?.phone && isOwnPost && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800 mb-1">Add your phone number</p>
                  <p className="text-xs text-blue-700 mb-2">Help buyers contact you easily</p>
                  {currentUser && (
                    <Link to={`/profile/${currentUser._id}`} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      Update Profile →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuySellDetails; 