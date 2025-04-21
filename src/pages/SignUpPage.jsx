import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Directly use supabase client for signup

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      // Note: Supabase sends a confirmation email by default.
      // You need to enable this in your Supabase project settings.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // Add options like user metadata if needed
        // options: {
        //   data: { full_name: 'Test User' } 
        // }
      });

      if (error) throw error;

      // Check if confirmation is required
      if (data.user && data.user.identities && data.user.identities.length === 0) {
          setMessage("Signup successful! Please check your email for the confirmation link.");
          // Optionally redirect or clear form after a delay
          // setTimeout(() => navigate('/login'), 5000);
      } else if (data.session) {
          // If email confirmation is off or auto-confirmed, session might be available
          setMessage("Signup successful! Redirecting...");
          // AuthProvider will detect session and redirect via App routing
      } else {
           setMessage("Signup successful! Please check your email for the confirmation link.");
      }

    } catch (error) {
      console.error("Signup failed:", error);
      setError(error.message || 'Failed to sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container"> {/* Reuse login styles for consistency */}
      <div className="login-box">
        <h1 className="login-title">Sign Up for Sticki</h1>
        <form onSubmit={handleSignUp}>
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6" // Add Supabase default requirement
              className="login-input"
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          {message && <p className="signup-message">{message}</p>}
          <button type="submit" className="btn btn-primary login-button" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage; 