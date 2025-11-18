import { Link } from 'react-router-dom';

// Color Alignment:
// Background: bg-gray-900 (A professional deep gray, complementing the Deep Blue brand color #1E3A8A)
// Accent: text-green-400 (Directly reflects the Green brand color #10B981 for highlights and links)
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 pt-8 pb-6 mt-16 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Link Grid - Responsive 2x2 on Mobile, 4x1 on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 border-b border-gray-700 pb-6">

          {/* Column 1: Platform */}
          <div>
            <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-green-400">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-green-400 transition duration-300">About SUST Connect</Link></li>
              <li><Link to="/features" className="hover:text-green-400 transition duration-300">Features</Link></li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div>
            <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-green-400">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.sust.edu" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition duration-300">University Portal</a></li>
              <li><Link to="/faq" className="hover:text-green-400 transition duration-300">FAQ</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-green-400">
              Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-green-400 transition duration-300">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 4: Campus */}
          <div>
            <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-green-400">
              Campus
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/image/540763965_1340254950799652_6212886658485356170_n.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition duration-300"
                >
                  SUST Map
                </a>
              </li>
              <li><Link to="/privacy" className="hover:text-green-400 transition duration-300">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-green-400 transition duration-300">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        {/* Social Media Links */}
        <div className="flex justify-center items-center gap-4 mb-4">
          <a
            href="https://github.com/sakin08"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-green-400 transition-all duration-300 transform hover:scale-110"
            aria-label="GitHub"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>

          <a
            href="https://www.linkedin.com/in/md-sohanoor-rahaman-sakin-7006b824b/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-green-400 transition-all duration-300 transform hover:scale-110"
            aria-label="LinkedIn"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>

          <a
            href="https://www.facebook.com/sakin44"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-green-400 transition-all duration-300 transform hover:scale-110"
            aria-label="Facebook"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
        </div>

        {/* Bottom Section: Brand and Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm mt-4">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            {/* SUST Campus Logo */}
            <img
              src="/image/482984952_993190959578541_8366529342364279980_n.jpg"
              alt="SUST Logo"
              className="w-10 h-10 rounded-lg object-cover shadow-lg ring-2 ring-green-400/30"
            />
            {/* Text: 'SUST' in red, 'Connect' in white */}
            <span className="text-xl font-extrabold">
              <span className="text-red-500">SUST</span>
              <span className="text-gray-50"> Connect</span>
            </span>
          </div>

          <p className="text-gray-400 text-center">
            &copy; {new Date().getFullYear()} SUST Connect. Built for the community.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;