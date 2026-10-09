import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ProviderCard } from '../components/ProviderCard';
import { Search, Filter, Users, SlidersHorizontal } from 'lucide-react';

export const ProviderListingPage = () => {
  const [searchParams] = useSearchParams();

  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [verificationStatus, setVerificationStatus] = useState(searchParams.get('verificationStatus') || '');
  const [minRating, setMinRating] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [isAvailable, setIsAvailable] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [searchQuery, setSearchQuery] = useState('');

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const fetchProviders = () => {
    setLoading(true);
    const params = {};
    if (category)           params.category           = category;
    if (city)               params.city               = city;
    if (verificationStatus) params.verificationStatus = verificationStatus;
    if (minRating)          params.minRating          = minRating;
    if (minExperience)      params.minExperience      = minExperience;
    if (isAvailable)        params.isAvailable        = isAvailable;
    if (sortBy)             params.sortBy             = sortBy;
    if (searchQuery)        params.search             = searchQuery;

    api.getProviders(params)
      .then((res) => setProviders(res.data || []))
      .catch((err) => console.warn('Failed to fetch providers:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProviders(); }, [category, city, verificationStatus, minRating, minExperience, isAvailable, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProviders();
  };

  const handleReset = () => {
    setCategory('');
    setCity('');
    setVerificationStatus('');
    setMinRating('');
    setMinExperience('');
    setIsAvailable('');
    setSortBy('rating');
    setSearchQuery('');
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a' }}>Find Service Professionals</h1>
        <p style={{ color: '#64748b' }}>Browse verified local technicians, compare experience, and request price estimates</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'min(280px, 100%) 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Filter Sidebar */}
        <div className="card" style={{ height: 'fit-content', position: 'sticky', top: '88px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '1.05rem', color: '#0f172a' }}>
              <SlidersHorizontal size={18} color="#2563eb" /> Filters
            </div>
            <button onClick={handleReset} style={{ border: 'none', background: 'none', color: '#2563eb', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}>
              Reset All
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Service Category</label>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="Electrician">Electrician</option>
              <option value="Plumber">Plumber</option>
              <option value="AC Technician">AC Technician</option>
              <option value="Appliance Repair">Appliance Repair</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Painter">Painter</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">City / Region</label>
            <input
              type="text"
              className="form-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Coimbatore, Chennai"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Verification Badge</label>
            <select className="form-select" value={verificationStatus} onChange={(e) => setVerificationStatus(e.target.value)}>
              <option value="">All Providers</option>
              <option value="verified">Verified Only ✓</option>
              <option value="pending">Verification Pending</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Minimum Rating</label>
            <select className="form-select" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
              <option value="">Any Rating</option>
              <option value="4.5">4.5★ & Above (Top Rated)</option>
              <option value="4.0">4.0★ & Above</option>
              <option value="3.5">3.5★ & Above</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Min. Experience</label>
            <select className="form-select" value={minExperience} onChange={(e) => setMinExperience(e.target.value)}>
              <option value="">Any Experience</option>
              <option value="10">10+ Years (Expert)</option>
              <option value="5">5+ Years</option>
              <option value="2">2+ Years</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Availability</label>
            <select className="form-select" value={isAvailable} onChange={(e) => setIsAvailable(e.target.value)}>
              <option value="">All</option>
              <option value="true">Available Now ●</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Sort By</label>
            <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Section */}
        <div>
          {/* Search */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by business name, skill, or specialty..."
            />
            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
              <Search size={16} /> Search
            </button>
          </form>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 1rem auto' }} />
              <p>Searching provider database...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : providers.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
              <Users size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>No providers found</h3>
              <p>No service providers matched your search filters.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Try clearing filters or <Link to="/requests/new">post a service request</Link> to receive custom quotations.</p>
              <button onClick={handleReset} className="btn btn-outline" style={{ marginTop: '1rem' }}>Clear All Filters</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  <strong style={{ color: '#0f172a' }}>{providers.length}</strong> professional{providers.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="grid-2">
                {providers.map((p) => (
                  <ProviderCard key={p._id} provider={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};



