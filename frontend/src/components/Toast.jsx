import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    return (
        <div className={`fixed top-20 right-6 z-50 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-2xl animate-slide-in-right flex items-center gap-3 min-w-[300px]`}>
            <span className="text-2xl">{icons[type]}</span>
            <span className="flex-1 font-medium">{message}</span>
            <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded p-1 transition"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default Toast;
