const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                    <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="space-y-6 text-gray-700">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
                            <p className="mb-3">SUST Connect collects information to provide better services to our users. We collect:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Personal information (name, email, student ID) when you register</li>
                                <li>Profile information you choose to provide</li>
                                <li>Content you create, upload, or share on the platform</li>
                                <li>Usage data and interactions with the platform</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
                            <p className="mb-3">We use the information we collect to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Send you notifications about platform activities</li>
                                <li>Respond to your requests and support needs</li>
                                <li>Ensure platform security and prevent abuse</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Contact Us</h2>
                            <p>If you have questions about this Privacy Policy, please contact us at:</p>
                            <p className="mt-3 font-semibold">
                                Email: privacy@sustconnect.edu<br />
                                Address: SUST Campus, Sylhet, Bangladesh
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
