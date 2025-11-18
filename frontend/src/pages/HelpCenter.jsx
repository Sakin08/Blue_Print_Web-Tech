import { Link } from 'react-router-dom';
import { Book, MessageCircle, Shield, Settings, Users, HelpCircle } from 'lucide-react';

const HelpCenter = () => {
    const helpTopics = [
        {
            icon: Book,
            title: "Getting Started Guide",
            description: "Learn the basics of using SUST Connect",
            link: "/about"
        },
        {
            icon: MessageCircle,
            title: "Messaging Help",
            description: "How to send messages, share files, and more",
            link: "/faq"
        },
        {
            icon: Shield,
            title: "Safety & Privacy",
            description: "Keep your account secure and your data private",
            link: "/privacy"
        },
        {
            icon: Settings,
            title: "Account Settings",
            description: "Manage your profile and preferences",
            link: "/dashboard"
        },
        {
            icon: Users,
            title: "Community Guidelines",
            description: "Learn about our community standards",
            link: "/terms"
        },
        {
            icon: HelpCircle,
            title: "FAQ",
            description: "Answers to frequently asked questions",
            link: "/faq"
        }
    ];

    const quickLinks = [
        { title: "How to create an account", link: "/register" },
        { title: "Reset your password", link: "/login" },
        { title: "Report a problem", link: "/contact" },
        { title: "Contact support", link: "/contact" },
        { title: "Privacy Policy", link: "/privacy" },
        { title: "Terms of Service", link: "/terms" }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6">Help Center</h1>
                        <p className="text-xl text-blue-100 mb-8">
                            Find answers, get support, and learn how to make the most of SUST Connect
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search for help..."
                                    className="w-full px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                                />
                                <button className="absolute right-2 top-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-6xl mx-auto">
                    {/* Help Topics Grid */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Browse Help Topics</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {helpTopics.map((topic, index) => {
                                const Icon = topic.icon;
                                return (
                                    <Link
                                        key={index}
                                        to={topic.link}
                                        className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition group"
                                    >
                                        <div className="bg-indigo-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition">
                                            <Icon className="w-7 h-7 text-indigo-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
                                            {topic.title}
                                        </h3>
                                        <p className="text-gray-600">{topic.description}</p>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Links</h2>
                            <ul className="space-y-3">
                                {quickLinks.map((link, index) => (
                                    <li key={index}>
                                        <Link
                                            to={link.link}
                                            className="text-indigo-600 hover:text-indigo-700 hover:underline transition"
                                        >
                                            → {link.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Support */}
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg shadow-lg p-8 text-white">
                            <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
                            <p className="text-blue-100 mb-6">
                                Can't find what you're looking for? Our support team is here to help you.
                            </p>
                            <div className="space-y-3">
                                <Link
                                    to="/contact"
                                    className="block bg-white text-indigo-600 text-center py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                                >
                                    Contact Support
                                </Link>
                                <Link
                                    to="/faq"
                                    className="block bg-indigo-700 text-white text-center py-3 rounded-lg font-semibold hover:bg-indigo-800 transition border-2 border-white"
                                >
                                    View FAQ
                                </Link>
                            </div>

                            <div className="mt-6 pt-6 border-t border-blue-400">
                                <p className="text-sm text-blue-100">
                                    <strong>Email:</strong> support@sustconnect.edu<br />
                                    <strong>Response Time:</strong> Within 24 hours
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Popular Articles */}
                    <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Articles</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Link to="/faq" className="p-4 border border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition">
                                <h3 className="font-semibold text-gray-900 mb-2">How to create your first post</h3>
                                <p className="text-sm text-gray-600">Learn how to share content with your campus community</p>
                            </Link>
                            <Link to="/faq" className="p-4 border border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition">
                                <h3 className="font-semibold text-gray-900 mb-2">Setting up your profile</h3>
                                <p className="text-sm text-gray-600">Customize your profile to connect with others</p>
                            </Link>
                            <Link to="/faq" className="p-4 border border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition">
                                <h3 className="font-semibold text-gray-900 mb-2">Using the marketplace safely</h3>
                                <p className="text-sm text-gray-600">Tips for safe buying and selling on campus</p>
                            </Link>
                            <Link to="/faq" className="p-4 border border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition">
                                <h3 className="font-semibold text-gray-900 mb-2">Managing notifications</h3>
                                <p className="text-sm text-gray-600">Control what notifications you receive</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
