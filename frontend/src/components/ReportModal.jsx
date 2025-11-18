import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ReportModal = ({ isOpen, onClose, reportedUser, reportedItem, itemType }) => {
    const [formData, setFormData] = useState({
        reason: 'spam',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const reasons = [
        { value: 'spam', label: '🚫 Spam or Misleading' },
        { value: 'inappropriate', label: '⚠️ Inappropriate Content' },
        { value: 'scam', label: '💰 Scam or Fraud' },
        { value: 'harassment', label: '😡 Harassment or Bullying' },
        { value: 'fake', label: '🎭 Fake Profile/Item' },
        { value: 'other', label: '📝 Other' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await axios.post(`${API_URL}/reports`, {
                reportedUser,
                reportedItem,
                itemType,
                ...formData
            }, { withCredentials: true });

            alert('Report submitted successfully. Our team will review it.');
            onClose();
            setFormData({ reason: 'spam', description: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit report');
        }
        setSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Report Content</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Why are you reporting this?
                        </label>
                        <div className="space-y-2">
                            {reasons.map((reason) => (
                                <label key={reason.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={reason.value}
                                        checked={formData.reason === reason.value}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        className="mr-3"
                                    />
                                    <span className="text-sm">{reason.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Details (Required)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows="4"
                            placeholder="Please provide more details about why you're reporting this..."
                            required
                        />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-yellow-800">
                            ⚠️ False reports may result in action against your account. Please only report content that violates our community guidelines.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
