import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [rsvps, setRSVPs] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [reminderForm, setReminderForm] = useState({
        title: '',
        description: '',
        reminderDate: '',
        type: 'custom'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [eventsRes, rsvpsRes, remindersRes] = await Promise.all([
                axios.get(`${API_URL}/events`, { withCredentials: true }),
                axios.get(`${API_URL}/rsvp/my-rsvps`, { withCredentials: true }),
                axios.get(`${API_URL}/reminders`, { withCredentials: true })
            ]);

            setEvents(eventsRes.data);
            setRSVPs(rsvpsRes.data);
            setReminders(remindersRes.data);
        } catch (err) {
            console.error('Failed to load calendar data:', err);
        }
    };

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

    const getRemindersForDate = (date) => {
        const dateStr = date.toDateString();
        return reminders.filter(reminder =>
            new Date(reminder.reminderDate).toDateString() === dateStr
        );
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleCreateReminder = async () => {
        try {
            await axios.post(`${API_URL}/reminders`, reminderForm, {
                withCredentials: true
            });
            setShowReminderModal(false);
            setReminderForm({ title: '', description: '', reminderDate: '', type: 'custom' });
            loadData();
        } catch (err) {
            alert('Failed to create reminder');
        }
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">📅 My Calendar</h1>
                    <button
                        onClick={() => setShowReminderModal(true)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                        + Add Reminder
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={handlePrevMonth}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>
                            <button
                                onClick={handleNextMonth}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-2 mb-2">
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
                                const dayReminders = getRemindersForDate(date);
                                const isToday = date.toDateString() === new Date().toDateString();
                                const hasItems = dayEvents.length > 0 || dayReminders.length > 0;

                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDate(date)}
                                        className={`aspect-square p-2 rounded-lg border-2 transition hover:border-indigo-300 ${isToday ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                                            } ${hasItems ? 'bg-purple-50' : 'bg-white'}`}
                                    >
                                        <div className="text-sm font-semibold text-gray-900">{day}</div>
                                        {hasItems && (
                                            <div className="flex gap-1 mt-1 justify-center">
                                                {dayEvents.length > 0 && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                )}
                                                {dayReminders.length > 0 && (
                                                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-6 flex gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                <span>Events</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                                <span>Reminders</span>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Upcoming Events */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h3>
                            <div className="space-y-3">
                                {rsvps.slice(0, 5).map((rsvp) => (
                                    <Link
                                        key={rsvp._id}
                                        to="/events"
                                        className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                                    >
                                        <div className="font-semibold text-gray-900 text-sm">{rsvp.event.title}</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {new Date(rsvp.event.date).toLocaleDateString()}
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${rsvp.status === 'going' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {rsvp.status}
                                        </span>
                                    </Link>
                                ))}
                                {rsvps.length === 0 && (
                                    <p className="text-gray-500 text-sm text-center py-4">No upcoming events</p>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Reminders */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Reminders</h3>
                            <div className="space-y-3">
                                {reminders.slice(0, 5).map((reminder) => (
                                    <div key={reminder._id} className="p-3 bg-orange-50 rounded-lg">
                                        <div className="font-semibold text-gray-900 text-sm">{reminder.title}</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {new Date(reminder.reminderDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                                {reminders.length === 0 && (
                                    <p className="text-gray-500 text-sm text-center py-4">No reminders set</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reminder Modal */}
            {showReminderModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Create Reminder</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={reminderForm.title}
                                    onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={reminderForm.description}
                                    onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={reminderForm.reminderDate}
                                    onChange={(e) => setReminderForm({ ...reminderForm, reminderDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleCreateReminder}
                                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => setShowReminderModal(false)}
                                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
