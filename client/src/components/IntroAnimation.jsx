import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, SkipForward, Play, ShieldCheck, Zap, Wrench } from 'lucide-react';
import { themeMusic } from '../utils/themeMusic';

export const IntroAnimation = ({ onComplete }) => {
  const [show, setShow] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(() => {
    return localStorage.getItem('fixnearby_music_pref') === 'enabled';
  });
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Only show intro once per browser session
    const hasSeenIntro = sessionStorage.getItem('fixnearby_intro_seen');
    if (!hasSeenIntro) {
      setShow(true);
    } else if (onComplete) {
      onComplete();
    }
  }, []);

  const handleStartApp = (enableMusic = false) => {
    sessionStorage.setItem('fixnearby_intro_seen', 'true');
    if (enableMusic) {
      localStorage.setItem('fixnearby_music_pref', 'enabled');
      setMusicEnabled(true);
      themeMusic.play();
    }
    setShow(false);
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    sessionStorage.setItem('fixnearby_intro_seen', 'true');
    setShow(false);
    if (onComplete) onComplete();
  };

  const handleToggleMusic = () => {
    if (!musicEnabled) {
      localStorage.setItem('fixnearby_music_pref', 'enabled');
      setMusicEnabled(true);
      themeMusic.play();
    } else {
      const muted = themeMusic.toggleMute();
      setIsMuted(muted);
    }
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        animation: 'fadeIn 0.6s ease-out',
      }}
    >
      {/* Top Bar Controls */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          zIndex: 10,
        }}
      >
        <button
          onClick={handleToggleMusic}
          className="btn btn-secondary btn-sm"
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {musicEnabled && !isMuted ? <Volume2 size={16} color="#60a5fa" /> : <VolumeX size={16} />}
          <span>{musicEnabled && !isMuted ? 'Music ON' : 'Music OFF'}</span>
        </button>

        <button
          onClick={handleSkip}
          className="btn btn-outline btn-sm"
          style={{
            color: '#94a3b8',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          <SkipForward size={16} /> Skip Intro
        </button>
      </div>

      {/* Main Animated Intro Banner */}
      <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
        {/* Animated Brand 3D Icon */}
        <div
          style={{
            width: '110px',
            height: '110px',
            margin: '0 auto 2rem auto',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 50px rgba(37, 99, 235, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
            transform: 'perspective(600px) rotateX(10deg) rotateY(-5deg)',
            animation: 'floatBounce 3s ease-in-out infinite',
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
            <Zap size={22} color="#f59e0b" />
          </div>
          <Wrench size={54} color="#ffffff" />
        </div>

        <span
          style={{
            background: 'rgba(37, 99, 235, 0.25)',
            border: '1px solid #3b82f6',
            color: '#93c5fd',
            padding: '0.4rem 1.25rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: '700',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '1rem',
          }}
        >
          Welcome to FixNearby
        </span>

        <h1
          style={{
            fontSize: '3rem',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.75rem',
            lineHeight: '1.15',
          }}
        >
          FixNearby
        </h1>

        <p
          style={{
            fontSize: '1.35rem',
            color: '#94a3b8',
            fontWeight: '500',
            marginBottom: '2.5rem',
          }}
        >
          "Trusted Local Experts, Just a Call Away."
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleStartApp(true)}
            className="btn btn-primary btn-lg"
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
            }}
          >
            <Play size={20} /> Enter with Ambient Music
          </button>

          <button
            onClick={() => handleStartApp(false)}
            className="btn btn-secondary btn-lg"
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: '#334155',
              color: '#ffffff',
              borderColor: '#475569',
            }}
          >
            Enter FixNearby
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2rem' }}>
          Fast, transparent price quotations and verified neighborhood service professionals.
        </p>
      </div>

      <style>{`
        @keyframes floatBounce {
          0%, 100% { transform: perspective(600px) rotateX(10deg) translateY(0px); }
          50% { transform: perspective(600px) rotateX(5deg) translateY(-14px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
