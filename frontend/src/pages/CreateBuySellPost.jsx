import { useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm.jsx';
import api from '../api/buysell.js';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

// Icon for the title
const PostIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const CreateBuySellPost = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await api.create(formData);
      // Navigate to the list page after successful creation
      navigate('/buysell');
    } catch (err) {
      // Provide better feedback on failure
      alert(err.response?.data?.message || 'Failed to create post. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 py-8 sm:py-12">
        {/* Adjusted max-width to be slightly wider for better desktop use, but still constrained */}
        <div className="container mx-auto px-4 max-w-xl md:max-w-3xl lg:max-w-4xl">
          
          {/* Enhanced Header Section - Mobile adjustments: reduced padding and font size slightly */}
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-lg border-t-4 border-indigo-600">
            <div className="flex items-center gap-3 sm:gap-4">
              <PostIcon />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Create Buy & Sell Post
              </h1>
            </div>
            <p className="mt-2 text-gray-500 text-sm sm:text-lg">
              List an item you wish to buy or sell to the community.
            </p>
          </div>
          
          {/* Form Container - Padding adjusted for mobile */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200">
            {/* PostForm content is assumed to be responsive */}
            <PostForm type="buysell" onSubmit={handleSubmit} />
          </div>
          
          {/* Action Link at the bottom */}
          <div className="mt-6 sm:mt-8 text-center">
             <button 
                onClick={() => navigate('/buysell')}
                className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-300 flex items-center justify-center gap-1 mx-auto text-sm sm:text-base"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Buy & Sell Listings
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CreateBuySellPost;