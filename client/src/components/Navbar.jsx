import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';
import { Wrench, Mic, Bell, User, LogOut, ShieldCheck, Search, Globe, Volume2, VolumeX } from 'lucide-react';
import { api } from '../services/api';
import { themeMusic } from '../utils/themeMusic';


export const Navbar = () => {
  const { user, isAuthenticated, isCustomer, isProvider, isAdmin, logout } = useAuth();
  const { setIsOpen: setVoiceOpen } = useVoiceAssistant();
  const [unreadCount, setUnreadCount] = useState(0);
  const [language, setLanguage] = useState('EN');
  const [musicPlaying, setMusicPlaying] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    if (isAuthenticated) {
      api.getNotifications()
        .then((res) => setUnreadCount(res.unreadCount || 0))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="glass-header">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{ background: 'var(--primary)', color: '#fff', padding: '0.55rem', borderRadius: '12px', display: 'flex' }}>
            <Wrench size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--secondary)', letterSpacing: '-0.5px' }}>
              Fix<span style={{ color: 'var(--primary)' }}>Nearby</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '-4px' }}>
              Local Service Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/providers" style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>
            Find Professionals
          </Link>

          {isCustomer && (
            <>
              <Link to="/dashboard" style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                Customer Dashboard
              </Link>
              <Link to="/requests/new" className="btn btn-primary btn-sm">
                + Post Request
              </Link>
            </>
          )}

          {isProvider && (
            <>
              <Link to="/provider/dashboard" style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                Provider Dashboard
              </Link>
              <Link to="/provider/profile-manage" style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                My Business Profile
              </Link>
            </>
          )}

          {isAdmin && (
            <Link to="/admin" style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={18} /> Admin Portal
            </Link>
          )}

          {/* Voice Helper Action Button */}
          <button
            onClick={() => setVoiceOpen(true)}
            className="btn btn-outline btn-sm"
            style={{ borderRadius: 'var(--radius-full)', background: '#eff6ff' }}
            title="Open FixNearby Voice Assistant"
          >
            <Mic size={16} color="var(--primary)" />
            <span>Voice Helper</span>
          </button>

          {/* Theme Music Toggle */}
          <button
            onClick={() => {
              if (musicPlaying) {
                themeMusic.stop();
                setMusicPlaying(false);
              } else {
                themeMusic.play();
                setMusicPlaying(true);
              }
            }}
            style={{
              background: musicPlaying ? '#eff6ff' : 'none',
              border: musicPlaying ? '1px solid #bfdbfe' : 'none',
              borderRadius: '9999px',
              padding: '0.3rem 0.6rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: musicPlaying ? '#2563eb' : '#94a3b8',
              fontSize: '0.75rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
            title={musicPlaying ? 'Mute theme music' : 'Play ambient music'}
          >
            {musicPlaying ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>


          <button
            onClick={() => setLanguage(l => (l === 'EN' ? 'TA' : 'EN'))}
            style={{ background: 'none', border: 'none', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}
          >
            <Globe size={15} /> {language === 'EN' ? 'EN' : 'தமிழ் (TA)'}
          </button>

          {/* Auth Menu */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)' }}>
                <User size={16} color="var(--primary)" />
                <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>{user.name.split(' ')[0]}</span>
                <span className="badge" style={{ fontSize: '0.65rem', background: '#cbd5e1' }}>{user.role}</span>
              </div>

              <button
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
