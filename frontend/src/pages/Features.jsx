import {
    MessageSquare, Calendar, ShoppingBag, Home as HousingIcon, Users, Briefcase,
    Pizza, Search, Droplet, BookOpen, Bell, Shield
} from 'lucide-react';

const Features = () => {
    const features = [
        {
            icon: MessageSquare,
            title: "Real-time Messaging",
            description: "Connect instantly with classmates through our built-in messaging system with online status indicators."
        },
        {
            icon: Calendar,
            title: "Events & Activities",
            description: "Discover and create campus events, RSVP, and never miss out on what's happening around you."
        },
        {
            icon: ShoppingBag,
            title: "Marketplace",
            description: "Buy and sell items safely within the campus community. From textbooks to electronics."
        },
        {
            icon: HousingIcon,
            title: "Housing Solutions",
            description: "Find roommates, sublets, and housing options near campus with detailed listings and filters."
        },
        {
            icon: Users,
            title: "Study Groups",
            description: "Form or join study groups for your courses. Collaborate and succeed together."
        },
        {
            icon: Briefcase,
            title: "Job Board",
            description: "Discover part-time jobs, internships, and career opportunities tailored for students."
        },
        {
            icon: Pizza,
            title: "Food & Dining",
            description: "Share food orders, find dining buddies, and discover the best eats around campus."
        },
        {
            icon: Search,
            title: "Lost & Found",
            description: "Report lost items or help return found items to their rightful owners."
        },
        {
            icon: Droplet,
            title: "Blood Donation",
            description: "Register as a donor or request blood in emergencies. Save lives within your community."
        },
        {
            icon: BookOpen,
            title: "Newsfeed",
            description: "Stay updated with campus news, announcements, and posts from your community."
        },
        {
            icon: Bell,
            title: "Smart Notifications",
            description: "Get real-time notifications for messages, events, and activities that matter to you."
        },
        {
            icon: Shield,
            title: "Safe & Secure",
            description: "Verified student accounts, content moderation, and privacy controls to keep you safe."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6">Platform Features</h1>
                        <p className="text-xl text-blue-100">
                            Everything you need to thrive in campus life, all in one place
                        </p>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                                    <div className="bg-indigo-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                                        <Icon className="w-7 h-7 text-indigo-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                    <p className="text-gray-700">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Call to Action */}
                    <div className="mt-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg shadow-lg p-12 text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Join thousands of students already using SUST Connect
                        </p>
                        <div className="flex gap-4 justify-center">
                            <a
                                href="/register"
                                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                            >
                                Sign Up Now
                            </a>
                            <a
                                href="/about"
                                className="bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-800 transition border-2 border-white"
                            >
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Features;
