import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Award, IndianRupee } from 'lucide-react';
import { VerificationBadge } from './VerificationBadge';

export const ProviderCard = ({ provider }) => {
  const user = provider.userId || {};
  const primaryArea = provider.serviceAreas?.[0]?.city || user.location?.city || 'Local Area';

  return (
    <div className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--secondary)' }}>
              {provider.businessName || user.name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.name}</p>
          </div>
          <VerificationBadge status={provider.verificationStatus} />
        </div>

        {/* Rating and Experience */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', fontSize: '0.88rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#d97706', fontWeight: '700' }}>
            <Star size={16} fill="#f59e0b" color="#f59e0b" />
            <span>{provider.averageRating ? provider.averageRating.toFixed(1) : 'New'}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontSize: '0.8rem' }}>
              ({provider.reviewCount || 0})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
            <Award size={15} />
            <span>{provider.experienceYears} yrs exp</span>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
          {provider.serviceCategories?.map((cat, idx) => (
            <span key={idx} style={{ background: '#f1f5f9', color: '#334155', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '600' }}>
              {cat}
            </span>
          ))}
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {provider.biography || 'Experienced local professional providing quality repair and installation services.'}
        </p>
      </div>

      <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Est. Indicative Price</span>
          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--secondary)', display: 'flex', alignItems: 'center' }}>
            ₹{provider.indicativePriceRange?.min || 200} - ₹{provider.indicativePriceRange?.max || 2000}
          </div>
        </div>

        <Link to={`/providers/${provider._id}`} className="btn btn-outline btn-sm">
          View Profile
        </Link>
      </div>
    </div>
  );
};
