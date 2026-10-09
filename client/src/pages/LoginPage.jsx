import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, LogIn, Shield, User, Briefcase, Zap } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'admin') navigate('/admin');
        else if (res.user.role === 'provider') navigate('/provider/dashboard');
        else navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Account Autofill
  const autofillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', background: 'var(--primary)', color: '#fff', padding: '0.65rem', borderRadius: '14px', marginBottom: '0.75rem' }}>
            <Wrench size={26} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--secondary)' }}>Welcome Back to FixNearby</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Log in to manage your service requests or business jobs</p>
        </div>

        {/* Quick Demo Credentials Panel */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '0.85rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', fontSize: '0.82rem', color: '#1e40af', marginBottom: '0.5rem' }}>
            <Zap size={14} /> Quick Demo One-Click Login:
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => autofillDemo('ramesh@example.com', 'password123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', background: '#ffffff' }}
            >
              <User size={12} /> Customer
            </button>
            <button
              onClick={() => autofillDemo('suresh.elec@example.com', 'password123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', background: '#ffffff' }}
            >
              <Briefcase size={12} /> Provider
            </button>
            <button
              onClick={() => autofillDemo('admin@fixnearby.com', 'admin123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', background: '#ffffff' }}
            >
              <Shield size={12} /> Admin
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="card">
          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              <LogIn size={18} /> {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: '700', color: 'var(--primary)' }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
