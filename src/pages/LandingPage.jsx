import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1>Welcome to Sticki!</h1>
        <p>Your Collaborative Whiteboard.</p>
      </header>
      <section className="landing-actions">
        <Link to="/login" className="btn btn-primary landing-btn">
          Log In
        </Link>
        <Link to="/signup" className="btn btn-secondary landing-btn">
          Sign Up
        </Link>
      </section>
      {/* Add more landing page content here - features, images, etc. */}
      <section className="landing-features">
        <h2>Features</h2>
        <ul>
            <li>Real-time Collaboration</li>
            <li>Sticky Notes & Drawing</li>
            <li>Live Chat</li>
            <li>Dark Mode</li>
        </ul>
      </section>
    </div>
  );
}

export default LandingPage; 