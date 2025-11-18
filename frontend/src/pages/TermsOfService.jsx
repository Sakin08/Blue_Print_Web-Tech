const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
                    <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="space-y-6 text-gray-700">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using SUST Connect, you accept and agree to be bound by these Terms of Service.
                                If you do not agree to these terms, please do not use our platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Eligibility</h2>
                            <p className="mb-3">To use SUST Connect, you must:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Be a current student, faculty, or staff member of SUST</li>
                                <li>Provide accurate and complete registration information</li>
                                <li>Maintain the security of your account credentials</li>
                                <li>Be at least 16 years of age</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. User Conduct</h2>
                            <p className="mb-3">You agree not to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Post false, misleading, or fraudulent content</li>
                                <li>Harass, bully, or threaten other users</li>
                                <li>Share inappropriate, offensive, or illegal content</li>
                                <li>Violate any applicable laws or regulations</li>
                                <li>Attempt to gain unauthorized access to the platform</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Content Ownership</h2>
                            <p>
                                You retain ownership of content you post on SUST Connect. However, by posting content,
                                you grant us a non-exclusive license to use, display, and distribute your content on
                                the platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Privacy</h2>
                            <p>
                                Your use of SUST Connect is also governed by our Privacy Policy. Please review it to
                                understand how we collect and use your information.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Contact Information</h2>
                            <p>
                                For questions about these Terms of Service, contact us at:
                            </p>
                            <p className="mt-3 font-semibold">
                                Email: support@sustconnect.edu<br />
                                Address: SUST Campus, Sylhet, Bangladesh
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
