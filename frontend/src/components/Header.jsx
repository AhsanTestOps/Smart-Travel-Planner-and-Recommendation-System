import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, BookOpen, User, LogOut, ChevronDown, Sparkles, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <MapPin className="h-8 w-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">Smart Travel PLanner</h1>
          </Link>

          {/* Navigation */}
          <nav className="flex space-x-6">
            <Link
              to="/ai-travel"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                location.pathname.startsWith('/ai-travel')
                  ? 'bg-purple-50 text-purple-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Travel</span>
            </Link>
            <Link
              to="/destinations"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive('/destinations') 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>Destinations</span>
            </Link>
            <Link
              to="/plan"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive('/plan') 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Plan a Trip</span>
            </Link>
            <Link
              to="/map"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive('/map') 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Explore</span>
            </Link>
            <Link
              to="/saved-trips"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive('/saved-trips') 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>My Trips</span>
            </Link>
          </nav>

          {/* Profile */}
          <div className="flex items-center relative" ref={dropdownRef}>
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.initials || user?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
