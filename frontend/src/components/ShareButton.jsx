import { useState } from 'react';

const ShareButton = ({ title, description, url }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = url || window.location.href;
    const shareText = `${title}\n${description || ''}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
            setShowMenu(false);
        }, 2000);
    };

    const handleShare = (platform) => {
        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedText = encodeURIComponent(shareText);

        const urls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
            whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
            telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        };

        window.open(urls[platform], '_blank', 'width=600,height=400');
        setShowMenu(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                title="Share"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
            </button>

            {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
                    <button
                        onClick={() => handleShare('facebook')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                    >
                        <span className="text-blue-600">📘</span>
                        <span className="text-sm font-medium">Facebook</span>
                    </button>
                    <button
                        onClick={() => handleShare('twitter')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                    >
                        <span className="text-sky-500">🐦</span>
                        <span className="text-sm font-medium">Twitter</span>
                    </button>
                    <button
                        onClick={() => handleShare('whatsapp')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                    >
                        <span className="text-green-600">💬</span>
                        <span className="text-sm font-medium">WhatsApp</span>
                    </button>
                    <button
                        onClick={() => handleShare('telegram')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                    >
                        <span className="text-blue-500">✈️</span>
                        <span className="text-sm font-medium">Telegram</span>
                    </button>
                    <button
                        onClick={() => handleShare('linkedin')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                    >
                        <span className="text-blue-700">💼</span>
                        <span className="text-sm font-medium">LinkedIn</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                        onClick={handleCopyLink}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                    >
                        <span>{copied ? '✅' : '🔗'}</span>
                        <span className="text-sm font-medium">
                            {copied ? 'Copied!' : 'Copy Link'}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShareButton;
