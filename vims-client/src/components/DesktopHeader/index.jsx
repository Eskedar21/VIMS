import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/inspection', label: 'New Inspection' },
  { path: '/machine-test', label: 'Machine Test' },
  { path: '/result', label: 'Reports' },
];

const LANGUAGES = ['EN', 'AM', 'OR', 'TI'];

const DesktopHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState('EN');
  const [showNotifications, setShowNotifications] = useState(false);

  // Hide nav on login page
  const isLoginPage = location.pathname === '/';

  // Mock notifications
  const notifications = [
    { id: 1, message: '3 inspections pending sync', type: 'warning' },
    { id: 2, message: 'System update available', type: 'info' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-3 flex items-center justify-between select-none sticky top-0 z-50">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex flex-col leading-tight hover:opacity-80 transition"
        >
          <span className="text-2xl font-bold tracking-tight text-[#88bf47]">
            VIS
          </span>
          <span className="text-[10px] text-gray-500 -mt-1">
            powered by <span className="font-semibold text-[#0fa84a]">Ethiotelecom</span>
          </span>
        </button>
      </div>

      {/* Navigation */}
      {!isLoginPage && (
        <nav className="flex items-center space-x-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#88bf47] text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#88bf47]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}

      {/* Right section: Notifications, Language, Profile */}
      {!isLoginPage && (
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition"
              title="Notifications"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-gray-600">
                <path
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-700">Notifications</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="px-3 py-2 hover:bg-gray-50 border-b border-gray-50"
                    >
                      <p className="text-sm text-gray-600">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-2 py-1 rounded border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#88bf47]/30"
            title="Language"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#88bf47]/10 flex items-center justify-center">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-[#88bf47]">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M4 21c0-3.866 3.582-7 8-7s8 3.134 8 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-700">Inspector</p>
              <p className="text-[10px] text-gray-400">Addis Ababa Center</p>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-gray-500 hover:text-red-600 transition"
          >
            Logout
          </button>
        </div>
      )}

      {/* Show minimal brand on login */}
      {isLoginPage && <div />}
    </header>
  );
};

export default DesktopHeader;

