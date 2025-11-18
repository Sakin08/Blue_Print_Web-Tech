import { useState } from 'react';

const CalendarPopup = ({ isOpen, onClose, events, onDateSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    if (!isOpen) return null;

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const getEventsForDate = (date) => {
        const dateStr = date.toDateString();
        return events.filter(event =>
            new Date(event.date).toDateString() === dateStr
        );
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleDateClick = (day) => {
        const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayEvents = getEventsForDate(selectedDate);
        if (dayEvents.length > 0 && onDateSelect) {
            onDateSelect(dayEvents);
        }
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const today = new Date();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">📅 Events Calendar</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Month Navigation */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-white/20 rounded-lg transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h3 className="text-xl font-semibold">{monthName}</h3>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-white/20 rounded-lg transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Calendar Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-3">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {/* Empty cells for days before month starts */}
                        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square"></div>
                        ))}

                        {/* Days of month */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const dayEvents = getEventsForDate(date);
                            const isToday = date.toDateString() === today.toDateString();
                            const hasEvents = dayEvents.length > 0;
                            const isPast = date < today && !isToday;

                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDateClick(day)}
                                    disabled={!hasEvents}
                                    className={`aspect-square p-2 rounded-xl border-2 transition-all relative group ${isToday
                                            ? 'border-indigo-600 bg-indigo-50 font-bold'
                                            : hasEvents
                                                ? 'border-purple-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer'
                                                : 'border-gray-100 bg-gray-50'
                                        } ${isPast && !hasEvents ? 'opacity-50' : ''}`}
                                >
                                    <div className="text-sm font-semibold text-gray-900">{day}</div>

                                    {hasEvents && (
                                        <div className="mt-1">
                                            <div className="flex flex-wrap gap-1 justify-center">
                                                {dayEvents.slice(0, 3).map((event, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-1.5 h-1.5 rounded-full bg-purple-500"
                                                        title={event.title}
                                                    ></div>
                                                ))}
                                            </div>
                                            {dayEvents.length > 3 && (
                                                <div className="text-xs text-purple-600 font-semibold mt-1">
                                                    +{dayEvents.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Hover tooltip */}
                                    {hasEvents && (
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                                                <div className="font-semibold mb-1">{dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}</div>
                                                {dayEvents.slice(0, 2).map((event, idx) => (
                                                    <div key={idx} className="truncate max-w-[200px]">
                                                        • {event.title}
                                                    </div>
                                                ))}
                                                {dayEvents.length > 2 && (
                                                    <div className="text-gray-400">and {dayEvents.length - 2} more...</div>
                                                )}
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                                    <div className="border-4 border-transparent border-t-gray-900"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-indigo-600 bg-indigo-50 rounded"></div>
                                <span className="text-gray-700">Today</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-purple-200 rounded flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                </div>
                                <span className="text-gray-700">Has Events</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-gray-100 bg-gray-50 rounded"></div>
                                <span className="text-gray-700">No Events</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">
                            💡 Click on a date with events to filter the event list
                        </p>
                    </div>

                    {/* Event Summary */}
                    <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Events This Month</p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {events.filter(e => {
                                        const eventDate = new Date(e.date);
                                        return eventDate.getMonth() === currentDate.getMonth() &&
                                            eventDate.getFullYear() === currentDate.getFullYear();
                                    }).length}
                                </p>
                            </div>
                            <div className="text-5xl">🎉</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPopup;
