import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            category: "Getting Started",
            questions: [
                {
                    q: "How do I create an account?",
                    a: "Click on 'Register' in the top right corner, fill in your details with your SUST email address, and verify your account through the email sent to you."
                },
                {
                    q: "Who can use SUST Connect?",
                    a: "SUST Connect is exclusively for current students, faculty, and staff of Shahjalal University of Science & Technology (SUST)."
                },
                {
                    q: "Is SUST Connect free to use?",
                    a: "Yes! SUST Connect is completely free for all SUST community members."
                }
            ]
        },
        {
            category: "Account & Profile",
            questions: [
                {
                    q: "How do I update my profile?",
                    a: "Go to your Dashboard, click on your profile picture or name, and select 'Edit Profile'. You can update your information, profile picture, and preferences there."
                },
                {
                    q: "I forgot my password. What should I do?",
                    a: "Click on 'Forgot Password' on the login page, enter your email address, and follow the instructions sent to your email to reset your password."
                },
                {
                    q: "Can I delete my account?",
                    a: "Yes, you can delete your account from your profile settings. Note that this action is permanent and cannot be undone."
                }
            ]
        },
        {
            category: "Messaging",
            questions: [
                {
                    q: "How do I send a message to someone?",
                    a: "Visit their profile and click the 'Message' button, or go to the Messages section and search for their name."
                },
                {
                    q: "Can I send files and images?",
                    a: "Yes! You can attach images and files to your messages using the attachment button in the message input area."
                },
                {
                    q: "How do I know if someone is online?",
                    a: "Online users have a green dot indicator next to their profile picture in the chat interface."
                }
            ]
        },
        {
            category: "Marketplace & Housing",
            questions: [
                {
                    q: "How do I post an item for sale?",
                    a: "Go to the Marketplace section, click 'Create Post', fill in the details about your item, add photos, and publish."
                },
                {
                    q: "Is it safe to buy/sell on SUST Connect?",
                    a: "We verify all users, but always meet in public places on campus and inspect items before purchasing. Never share sensitive financial information."
                },
                {
                    q: "How do I find housing?",
                    a: "Visit the Housing section to browse available listings. You can filter by location, price, and other preferences."
                }
            ]
        },
        {
            category: "Events & Study Groups",
            questions: [
                {
                    q: "How do I create an event?",
                    a: "Go to the Events section, click 'Create Event', fill in the event details including date, time, location, and description, then publish."
                },
                {
                    q: "Can I RSVP to events?",
                    a: "Yes! Click on any event and use the RSVP button to indicate your attendance."
                },
                {
                    q: "How do study groups work?",
                    a: "You can create or join study groups for specific courses. Members can share resources, schedule study sessions, and collaborate."
                }
            ]
        },
        {
            category: "Safety & Privacy",
            questions: [
                {
                    q: "How is my data protected?",
                    a: "We use industry-standard encryption and security measures. Read our Privacy Policy for detailed information about data protection."
                },
                {
                    q: "How do I report inappropriate content?",
                    a: "Click the 'Report' button on any post or message. Our moderation team will review it promptly."
                },
                {
                    q: "Can I control who sees my posts?",
                    a: "Yes, you can adjust your privacy settings in your profile to control who can see your posts and contact you."
                }
            ]
        }
    ];

    const toggleQuestion = (categoryIndex, questionIndex) => {
        const index = `${categoryIndex}-${questionIndex}`;
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
                        <p className="text-xl text-gray-600">
                            Find answers to common questions about SUST Connect
                        </p>
                    </div>

                    {/* FAQ Categories */}
                    <div className="space-y-8">
                        {faqs.map((category, categoryIndex) => (
                            <div key={categoryIndex} className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-indigo-600 mb-4">{category.category}</h2>
                                <div className="space-y-3">
                                    {category.questions.map((faq, questionIndex) => {
                                        const index = `${categoryIndex}-${questionIndex}`;
                                        const isOpen = openIndex === index;

                                        return (
                                            <div key={questionIndex} className="border-b border-gray-200 last:border-0">
                                                <button
                                                    onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                                                    className="w-full py-4 flex justify-between items-center text-left hover:text-indigo-600 transition"
                                                >
                                                    <span className="font-semibold text-gray-900">{faq.q}</span>
                                                    {isOpen ? (
                                                        <ChevronUp className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                    )}
                                                </button>
                                                {isOpen && (
                                                    <div className="pb-4 text-gray-700 leading-relaxed">
                                                        {faq.a}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Still Have Questions */}
                    <div className="mt-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg shadow-lg p-8 text-center text-white">
                        <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
                        <p className="text-blue-100 mb-6">
                            Can't find what you're looking for? Contact our support team.
                        </p>
                        <a
                            href="/contact"
                            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                        >
                            Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
