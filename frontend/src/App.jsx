import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
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

function MainContent() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('landing');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-eco-500 border-t-transparent rounded-full animate-spin" />
          <span>Initializing Waste Pickup Scheduler...</span>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    if (currentTab === 'login') return <LoginPage setCurrentTab={setCurrentTab} />;
    if (currentTab === 'register') return <RegisterPage setCurrentTab={setCurrentTab} />;
    if (currentTab === 'about') return <AboutPage />;
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
