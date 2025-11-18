import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import UnreadBadge from './UnreadBadge.jsx';
import NotificationCenter from './NotificationCenter.jsx';
// Import Lucide Icons for a professional look
import {
  Home, Rss, Users, Calendar, Droplet, Home as HousingIcon, Pizza, Search, Briefcase, ShoppingBag,
  MessageSquare, ChevronDown, User, LogOut, LayoutDashboard, Menu, X, BookOpen, Mail, Zap, Store, Shield, Utensils, Bus
} from 'lucide-react';

// --- Helper Components (Unchanged) ---

// Desktop Nav Link Component with active state
const NavLink = ({ to, text, Icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
        relative flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all duration-300 font-medium text-sm
        focus:outline-none focus:ring-2 focus:ring-indigo-500/50 group
        ${isActive
          ? 'text-indigo-600 bg-indigo-50'
          : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
        }
      `}
    >
      {Icon && <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`} />}
      <span>{text}</span>
      {isActive && (
        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-indigo-600 rounded-full"></span>
      )}
    </Link>
  );
};

// Dropdown Menu Component with animations
const DropdownMenu = ({ title, items, isOpen, onToggle }) => {
  const location = useLocation();
  const hasActiveItem = items.some(item => location.pathname === item.to);

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`
          flex items-center space-x-1 px-3 py-2 rounded-xl transition-all duration-300 font-medium text-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50 group
          ${hasActiveItem || isOpen
            ? 'text-indigo-600 bg-indigo-50'
            : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
          }
        `}
      >
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-all duration-300 group-hover:text-indigo-600 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={onToggle}
          ></div>
          <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-20 transform origin-top-left animate-dropdown-in">
            {items.map((item, index) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={index}
                  to={item.to}
                  onClick={onToggle}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`
                    flex items-center space-x-3 px-4 py-2 text-sm transition-all duration-200 group
                    animate-slide-in-left
                    ${isActive
                      ? 'bg-indigo-50 text-indigo-600 font-semibold'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }
                  `}
                >
                  <item.Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-indigo-600 scale-110' : 'text-indigo-500'}`} />
                  <span>{item.text}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// Mobile Nav Link Component with active state
const MobileNavLink = ({ to, Icon, text, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium group
        ${isActive
          ? 'bg-indigo-50 text-indigo-600'
          : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
        }
      `}
    >
      <Icon className={`w-6 h-6 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-indigo-600 scale-110' : 'text-indigo-600'}`} />
      <span>{text}</span>
    </Link>
  );
};

// --- Main Navbar Component (Home Link Removed) ---

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const toggleDropdown = (dropdown) => {
    // Close mobile menu if a dropdown is opened on mobile (though dropdowns are hidden on mobile)
    setShowMobileMenu(false);
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  // Check if user has "other" role - they only see food delivery and blood donation
  const isOtherRole = user?.role === 'other';

  const menuItems = isOtherRole ? {
    // Limited menu for "other" role users
    services: {
      title: "Services",
      items: [
        { to: '/restaurants', Icon: Pizza, text: 'Campus Eats' },
        { to: '/blood-donation', Icon: Droplet, text: 'Blood Donation' },
      ]
    }
  } : {
    // Full menu for students, teachers, staff, and admins
    community: {
      title: "Community",
      items: [
        { to: '/events', Icon: Calendar, text: 'Events' },
        { to: '/blood-donation', Icon: Droplet, text: 'Blood Donation' },
      ]
    },
    campus: {
      title: "Campus Life",
      items: [
        { to: '/housing', Icon: HousingIcon, text: 'Housing' },
        { to: '/restaurants', Icon: Pizza, text: 'Campus Eats' },
        { to: '/lost-found', Icon: Search, text: 'Lost & Found' },
        { to: '/holidays', Icon: Calendar, text: 'Holiday Calendar' },
        { to: '/bus-schedule', Icon: Bus, text: 'Bus Schedule' },
      ]
    },
    career: {
      title: "Career & Market",
      items: [
        { to: '/jobs', Icon: Briefcase, text: 'Jobs' },
        { to: '/buysell', Icon: ShoppingBag, text: 'Marketplace' },
      ]
    }
  };

  return (
    <nav className={`
      bg-white border-b sticky top-0 z-50 transition-all duration-300
      ${scrolled
        ? 'border-gray-200 shadow-xl backdrop-blur-sm bg-white/95'
        : 'border-gray-100 shadow-lg'
      }
    `}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo (Handles navigation to /) */}
          <Link
            to="/"
            className="flex items-center space-x-2 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md transition-all duration-300"
            title="SUST Connect"
          >
            <div className="relative">
              <img
                src="/image/482984952_993190959578541_8366529342364279980_n.jpg"
                alt="SUST Logo"
                className="w-10 h-10 rounded-xl object-cover transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg ring-2 ring-indigo-100"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-xl font-extrabold">
              <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent group-hover:from-red-700 group-hover:to-red-800 transition-all duration-300">SUST</span>
              <span className="text-gray-900 group-hover:text-gray-700 transition-colors duration-300"> Connect</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {user && !isOtherRole && <NavLink to="/feed" text="Newsfeed" Icon={Rss} />}

            {/* Dynamic Dropdowns based on user role */}
            {Object.entries(menuItems).map(([key, section]) => (
              <DropdownMenu
                key={key}
                title={section.title}
                isOpen={activeDropdown === key}
                onToggle={() => toggleDropdown(key)}
                items={section.items}
              />
            ))}

            {user && !isOtherRole && (
              <NavLink to="/messages" text="Messages" Icon={MessageSquare} />
            )}
          </div>

          {/* Right Side (Auth, Notifications, User Menu) */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Notification Center (Kept as is for functionality) */}
                <NotificationCenter />

                {/* User Menu */}
                <div className="relative hidden lg:block">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-all duration-300 border border-gray-200 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 group"
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-indigo-300 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-gray-800 hidden xl:inline max-w-[120px] truncate group-hover:text-indigo-600 transition-colors duration-300">
                      {user.name}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-all duration-300 mr-1 group-hover:text-indigo-600 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-20 transform origin-top-right animate-dropdown-in">
                        <div className="px-4 py-3 border-b border-gray-100 mb-1 animate-slide-in-left">
                          <p className="text-md font-extrabold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          {user.role && (
                            <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs font-semibold rounded-full capitalize">
                              {user.role}
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/profile/${user._id}`}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group animate-slide-in-left"
                          style={{ animationDelay: '50ms' }}
                        >
                          <User className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform duration-200" />
                          <span>My Profile</span>
                        </Link>

                        <Link
                          to="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group animate-slide-in-left"
                          style={{ animationDelay: '100ms' }}
                        >
                          <LayoutDashboard className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform duration-200" />
                          <span>Dashboard</span>
                        </Link>

                        <Link
                          to="/notifications"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group animate-slide-in-left"
                          style={{ animationDelay: '125ms' }}
                        >
                          <Mail className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform duration-200" />
                          <span>Notifications</span>
                        </Link>

                        <Link
                          to="/my-restaurants"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group animate-slide-in-left"
                          style={{ animationDelay: '150ms' }}
                        >
                          <Store className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform duration-200" />
                          <span>My Restaurants</span>
                        </Link>

                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-all duration-200 font-semibold group animate-slide-in-left"
                            style={{ animationDelay: '200ms' }}
                          >
                            <Shield className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform duration-200" />
                            <span>Admin Panel</span>
                          </Link>
                        )}

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 font-medium group animate-slide-in-left"
                          style={{ animationDelay: '250ms' }}
                        >
                          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition text-sm hidden sm:block"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md text-sm"
                >
                  Join Now
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 transform rotate-0 transition-transform duration-300" />
              ) : (
                <Menu className="w-6 h-6 transform rotate-0 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200 pb-4 pt-2 space-y-1 animate-slide-down">
            {/* REMOVED: <MobileNavLink to="/" Icon={Home} text="Home" onClick={() => setShowMobileMenu(false)} /> */}
            {/* Suggestion: The logo should be the primary home link */}

            {user && !isOtherRole && <MobileNavLink to="/feed" Icon={Rss} text="Newsfeed" onClick={() => setShowMobileMenu(false)} />}

            {/* Grouped Links - Dynamic based on user role */}
            {Object.entries(menuItems).map(([key, section]) => (
              <div key={key}>
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase mt-2">{section.title}</div>
                {section.items.map(item => (
                  <MobileNavLink key={item.to} to={item.to} Icon={item.Icon} text={item.text} onClick={() => setShowMobileMenu(false)} />
                ))}
              </div>
            ))}

            {user ? (
              <>
                <div className="border-t border-gray-200 my-3"></div>
                <MobileNavLink to="/messages" Icon={MessageSquare} text="Messages" onClick={() => setShowMobileMenu(false)} />
                <MobileNavLink to={`/profile/${user._id}`} Icon={User} text="My Profile" onClick={() => setShowMobileMenu(false)} />
                <MobileNavLink to="/dashboard" Icon={LayoutDashboard} text="Dashboard" onClick={() => setShowMobileMenu(false)} />
                <MobileNavLink to="/my-restaurants" Icon={Store} text="My Restaurants" onClick={() => setShowMobileMenu(false)} />
                {user.role === 'admin' && (
                  <MobileNavLink to="/admin" Icon={Shield} text="Admin Panel" onClick={() => setShowMobileMenu(false)} />
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-4 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
                >
                  <LogOut className="w-6 h-6" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-200 my-3"></div>
                <Link
                  to="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition font-medium text-center"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-center mt-2 shadow-md"
                >
                  Register Account
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;