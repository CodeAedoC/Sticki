import React, { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import './App.css';

function App() {
  const [theme, setTheme] = useState(() => {
    // Check localStorage for saved theme, default to 'light'
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    // Apply class to body and save theme to localStorage
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-container">
      <nav className="app-nav">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>
        {/* Add theme toggle button to nav */}
        <button
          onClick={toggleTheme}
          className="btn theme-toggle-btn"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? '🌙' : '☀️'} {/* Moon for light, Sun for dark */}
        </button>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  )
}

export default App
