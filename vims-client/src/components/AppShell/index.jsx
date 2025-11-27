import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getNavForRole, ROLES, KEYBOARD_SHORTCUTS } from '../../config/navConfig';

// Icons
const ICONS = {
  home: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  'clipboard-list': (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  'credit-card': (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  'chart-bar': (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  building: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  'shield-check': (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  'question-mark-circle': (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// Sync status component
const SyncBadge = ({ status }) => {
  const config = {
    online: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Online' },
    offline: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Offline' },
    syncing: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500 animate-pulse', label: 'Syncing...' },
  };
  const s = config[status] || config.online;
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${s.bg}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
    </div>
  );
};

const AppShell = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole] = useState(ROLES.INSPECTOR); // Mock role
  const [syncStatus] = useState('online');
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const navItems = getNavForRole(userRole);
  const isLoginPage = location.pathname === '/';

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        navigate('/inspection');
      }
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        navigate('/dashboard');
      }
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (isLoginPage) {
    return <>{children}</>;
  }

  const notifications = [
    { id: 1, message: '3 inspections pending sync', type: 'warning' },
    { id: 2, message: 'Machine calibration due tomorrow', type: 'info' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F6F5' }}>
      {/* Top App Bar - Full Width */}
      <header style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', background: '#fff', borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-4 h-14">
          {/* Left: Logo */}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold tracking-tight text-[#009639]">VIS</span>
              <span className="text-[9px] text-gray-500 -mt-0.5">
                powered by <span className="font-semibold text-[#007A2F]">Ethiotelecom</span>
              </span>
            </div>
          </button>

          {/* Center: Main Nav */}
          <nav className="flex items-center gap-1" ref={dropdownRef}>
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.route);
              const hasChildren = item.children && item.children.length > 0;
              const isDropdownOpen = activeDropdown === item.id;

              return (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (hasChildren) {
                        setActiveDropdown(isDropdownOpen ? null : item.id);
                      } else {
                        navigate(item.route);
                        setActiveDropdown(null);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                      isActive
                        ? 'bg-[#009639] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {ICONS[item.icon]}
                    <span>{item.label}</span>
                    {hasChildren && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Dropdown */}
                  {hasChildren && isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => {
                            navigate(child.route);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right: Status, Alerts, User */}
          <div className="flex items-center gap-3">
            <SyncBadge status={syncStatus} />

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition"
                title="Notifications"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-100 font-semibold text-sm text-gray-700">
                    Notifications
                  </div>
                  {notifications.map((n) => (
                    <div key={n.id} className="px-3 py-2 hover:bg-gray-50 text-sm text-gray-600 border-b border-gray-50">
                      {n.message}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#009639]/10 flex items-center justify-center">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#009639" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path strokeLinecap="round" d="M4 21c0-3.866 3.582-7 8-7s8 3.134 8 7" />
                </svg>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">Inspector</p>
                <p className="text-[10px] text-gray-400">Addis Ababa Center</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="ml-2 text-xs text-gray-500 hover:text-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          {children}
        </div>
      </main>

      {/* Footer - Full Width */}
      <footer style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', background: '#fff', borderTop: '1px solid #e5e7eb', padding: '8px 0' }}>
        <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>v1.0.0 (Desktop Client)</span>
            <span>•</span>
            <span>Production</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Last Sync: Just now</span>
            <button type="button" className="hover:text-[#009639]" title="Keyboard shortcuts">
              Shortcuts (Ctrl+K)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;

