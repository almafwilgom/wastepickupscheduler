import React from 'react';
import { Globe, Mail, X } from 'lucide-react';

const FacebookIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37a4 4 0 1 1-4.21-4.21 4 4 0 0 1 4.21 4.21z" />
    <path d="M17.5 6.5h.01" />
  </svg>
);

const TikTokIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2v5.07a5 5 0 0 0 5 5H17" />
    <path d="M9 2C9 2 9 8 15 8s6-1.79 6-6v14a4 4 0 0 1-4 4c-4 0-5-4-5-4" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="border-t border-slate-700 bg-slate-900 dark:border-slate-800 dark:bg-slate-950 py-8 text-slate-300 text-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Waste Pickup Scheduler logo" className="h-10 w-10 object-contain rounded-full border border-green-500/20 shadow-sm" />
          <span className="font-bold text-slate-100 tracking-tight">Waste Pickup Scheduler</span>
        </div>

        <div className="flex items-center gap-4">
          <a href="#" className="text-slate-500 hover:text-green-700 dark:hover:text-green-400 transition-colors" aria-label="Visit our website">
            <Globe className="w-5 h-5" />
          </a>
          <a href="#" className="text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" aria-label="Visit our Facebook page">
            <FacebookIcon className="w-5 h-5" />
          </a>
          <a href="#" className="text-slate-500 hover:text-cyan-400 dark:hover:text-cyan-300 transition-colors" aria-label="Visit our X profile">
            <X className="w-5 h-5" />
          </a>
          <a href="#" className="text-slate-500 hover:text-pink-500 dark:hover:text-pink-400 transition-colors" aria-label="Visit our Instagram profile">
            <InstagramIcon className="w-5 h-5" />
          </a>
          <a href="#" className="text-slate-500 hover:text-fuchsia-500 dark:hover:text-fuchsia-400 transition-colors" aria-label="Visit our TikTok profile">
            <TikTokIcon className="w-5 h-5" />
          </a>
          <a href="#" className="text-slate-500 hover:text-green-700 dark:hover:text-green-400 transition-colors" aria-label="Contact us">
            <Mail className="w-5 h-5" />
          </a>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          &copy; 2026 Waste Pickup Scheduler. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
