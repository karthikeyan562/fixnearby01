import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ProviderCard } from '../components/ProviderCard';
import { ThreeDServiceScene } from '../components/ThreeDServiceScene';
import { TestimonialsSection } from '../components/TestimonialsSection';
import {
  Search, MapPin, Wrench, ShieldCheck, Zap, Award, Star, ArrowRight,
  Mic, SlidersHorizontal, Clock, IndianRupee,
} from 'lucide-react';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';

const SERVICE_ICONS = {
  Electrician:    { icon: '⚡', color: '#f59e0b', bg: '#fef3c7' },
  Plumber:        { icon: '🚰', color: '#0284c7', bg: '#e0f2fe' },
  'AC Technician':{ icon: '❄️', color: '#06b6d4', bg: '#cffafe' },
  'Appliance Repair':{ icon: '🧺', color: '#7c3aed', bg: '#ede9fe' },
  Carpenter:      { icon: '🪚', color: '#92400e', bg: '#fef3c7' },
  Painter:        { icon: '🎨', color: '#be185d', bg: '#fce7f3' },
};

export const HomePage = () => {
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setIsOpen: setVoiceOpen } = useVoiceAssistant();

  useEffect(() => {
    api.getProviders({ verificationStatus: 'verified' })
      .then((res) => setFeaturedProviders(res.data.slice(0, 6)))
      .catch((err) => console.warn('Failed to load featured providers:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (location) params.append('city', location);
    navigate(`/providers?${params.toString()}`);
  };

  const categories = Object.entries(SERVICE_ICONS).map(([title, meta]) => ({
    title,
    icon: meta.icon,
    color: meta.color,
    bg: meta.bg,
    desc: {
      Electrician: 'Wiring, MCB, lights, inverter installation',
      Plumber: 'Leak repair, tap fixing, motor & pipe fitting',
      'AC Technician': 'Deep cleaning, gas refill, cooling fix',
      'Appliance Repair': 'Washing machine, fridge, microwave, TV',
      Carpenter: 'Furniture repair, door latch, modular cabinets',
      Painter: 'Interior & exterior painting, waterproofing',
    }[title],
  }));

  return (
    <div>
      {/* ══════════════ HERO SECTION ══════════════ */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
          color: '#ffffff',
          padding: '4.5rem 0 0 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative glowing blobs */}
        <div
          style={{
            position: 'absolute', top: '-80px', left: '-60px',
            width: '400px', height: '400px',
            background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute', bottom: '-100px', right: '-80px',
            width: '350px', height: '350px',
            background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingBottom: '3rem' }}>
            <span
              className="badge-chip"
              style={{
                background: 'rgba(37, 99, 235, 0.22)',
                border: '1px solid #3b82f6',
                color: '#93c5fd',
                padding: '0.45rem 1.1rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.7px',
                display: 'inline-block',
                marginBottom: '1.25rem',
              }}
            >
              🏅 Trusted Neighborhood Professionals
            </span>

            <h1
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                fontWeight: '900',
                margin: '0 0 1rem 0',
                lineHeight: '1.15',
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Book Verified Local Service Experts in Minutes
            </h1>

            <p style={{ fontSize: '1.12rem', color: '#94a3b8', marginBottom: '2.5rem' }}>
              Describe your problem, receive instant price quotations from top-rated nearby technicians, and track your job effortlessly.
            </p>

            {/* Search Bar Form */}
            <form
              onSubmit={handleSearch}
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                padding: '0.65rem',
                borderRadius: '18px',
                display: 'flex',
                gap: '0.65rem',
                alignItems: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                flexWrap: 'wrap',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.85rem',
                  background: '#f8fafc',
                  borderRadius: '10px',
                }}
              >
                <Wrench size={18} color="#2563eb" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.95rem', outline: 'none', color: '#0f172a' }}
                >
                  <option value="">All Service Categories</option>
                  {Object.keys(SERVICE_ICONS).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  flex: 1,
                  minWidth: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.85rem',
                  background: '#f8fafc',
                  borderRadius: '10px',
                }}
              >
                <MapPin size={18} color="#2563eb" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or locality (e.g. Coimbatore)"
                  style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.95rem', outline: 'none', color: '#0f172a' }}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ flexShrink: 0 }}>
                <Search size={18} /> Search Experts
              </button>
            </form>

            {/* Voice Assistant Shortcut */}
            <div
              style={{
                marginTop: '1.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.07)',
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                fontSize: '0.88rem',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Mic size={15} color="#60a5fa" />
              <span style={{ color: '#94a3b8' }}>Or speak to our AI Voice Helper:</span>
              <button
                onClick={() => setVoiceOpen(true)}
                style={{ background: 'none', border: 'none', color: '#60a5fa', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
              >
                "Find an electrician near me"
              </button>
            </div>
          </div>

          {/* ── Three.js 3D Interactive Hero Scene ── */}
          <div style={{ marginTop: '1rem' }}>
            <ThreeDServiceScene />
          </div>
        </div>
      </section>

      {/* ══════════════ TRUST STATS BAR ══════════════ */}
      <section
        style={{
          background: 'linear-gradient(90deg, #1e40af 0%, #1d4ed8 100%)',
          color: '#ffffff',
          padding: '1.25rem 0',
        }}
      >
        <div className="container">
          <div
            style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem', textAlign: 'center' }}
          >
            {[
              { value: '2,400+', label: 'Happy Customers' },
              { value: '180+', label: 'Verified Professionals' },
              { value: '8,100+', label: 'Services Completed' },
              { value: '4.8★', label: 'Average Rating' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fbbf24' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#bfdbfe', fontWeight: '600' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ POPULAR CATEGORIES ══════════════ */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a' }}>Popular Services</h2>
            <p style={{ color: '#64748b', marginTop: '0.4rem' }}>Choose a category to discover nearby verified specialists</p>
          </div>

          <div className="grid-3">
            {categories.map((cat) => (
              <div
                key={cat.title}
                onClick={() => navigate(`/providers?category=${encodeURIComponent(cat.title)}`)}
                className="card card-interactive"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}
              >
                <div
                  style={{
                    fontSize: '1.8rem',
                    background: cat.bg,
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${cat.color}22`,
                  }}
                >
                  {cat.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>{cat.title}</h3>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.25rem', lineHeight: '1.5' }}>{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section
        style={{
          background: '#ffffff',
          padding: '4.5rem 0',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a' }}>How FixNearby Works</h2>
            <p style={{ color: '#64748b', marginTop: '0.4rem' }}>Four transparent steps to get your home repaired</p>
          </div>

          <div className="grid-4">
            {[
              { step: 1, title: 'Post Your Request', desc: 'Describe your issue, location, and date — or use the AI Voice Helper.', icon: '📝', color: '#2563eb' },
              { step: 2, title: 'Receive Quotes', desc: 'Verified nearby technicians review your job and send upfront price quotes.', icon: '💬', color: '#0284c7' },
              { step: 3, title: 'Compare & Accept', desc: 'Compare estimates, provider ratings, and accept the best offer.', icon: '⚖️', color: '#7c3aed' },
              { step: 4, title: 'Job Completed', desc: 'Technician arrives at your scheduled time. Pay and leave a review!', icon: '✅', color: '#059669' },
            ].map((item) => (
              <div key={item.step} style={{ textAlign: 'center', padding: '1rem' }}>
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '20px',
                    background: `${item.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    fontSize: '1.8rem',
                    boxShadow: `0 4px 14px ${item.color}30`,
                    position: 'relative',
                  }}
                >
                  {item.icon}
                  <span
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: item.color,
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.step}
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.4rem', color: '#0f172a' }}>{item.title}</h4>
                <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: '1.55' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CUSTOMER TESTIMONIALS & VIDEOS ══════════════ */}
      <TestimonialsSection />

      {/* ══════════════ FEATURED VERIFIED PROVIDERS ══════════════ */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}
          >
            <div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0f172a' }}>
                Featured Verified Professionals
              </h2>
              <p style={{ color: '#64748b' }}>Top-rated service providers ready in your region</p>
            </div>
            <Link to="/providers" className="btn btn-outline">
              View All Providers <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <div className="loading-spinner" style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.9s linear infinite', marginBottom: '0.75rem' }} />
              <p>Loading verified providers...</p>
            </div>
          ) : featuredProviders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <p>No verified providers found yet. <Link to="/register">Register as a provider</Link> to get started.</p>
            </div>
          ) : (
            <div className="grid-3">
              {featuredProviders.map((provider) => (
                <ProviderCard key={provider._id} provider={provider} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════ FINAL CTA BANNER ══════════════ */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
          color: '#ffffff',
          padding: '4rem 0',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.75rem' }}>
            Ready to Fix Your Home Issue?
          </h2>
          <p style={{ color: '#bfdbfe', fontSize: '1.05rem', marginBottom: '2rem', maxWidth: '520px', margin: '0 auto 2rem auto' }}>
            Post your service request in 60 seconds and get competitive quotes from trusted local experts.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/requests/new" className="btn btn-lg" style={{ background: '#ffffff', color: '#1e40af', fontWeight: '800' }}>
              Post a Service Request
            </Link>
            <Link to="/providers" className="btn btn-lg btn-outline" style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}>
              Browse Professionals
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
