import { useState, useEffect } from 'react';
import { savePost, unsavePost, checkIfSaved } from '../api/savedPosts';

const SaveButton = ({ postId, postType }) => {
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkSavedStatus();
    }, [postId, postType]);

    const checkSavedStatus = async () => {
        try {
            const res = await checkIfSaved(postId, postType);
            setIsSaved(res.data.isSaved);
        } catch (error) {
            console.error('Error checking saved status:', error);
        }
    };

    const handleToggleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('Toggle save clicked:', { postId, postType, isSaved });
        setLoading(true);
        try {
            if (isSaved) {
                const res = await unsavePost(postId, postType);
                console.log('Unsaved post response:', res.data);
                setIsSaved(false);
            } else {
                const res = await savePost(postId, postType);
                console.log('Saved post response:', res.data);
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error toggling save:', error);
            console.error('Error details:', error.response?.data);
            alert(error.response?.data?.message || 'Failed to save post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggleSave}
            disabled={loading}
            className={`p-2 rounded-full transition bg-white/90 backdrop-blur-sm shadow-md ${isSaved
                ? 'text-blue-600 hover:bg-blue-50'
                : 'text-gray-600 hover:bg-gray-100'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isSaved ? 'Unsave post' : 'Save post'}
        >
            {isSaved ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            )}
        </button>
    );
};

export default SaveButton;
