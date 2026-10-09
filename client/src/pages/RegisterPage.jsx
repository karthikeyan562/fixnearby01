import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, UserPlus, User, Briefcase } from 'lucide-react';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'provider' ? 'provider' : 'customer';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Coimbatore');
  const [locality, setLocality] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Provider specific fields
  const [businessName, setBusinessName] = useState('');
  const [serviceCategories, setServiceCategories] = useState(['Electrician']);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleCategoryToggle = (cat) => {
    if (serviceCategories.includes(cat)) {
      if (serviceCategories.length > 1) {
        setServiceCategories(serviceCategories.filter((c) => c !== cat));
      }
    } else {
      setServiceCategories([...serviceCategories, cat]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        phone,
        location: { city, locality, postalCode },
        ...(role === 'provider' && { businessName, serviceCategories }),
      };

      const res = await register(payload);
      if (res.success) {
        if (role === 'provider') navigate('/provider/dashboard');
        else navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const availableCategories = [
    'Electrician',
    'Plumber',
    'AC Technician',
    'Appliance Repair',
    'Carpenter',
    'Painter',
  ];

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', background: 'var(--primary)', color: '#fff', padding: '0.65rem', borderRadius: '14px', marginBottom: '0.5rem' }}>
            <Wrench size={26} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--secondary)' }}>Create FixNearby Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join as a Customer or verified Service Provider</p>
        </div>

        {/* Role Switcher Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`btn ${role === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <User size={16} /> I need Services (Customer)
          </button>
          <button
            type="button"
            onClick={() => setRole('provider')}
            className={`btn ${role === 'provider' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <Briefcase size={16} /> I am a Professional (Provider)
          </button>
        </div>

        <div className="card">
          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ramesh Kumar"
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98421 00000"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Coimbatore"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Locality / Area</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="RS Puram"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="641002"
                />
              </div>
            </div>

            {/* Provider Extra Fields */}
            {role === 'provider' && (
              <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Business / Trade Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Suresh Electrical Works"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Select Service Categories Offered</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {availableCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryToggle(cat)}
                        className={`badge ${serviceCategories.includes(cat) ? 'badge-verified' : 'badge-unverified'}`}
                        style={{ cursor: 'pointer', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
                      >
                        {serviceCategories.includes(cat) ? '✓ ' : '+ '} {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              <UserPlus size={18} /> {loading ? 'Registering Account...' : 'Complete Registration'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: '700', color: 'var(--primary)' }}>
              Log In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
