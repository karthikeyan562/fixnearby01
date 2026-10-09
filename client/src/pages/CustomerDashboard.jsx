import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';
import { PlusCircle, Mic, Clock, CheckCircle2, ArrowRight, FileText, Calendar, MapPin } from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const { setIsOpen: setVoiceOpen } = useVoiceAssistant();

  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getRequests(), api.getBookings()])
      .then(([reqRes, bookRes]) => {
        setRequests(reqRes.data || []);
        setBookings(bookRes.data || []);
      })
      .catch((err) => console.warn('Dashboard fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const activeRequests = requests.filter((r) => r.status === 'open' || r.status === 'quoted');
  const activeBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'in_progress');
  const pastBookings = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)', color: '#ffffff', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.4rem' }}>
            Hello, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#bfdbfe', fontSize: '0.95rem' }}>
            Manage your service requests, compare provider quotations, and track active bookings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => setVoiceOpen(true)} className="btn btn-secondary btn-md" style={{ background: '#ffffff', color: 'var(--primary)' }}>
            <Mic size={18} /> Use Voice Helper
          </button>
          <Link to="/requests/new" className="btn btn-success btn-md">
            <PlusCircle size={18} /> Post New Request
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading your dashboard...</div>
      ) : (
        <div className="grid-2">
          {/* Active Service Requests Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--secondary)' }}>
                Active Service Requests ({activeRequests.length})
              </h2>
              <Link to="/requests/new" style={{ fontSize: '0.88rem', fontWeight: '700' }}>
                + New Request
              </Link>
            </div>

            {activeRequests.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                <p>No active service requests right now.</p>
                <Link to="/requests/new" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                  Create Your First Service Request
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeRequests.map((req) => (
                  <div key={req._id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span className="badge badge-verified" style={{ background: '#eff6ff', color: 'var(--primary)', border: '1px solid #bfdbfe' }}>
                        {req.category}
                      </span>
                      <span className={`badge badge-${req.status}`}>{req.status}</span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.4rem' }}>{req.title}</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>{req.description}</p>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <MapPin size={14} /> {req.serviceLocation?.city}, {req.serviceLocation?.locality}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Calendar size={14} /> {new Date(req.preferredDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Link to={`/requests/${req._id}/quotations`} className="btn btn-primary btn-sm">
                        <FileText size={15} /> Compare Received Quotes <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookings Section */}
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '1rem' }}>
              Upcoming & Active Appointments ({activeBookings.length})
            </h2>

            {activeBookings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                <p>No active bookings currently scheduled.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeBookings.map((b) => (
                  <div key={b._id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                        {b.requestId?.title || b.requestId?.category || 'Service Booking'}
                      </span>
                      <span className={`badge badge-${b.status}`}>{b.status.replace('_', ' ')}</span>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Provider: <strong>{b.providerProfile?.businessName || b.providerId?.name}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--surface-border)', paddingTop: '0.75rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--primary)' }}>₹{b.agreedPrice}</span>
                      <Link to={`/bookings/${b._id}`} className="btn btn-outline btn-sm">
                        Track Booking
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Past Completed Bookings */}
            {pastBookings.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--secondary)', marginBottom: '0.75rem' }}>
                  Booking History ({pastBookings.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {pastBookings.map((b) => (
                    <div key={b._id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{b.requestId?.title || 'Completed Job'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{b.agreedPrice} • {new Date(b.updatedAt).toLocaleDateString()}</div>
                      </div>
                      <Link to={`/bookings/${b._id}`} className="btn btn-secondary btn-sm">
                        Details & Review
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
