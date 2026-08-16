import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResidentDashboard from './pages/ResidentDashboard';
import CollectorDashboard from './pages/CollectorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ServicesPage from './pages/ServicesPage';
import { requestPushNotificationPermission } from './utils/pushNotification';

function MainContent() {
  const { user, loading } = useAuth();

  // Initialize route tab from URL hash or localStorage so refresh maintains page!
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '').trim();
    const validTabs = ['landing', 'about', 'services', 'contact', 'login', 'register', 'dashboard'];
    if (hash && validTabs.includes(hash)) return hash;
    const stored = localStorage.getItem('wps_active_tab');
    if (stored && validTabs.includes(stored)) return stored;
    return user ? 'dashboard' : 'landing';
  };

  const [currentTab, setCurrentTabState] = useState(getInitialTab);

  const setCurrentTab = (tab) => {
    setCurrentTabState(tab);
    window.location.hash = `#${tab}`;
    localStorage.setItem('wps_active_tab', tab);
  };



  // Listen for browser back/forward and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      const validTabs = ['landing', 'about', 'services', 'contact', 'login', 'register', 'dashboard'];
      if (hash && validTabs.includes(hash)) {
        setCurrentTabState(hash);
        localStorage.setItem('wps_active_tab', hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Auto route logged-in users to dashboard upon page refresh if not on explicit public pages
  useEffect(() => {
    if (!loading && user) {
      const hash = window.location.hash.replace('#', '').trim();
      const publicTabs = ['about', 'services', 'contact'];
      if (!publicTabs.includes(hash)) {
        setCurrentTabState('dashboard');
        window.location.hash = '#dashboard';
        localStorage.setItem('wps_active_tab', 'dashboard');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <span>Initializing Waste Pickup Scheduler...</span>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    if (currentTab === 'login') return <LoginPage setCurrentTab={setCurrentTab} />;
    if (currentTab === 'register') return <RegisterPage setCurrentTab={setCurrentTab} />;
    if (currentTab === 'about') return <AboutPage />;
    if (currentTab === 'services') return <ServicesPage setCurrentTab={setCurrentTab} />;
    if (currentTab === 'contact') return <ContactPage />;

    if (currentTab === 'dashboard') {
      if (!user) return <LoginPage setCurrentTab={setCurrentTab} />;
      if (user.role === 'ADMIN') return <AdminDashboard />;
      if (user.role === 'COLLECTOR') return <CollectorDashboard />;
      return <ResidentDashboard />;
    }

    return <LandingPage setCurrentTab={setCurrentTab} />;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div>
        <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
        <main>{renderActiveView()}</main>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
