import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiRequest } from '../services/api';
import { LogOut, Bell, Sun, Moon, LayoutDashboard, Truck, ShieldCheck, Menu, X, CheckCheck } from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab }) {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchNotifications() {
      if (!user || !token) {
        if (isMounted) {
          setUnreadCount(0);
          setNotifications([]);
        }
        return;
      }

      try {
        const res = await apiRequest('/notifications', 'GET', null, token);
        if (!isMounted) return;
        const notificationsData = res.notifications || [];
        const unread = notificationsData.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
        setNotifications(notificationsData);
      } catch (err) {
        console.error('Failed to load notifications:', err.message);
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, token]);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((value) => !value);
  const toggleBellDropdown = () => {
    setIsBellOpen((value) => {
      const nextState = !value;
      if (nextState && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        requestPushNotificationPermission(token);
      }
      return nextState;
    });
  };
  const closeBellDropdown = () => setIsBellOpen(false);

  const handleMarkAsRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, 'PUT', null, token);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiRequest('/notifications/read-all', 'PUT', null, token);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { label: 'Home', tab: 'landing' },
    { label: 'Services', tab: 'services' },
    { label: 'About Us', tab: 'about' },
    { label: 'Contact', tab: 'contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-700 bg-green-50/95 dark:bg-slate-800/95 backdrop-blur-md transition-colors duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand Logo with Circular Image */}
        <div
          onClick={() => setCurrentTab('landing')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
        >
          <img
            src="/logo.png"
            alt="Waste Pickup Scheduler Logo"
            className="h-10 w-10 object-contain rounded-full border border-green-500/20 shadow-sm"
          />
          <div className="leading-tight text-left">
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100 block leading-none uppercase">
              Waste Pickup
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 font-semibold block">
              Scheduler
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        {!user && (
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => setCurrentTab(link.tab)}
                className={`text-sm font-medium transition-all py-1 ${
                  currentTab === link.tab
                    ? 'text-green-700 dark:text-green-400 font-semibold border-b-2 border-green-600'
                    : 'text-slate-600 dark:text-slate-300 hover:text-green-700 dark:hover:text-green-400'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        )}

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark'
              ? <Sun className="w-5 h-5 text-amber-400" />
              : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {user && (
            <div className="relative flex">
              <button
                onClick={toggleBellDropdown}
                className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                aria-label="Toggle notifications dropdown"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse shadow-md shadow-rose-500/50" />
                )}
              </button>

              {isBellOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={closeBellDropdown} />
                  <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-3 w-auto sm:w-80 max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl z-50 overflow-hidden text-left animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-bold text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-5 text-center text-sm text-slate-500 dark:text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification._id || notification.id}
                          className={`px-4 py-3 cursor-pointer transition-colors ${notification.isRead ? 'opacity-60 hover:bg-slate-50 dark:hover:bg-slate-900' : 'bg-green-50/50 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-950/30'}`}
                          onClick={async () => {
                            if (!notification.isRead) {
                              await handleMarkAsRead(notification._id || notification.id);
                            }
                            closeBellDropdown();
                            setCurrentTab('dashboard');
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className={`text-xs leading-5 ${notification.isRead ? 'text-slate-500 dark:text-slate-400 font-normal' : 'text-slate-900 dark:text-slate-100 font-semibold'}`}>
                              {notification.message || notification.title || 'New notification'}
                            </p>
                            {!notification.isRead && (
                              <span className="inline-flex items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white shrink-0">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {new Date(notification.createdAt || notification.date || Date.now()).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => {
                      closeBellDropdown();
                      setCurrentTab('dashboard');
                    }}
                    className="w-full px-4 py-3 text-xs font-bold text-center text-green-700 dark:text-green-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all border-t border-slate-200 dark:border-slate-800"
                  >
                    View all notifications
                  </button>
                </div>
              </>
            )}
          </div>
        )}

          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {!user ? (
            <>
              <button
                onClick={() => { setCurrentTab('login'); closeMenu(); }}
                className="hidden sm:block px-5 py-2 text-sm font-semibold rounded-lg border-2 border-green-700 dark:border-green-500 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
              >
                Login
              </button>
              <button
                onClick={() => { setCurrentTab('register'); closeMenu(); }}
                className="px-5 py-2 text-sm font-bold rounded-lg bg-green-700 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white shadow-md shadow-green-700/20 transition-all"
              >
                Sign Up
              </button>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => { setCurrentTab('dashboard'); closeMenu(); }}
                className={`items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'dashboard'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {user.role === 'ADMIN' && <ShieldCheck className="w-4 h-4 text-purple-500" />}
                {user.role === 'COLLECTOR' && <Truck className="w-4 h-4 text-blue-500" />}
                {user.role === 'RESIDENT' && <LayoutDashboard className="w-4 h-4 text-green-600" />}
                <span>{user.role} Portal</span>
              </button>

              <button
                onClick={() => { logout(); setCurrentTab('landing'); closeMenu(); }}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile dropdown panel */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md`}> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          {!user ? (
            <div className="space-y-3">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => { setCurrentTab(link.tab); closeMenu(); }}
                    className={`text-left text-sm font-medium py-3 px-4 rounded-xl transition-all ${
                      currentTab === link.tab
                        ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setCurrentTab('login'); closeMenu(); }}
                  className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => { setCurrentTab('register'); closeMenu(); }}
                  className="w-full px-4 py-3 text-sm font-bold rounded-xl bg-green-700 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white transition-all"
                >
                  Sign Up
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => { setCurrentTab('dashboard'); closeMenu(); }}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <span>{user.role} Portal</span>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-rose-500 px-2 py-1 text-[10px] font-bold text-white">
                      {unreadCount} new
                    </span>
                  )}
                </div>
              </button>
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4 text-sm text-slate-700 dark:text-slate-300">
                <div className="font-semibold">Signed in as</div>
                <div className="mt-1">{user.name}</div>
              </div>
              <button
                onClick={() => { logout(); setCurrentTab('landing'); closeMenu(); }}
                className="w-full px-4 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold transition-all"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
