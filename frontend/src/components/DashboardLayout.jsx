import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiRequest } from '../services/api';
import { 
  LayoutDashboard, Calendar, List, Bell, User, Settings, 
  LogOut, Menu, Search, X, Shield, Truck, Sparkles, Sun, Moon, CheckCheck 
} from 'lucide-react';

import { triggerPushNotification } from '../utils/pushNotification';

export default function DashboardLayout({ children, activeTab, setActiveTab }) {
  const { user, logout, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastNotifiedId, setLastNotifiedId] = useState(null);

  // Fetch notifications for the top bar bell
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await apiRequest('/notifications', 'GET', null, token);
      const list = res.notifications || [];
      setNotifications(list);

      const latestUnread = list.find((n) => !n.isRead);
      if (latestUnread && latestUnread._id !== lastNotifiedId) {
        setLastNotifiedId(latestUnread._id);
        triggerPushNotification(
          latestUnread.title || '🚛 Waste Pickup Notification',
          latestUnread.message || 'You have a new update regarding your waste pickup.'
        );
      }
    } catch (err) {
      console.warn('Failed to load notifications in topbar:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [token]);

  const handleMarkAsRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, 'PUT', null, token);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiRequest('/notifications/read-all', 'PUT', null, token);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, roles: ['RESIDENT', 'COLLECTOR', 'ADMIN'] },
    { id: 'schedule', label: 'Schedule Pickup', icon: Calendar, roles: ['RESIDENT'] },
    { id: 'requests', label: user?.role === 'RESIDENT' ? 'My Requests' : user?.role === 'COLLECTOR' ? 'My Route' : 'Dispatch Queue', icon: List, roles: ['RESIDENT', 'COLLECTOR', 'ADMIN'] },
    { id: 'collectors', label: 'Collectors', icon: Truck, roles: ['ADMIN'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['RESIDENT', 'COLLECTOR', 'ADMIN'], badge: unreadCount > 0 ? unreadCount : null },
    { id: 'profile', label: 'Profile', icon: User, roles: ['RESIDENT', 'COLLECTOR', 'ADMIN'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['RESIDENT', 'COLLECTOR', 'ADMIN'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-300">
      
      {/* 1. Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
        {/* Brand logo header with circular logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 gap-3">
          <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain rounded-full border border-green-500/20 shadow-sm" />
          <div className="leading-tight text-left">
            <span className="font-extrabold text-sm uppercase tracking-wider text-green-700 dark:text-green-400 block">
              Waste Pickup
            </span>
            <span className="text-[8px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold block">
              Scheduler
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                activeTab === item.id
                  ? 'bg-green-500 text-white shadow-md shadow-green-500/10'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === item.id ? 'bg-white text-green-700' : 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer User Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.slice(0, 2).toUpperCase() || 'US'
              )}
            </div>
            <div className="text-left min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                {user?.role === 'ADMIN' && <Shield className="w-3 h-3 text-purple-500" />}
                {user?.role === 'COLLECTOR' && <Truck className="w-3 h-3 text-blue-500" />}
                <span>{user?.role}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. Slide-out drawer for Mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-white dark:bg-slate-900 h-full shadow-2xl z-10 border-r border-slate-200 dark:border-slate-800 animate-slide-in">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain rounded-full border border-green-500/20" />
                <div className="leading-tight text-left">
                  <span className="font-extrabold text-sm uppercase tracking-wider text-green-700 dark:text-green-400 block">
                    Waste Pickup
                  </span>
                </div>
              </div>
              <button onClick={() => setIsMobileOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {filteredMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-green-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 3. Main Dashboard Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-30 transition-colors">
          
          {/* Mobile menu button & page name */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Capstone Portal
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center w-80 relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pickups, status, dates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 dark:bg-green-400 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                )}
              </button>

              {/* Topbar Notification list popup */}
              {isNotificationOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-3 overflow-hidden text-left animate-fade-in">
                    <div className="px-4 pb-2 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs">Recent Alerts</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                            {unreadCount} Unread
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] font-bold text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
                        </button>
                      )}
                    </div>

                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">No notifications</div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div 
                            key={n._id} 
                            onClick={() => {
                              handleMarkAsRead(n._id);
                            }}
                            className={`p-3 text-xs transition-colors cursor-pointer ${n.isRead ? 'opacity-60 hover:bg-slate-50 dark:hover:bg-slate-800/30' : 'bg-green-50/50 dark:bg-green-950/10 hover:bg-green-50 dark:hover:bg-green-950/20 font-semibold'}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-800 dark:text-slate-200">{n.message}</span>
                              {!n.isRead && (
                                <span className="text-[9px] bg-green-600 text-white font-bold px-1.5 py-0.5 rounded-full shrink-0">NEW</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="pt-2 border-t border-slate-150 dark:border-slate-800 text-center">
                      <button 
                        onClick={() => { setActiveTab('notifications'); setIsNotificationOpen(false); }} 
                        className="text-[11px] text-green-600 dark:text-green-400 font-bold hover:underline"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar / Quick Link */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div 
                onClick={() => setActiveTab('profile')}
                className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 flex items-center justify-center font-bold text-xs cursor-pointer hover:opacity-80 transition-opacity overflow-hidden shrink-0"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.slice(0, 1).toUpperCase()
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 4. Dashboard Main Scroll View */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50 text-left">
          {children}
        </main>
      </div>

    </div>
  );
}
