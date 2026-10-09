import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { VerificationBadge } from '../components/VerificationBadge';
import {
  Star, Award, Clock, MapPin, Phone, Mail, PlusCircle, CheckCircle, Globe,
  Briefcase, Wrench, Image as ImageIcon, PhoneCall, MessageSquare, Shield,
} from 'lucide-react';

const StarRating = ({ rating, large = false }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={large ? 20 : 15} fill={i <= Math.round(rating) ? '#f59e0b' : 'transparent'} color={i <= Math.round(rating) ? '#f59e0b' : '#cbd5e1'} />
    ))}
  </div>
);

const SkillBadge = ({ skill }) => (
  <span
    style={{
      background: '#eff6ff',
      color: '#1d4ed8',
      border: '1px solid #dbeafe',
      padding: '0.3rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.8rem',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
    }}
  >
    <CheckCircle size={12} color="#2563eb" /> {skill}
  </span>
);

export const ProviderProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePortfolioIdx, setActivePortfolioIdx] = useState(null);

  useEffect(() => {
    api.getProviderById(id)
      .then((res) => {
        setProvider(res.data);
        setReviews(res.reviews || []);
      })
      .catch((err) => console.warn('Provider details load error:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 1rem', gap: '1rem' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
      <p style={{ color: '#64748b' }}>Loading provider profile...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!provider) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <h2 style={{ color: '#ef4444' }}>Provider profile not found.</h2>
      <Link to="/providers" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Provider List</Link>
    </div>
  );

  const providerUser = provider.userId || {};
  const canCall = user && (user.role === 'customer' || user.role === 'admin');

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>

      {/* ── Profile Header Card ── */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderColor: 'transparent',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative BG blob */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Profile Avatar */}
            <div style={{ width: '90px', height: '90px', borderRadius: '20px', background: '#1d4ed8', border: '3px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', flexShrink: 0, overflow: 'hidden' }}>
              {provider.profileImage
                ? <img src={provider.profileImage} alt={provider.businessName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display='none'; }} />
                : <Wrench size={44} color="#93c5fd" />
              }
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>
                  {provider.businessName || providerUser.name}
                </h1>
                <VerificationBadge status={provider.verificationStatus} />
              </div>

              <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '0.75rem' }}>
                Operated by <strong style={{ color: '#cbd5e1' }}>{providerUser.name}</strong> •&nbsp;
                {provider.experienceYears ? `${provider.experienceYears} Years Experience` : 'Experienced Professional'}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.88rem' }}>
                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.75rem', borderRadius: '8px' }}>
                  <StarRating rating={provider.averageRating || 0} />
                  <span style={{ color: '#fbbf24', fontWeight: '700' }}>
                    {provider.averageRating ? provider.averageRating.toFixed(1) : 'New'}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>({provider.reviewCount || 0} reviews)</span>
                </div>

                {/* Completed Jobs */}
                {provider.completedJobsCount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(16,185,129,0.15)', padding: '0.3rem 0.75rem', borderRadius: '8px' }}>
                    <CheckCircle size={15} color="#10b981" />
                    <span style={{ color: '#6ee7b7', fontWeight: '600' }}>{provider.completedJobsCount} Jobs Completed</span>
                  </div>
                )}

                {/* Availability */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.07)', padding: '0.3rem 0.75rem', borderRadius: '8px' }}>
                  <Clock size={15} color="#94a3b8" />
                  <span style={{ color: '#94a3b8' }}>{provider.availability?.workingHours || '09:00 AM – 07:00 PM'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <Link to="/requests/new" className="btn btn-primary">
              <PlusCircle size={17} /> Request Service
            </Link>
            {canCall && (
              <a
                href={provider.businessPhone || providerUser.phone ? `tel:${provider.businessPhone || providerUser.phone}` : '#'}
                onClick={(e) => {
                  if (!(provider.businessPhone || providerUser.phone)) {
                    e.preventDefault();
                    alert('Direct phone number is unlocked upon booking confirmation.');
                  }
                }}
                className="btn btn-success"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                title={provider.businessPhone || providerUser.phone ? `Call ${provider.businessName}` : 'Contact info unlocked upon booking'}
              >
                <PhoneCall size={17} />
                {provider.businessPhone || providerUser.phone ? 'Call Provider' : 'Call (Post Booking)'}
              </a>
            )}
            {!user && (
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ textAlign: 'center' }}>
                Login to Contact
              </Link>
            )}
          </div>

        </div>

        {/* Service Categories & Areas */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', zIndex: 2 }}>
          <div>
            <strong style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service Categories:</strong>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {provider.serviceCategories?.map((c, i) => (
                <span key={i} style={{ background: 'rgba(37,99,235,0.25)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: '700' }}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div>
            <strong style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service Areas:</strong>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {provider.serviceAreas?.map((a, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,0.07)', color: '#cbd5e1', padding: '0.2rem 0.65rem', borderRadius: '4px', fontSize: '0.82rem' }}>
                  📍 {a.city}{a.locality ? `, ${a.locality}` : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid-3">

        {/* ── LEFT: About, Skills, Portfolio, Reviews ── */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* About / Biography */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.75rem', color: '#0f172a' }}>
              About & Experience
            </h3>
            <p style={{ lineHeight: '1.75', color: '#334155', fontSize: '0.95rem' }}>
              {provider.biography || 'Professional local technician dedicated to providing prompt, reliable, and high-quality home services.'}
            </p>

            {/* Languages */}
            {provider.languages && provider.languages.length > 0 && (
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Globe size={15} color="#64748b" />
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Languages:</span>
                {provider.languages.map((l, i) => (
                  <span key={i} style={{ background: '#f1f5f9', padding: '0.15rem 0.55rem', borderRadius: '4px', fontSize: '0.82rem', color: '#334155' }}>{l}</span>
                ))}
              </div>
            )}
          </div>

          {/* Skills & Specializations */}
          {provider.skills && provider.skills.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1rem', color: '#0f172a' }}>
                Skills & Specializations
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {provider.skills.map((skill, i) => (
                  <SkillBadge key={i} skill={skill} />
                ))}
              </div>
            </div>
          )}

          {/* Portfolio Gallery */}
          {provider.portfolio && provider.portfolio.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1rem', color: '#0f172a' }}>
                <ImageIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Portfolio — Completed Projects
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                {provider.portfolio.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => setActivePortfolioIdx(i === activePortfolioIdx ? null : i)}
                    style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: i === activePortfolioIdx ? '#2563eb' : '#e2e8f0',
                      transition: 'all 0.2s ease',
                      transform: i === activePortfolioIdx ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div style={{ padding: '0.5rem 0.65rem', background: '#f8fafc' }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>
                      <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0 0' }}>{item.category}</p>
                    </div>
                  </div>
                ))}
              </div>
              {activePortfolioIdx !== null && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0f9ff', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                  <p style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0369a1' }}>{provider.portfolio[activePortfolioIdx].title}</p>
                  <p style={{ fontSize: '0.85rem', color: '#0c4a6e', marginTop: '0.25rem' }}>{provider.portfolio[activePortfolioIdx].description}</p>
                </div>
              )}
            </div>
          )}

          {/* Customer Reviews */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: '#0f172a' }}>
              Customer Ratings & Verified Feedback ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>
                No customer reviews submitted yet. Be the first to book and review!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {reviews.map((r) => (
                  <div key={r._id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.85rem', flexShrink: 0 }}>
                      {(r.customerId?.name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>{r.customerId?.name || 'Customer'}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <StarRating rating={r.rating} />
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', fontStyle: 'italic' }}>"{r.reviewText}"</p>
                      <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '600', marginTop: '0.3rem', display: 'inline-block' }}>✓ Verified Completed Job</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT SIDEBAR: Pricing, Availability, Contact ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Pricing Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '1rem', color: '#0f172a' }}>
              Indicative Pricing
            </h3>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#2563eb', marginBottom: '0.25rem' }}>
              ₹{provider.indicativePriceRange?.min || 200} – ₹{provider.indicativePriceRange?.max || 2000}
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Indicative range. Final estimate provided via custom quotation after reviewing your job.
            </p>
            <Link to="/requests/new" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Get a Free Quote
            </Link>
          </div>

          {/* Availability Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.75rem', color: '#0f172a' }}>
              Availability
            </h3>
            <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: provider.availability?.isAvailable ? '#10b981' : '#ef4444',
                    flexShrink: 0,
                    boxShadow: provider.availability?.isAvailable ? '0 0 0 3px rgba(16,185,129,0.2)' : 'none',
                  }}
                />
                <strong style={{ color: provider.availability?.isAvailable ? '#059669' : '#dc2626' }}>
                  {provider.availability?.isAvailable ? 'Available for New Jobs' : 'Currently Unavailable'}
                </strong>
              </div>
              <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={14} /> {provider.availability?.workingHours || '09:00 AM – 07:00 PM'}
              </div>
            </div>
          </div>

          {/* Contact Card (only for logged-in customers, after booking logic) */}
          <div className="card" style={{ border: '1px solid #dbeafe', background: '#f0f9ff' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1e40af' }}>
              <PhoneCall size={17} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
              Contact Provider
            </h3>
            {canCall ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {provider.businessPhone || providerUser.phone ? (
                  <>
                    <a
                      href={`tel:${provider.businessPhone || providerUser.phone}`}
                      className="btn btn-primary btn-sm"
                      style={{ justifyContent: 'center' }}
                      title="Call provider now"
                    >
                      <Phone size={15} /> Call: {provider.businessPhone || providerUser.phone}
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(provider.businessPhone || providerUser.phone);
                        alert('Phone number copied to clipboard!');
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ justifyContent: 'center', fontSize: '0.78rem' }}
                    >
                      📋 Copy Phone Number
                    </button>
                    <p style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', margin: 0 }}>
                      📱 Opens default phone dialer on mobile
                    </p>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                      🔒 Direct phone calling unlocks once you post a request or confirm a booking.
                    </p>
                    <Link to="/requests/new" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                      Request a Quote
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  Login to view contact details and call the provider.
                </p>
                <Link to="/login" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Login to Contact
                </Link>
              </div>
            )}
          </div>


          {/* Quick Stats */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.75rem', color: '#0f172a' }}>
              Professional Credentials
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Experience</span>
                <strong>{provider.experienceYears || 'N/A'} years</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Jobs Completed</span>
                <strong style={{ color: '#059669' }}>{provider.completedJobsCount || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Rating</span>
                <strong style={{ color: '#d97706' }}>{provider.averageRating ? `${provider.averageRating.toFixed(1)} / 5` : 'New'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Verification</span>
                <VerificationBadge status={provider.verificationStatus} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Member Since</span>
                <strong>{providerUser.createdAt ? new Date(providerUser.createdAt).getFullYear() : 'N/A'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
