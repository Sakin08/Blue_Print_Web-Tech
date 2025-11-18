import { Link } from 'react-router-dom';
import { Users, Target, Heart, Zap } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6">About SUST Connect</h1>
                        <p className="text-xl text-blue-100">
                            Connecting the SUST community, one interaction at a time
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="w-8 h-8 text-indigo-600" />
                            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                        </div>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            SUST Connect is dedicated to building a vibrant, connected campus community. 
                            We provide a comprehensive platform where students can share resources, discover events, 
                            find housing, connect for study groups, and support each other through various campus activities.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <Users className="w-10 h-10 text-indigo-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Community First</h3>
                            <p className="text-gray-700">
                                Built by students, for students. Every feature is designed to enhance campus life and foster meaningful connections.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <Zap className="w-10 h-10 text-indigo-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Fast & Reliable</h3>
                            <p className="text-gray-700">
                                Real-time notifications, instant messaging, and quick access to everything you need on campus.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <Heart className="w-10 h-10 text-indigo-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Safe & Supportive</h3>
                            <p className="text-gray-700">
                                A trusted platform with verified users, moderation, and features designed to keep our community safe.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <Target className="w-10 h-10 text-indigo-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">All-in-One Platform</h3>
                            <p className="text-gray-700">
                                From events to marketplace, housing to blood donation - everything you need in one place.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg shadow-lg p-8 text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
                        <p className="text-xl text-blue-100 mb-6">
                            Be part of something bigger. Connect with your campus today.
                        </p>
                        <Link
                            to="/register"
                            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
