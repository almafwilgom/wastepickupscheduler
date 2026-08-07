import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('app_theme');
    return savedTheme || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    body.classList.remove('dark', 'light');
    body.classList.add(theme);

    root.style.backgroundColor = theme === 'dark' ? '#020617' : '#ffffff';
    root.style.color = theme === 'dark' ? '#f8fafc' : '#0f172a';
    body.style.backgroundColor = theme === 'dark' ? '#020617' : '#ffffff';
    body.style.color = theme === 'dark' ? '#f8fafc' : '#0f172a';

    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
