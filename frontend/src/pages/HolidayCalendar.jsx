import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const HolidayCalendar = () => {
    const { user } = useAuth();
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [holidayName, setHolidayName] = useState('');
    const [holidayType, setHolidayType] = useState('university');
    const [rangeMode, setRangeMode] = useState(false);
    const [rangeStart, setRangeStart] = useState(null);
    const [rangeEnd, setRangeEnd] = useState(null);

    const isAdmin = user && user.role === 'admin';

    useEffect(() => {
        loadHolidays();
    }, []);

    const loadHolidays = async () => {
        try {
            const res = await api.get('/holidays');
            setHolidays(res.data);
        } catch (error) {
            console.error('Failed to load holidays:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const isHoliday = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return holidays.find(h => h.date.split('T')[0] === dateStr);
    };

    const handleDateClick = (day) => {
        if (!isAdmin) return;

        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const holiday = isHoliday(clickedDate);

        if (holiday) {
            // Delete holiday
            if (confirm(`Remove holiday: ${holiday.name}?`)) {
                deleteHoliday(holiday._id);
            }
        } else {
            // Add holiday
            if (rangeMode) {
                // Range selection mode
                if (!rangeStart) {
                    setRangeStart(clickedDate);
                } else if (!rangeEnd) {
                    if (clickedDate < rangeStart) {
                        setRangeEnd(rangeStart);
                        setRangeStart(clickedDate);
                    } else {
                        setRangeEnd(clickedDate);
                    }
                    setShowModal(true);
                }
            } else {
                // Single date mode
                setSelectedDate(clickedDate);
                setShowModal(true);
            }
        }
    };

    const addHoliday = async () => {
        if (!holidayName.trim()) {
            alert('Please enter holiday name');
            return;
        }

        try {
            if (rangeMode && rangeStart && rangeEnd) {
                // Add holidays for date range
                const dates = [];
                const current = new Date(rangeStart);
                while (current <= rangeEnd) {
                    dates.push(new Date(current));
                    current.setDate(current.getDate() + 1);
                }

                // Create holiday for each date
                await Promise.all(dates.map(date =>
                    api.post('/holidays', {
                        name: holidayName,
                        date: date.toISOString(),
                        type: holidayType
                    })
                ));
            } else {
                // Single date
                await api.post('/holidays', {
                    name: holidayName,
                    date: selectedDate.toISOString(),
                    type: holidayType
                });
            }

            setShowModal(false);
            setHolidayName('');
            setHolidayType('university');
            setRangeStart(null);
            setRangeEnd(null);
            loadHolidays();
        } catch (error) {
            alert('Failed to add holiday');
        }
    };

    const deleteHoliday = async (id) => {
        try {
            await api.delete(`/holidays/${id}`);
            loadHolidays();
        } catch (error) {
            alert('Failed to delete holiday');
        }
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const holiday = isHoliday(date);
        const isToday = new Date().toDateString() === date.toDateString();
        const isRangeStart = rangeStart && date.toDateString() === rangeStart.toDateString();
        const isInRange = rangeStart && rangeEnd && date >= rangeStart && date <= rangeEnd;
        const isRangePreview = rangeStart && !rangeEnd && date >= rangeStart;

        days.push(
            <div
                key={day}
                onClick={() => handleDateClick(day)}
                className={`h-24 border border-gray-200 p-2 transition ${isAdmin ? 'cursor-pointer hover:bg-gray-50' : ''
                    } ${isToday ? 'ring-2 ring-blue-500' : ''} ${holiday ? 'bg-gradient-to-br from-green-100 to-green-200' :
                        isInRange ? 'bg-blue-100' :
                            isRangeStart ? 'bg-blue-200 ring-2 ring-blue-500' :
                                isRangePreview ? 'bg-blue-50' :
                                    'bg-white'
                    }`}
            >
                <div className="flex justify-between items-start">
                    <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                        {day}
                    </span>
                    {holiday && (
                        <span className="text-xs">
                            {holiday.type === 'national' ? '🇧🇩' : holiday.type === 'religious' ? '🕌' : '🎓'}
                        </span>
                    )}
                </div>
                {holiday && (
                    <div className="mt-1">
                        <p className="text-xs font-medium text-green-800 line-clamp-2">{holiday.name}</p>
                    </div>
                )}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <CalendarIcon className="w-10 h-10 text-green-600" />
                        <h1 className="text-4xl font-bold text-gray-900">SUST Holiday Calendar</h1>
                    </div>
                    <p className="text-gray-600">Shahjalal University of Science & Technology</p>
                    {isAdmin && (
                        <div className="mt-4 flex items-center justify-center gap-4">
                            <button
                                onClick={() => {
                                    setRangeMode(!rangeMode);
                                    setRangeStart(null);
                                    setRangeEnd(null);
                                }}
                                className={`px-6 py-2 rounded-lg font-semibold transition ${rangeMode
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {rangeMode ? '📅 Range Mode (Click 2 dates)' : '📆 Single Date Mode'}
                            </button>
                            {rangeMode && rangeStart && !rangeEnd && (
                                <button
                                    onClick={() => {
                                        setRangeStart(null);
                                        setRangeEnd(null);
                                    }}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                                >
                                    Cancel Selection
                                </button>
                            )}
                        </div>
                    )}
                    {isAdmin && rangeMode && (
                        <p className="text-sm text-blue-600 mt-2">
                            {!rangeStart ? 'Click start date' : !rangeEnd ? 'Click end date' : 'Range selected'}
                        </p>
                    )}
                </div>

                {/* Calendar Navigation */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={previousMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {monthName} {year}
                        </h2>
                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ChevronRight className="w-6 h-6 text-gray-700" />
                        </button>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center font-semibold text-gray-700 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {days}
                    </div>
                </div>

                {/* Legend */}
                <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex flex-wrap gap-4 justify-center items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gradient-to-br from-green-100 to-green-200 border border-gray-200 rounded"></div>
                            <span className="text-sm text-gray-700">Holiday</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">🇧🇩 National</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">🕌 Religious</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">🎓 University</span>
                        </div>
                    </div>
                </div>

                {/* Add Holiday Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {rangeMode ? 'Add Holiday Range' : 'Add Holiday'}
                            </h3>
                            {rangeMode && rangeStart && rangeEnd ? (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-700">
                                        <strong>From:</strong> {rangeStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        <strong>To:</strong> {rangeEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        {Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1} days
                                    </p>
                                </div>
                            ) : (
                                <p className="text-gray-600 mb-4">
                                    {selectedDate?.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Holiday Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={holidayName}
                                        onChange={(e) => setHolidayName(e.target.value)}
                                        placeholder="e.g., Independence Day"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Holiday Type
                                    </label>
                                    <select
                                        value={holidayType}
                                        onChange={(e) => setHolidayType(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="national">🇧🇩 National</option>
                                        <option value="religious">🕌 Religious</option>
                                        <option value="university">🎓 University</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={addHoliday}
                                        className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                                    >
                                        Add Holiday
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            setHolidayName('');
                                            setHolidayType('university');
                                            setRangeStart(null);
                                            setRangeEnd(null);
                                        }}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HolidayCalendar;
