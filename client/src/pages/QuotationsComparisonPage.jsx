import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { VerificationBadge } from '../components/VerificationBadge';
import { FileText, CheckCircle, Clock, Star, IndianRupee, ShieldCheck, MapPin } from 'lucide-react';

export const QuotationsComparisonPage = () => {
  const { id } = useParams();
  const [requestItem, setRequestItem] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  const navigate = useNavigate();

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getRequestById(id), api.getQuotationsForRequest(id)])
      .then(([reqRes, quoteRes]) => {
        setRequestItem(reqRes.data);
        setQuotations(quoteRes.data || []);
      })
      .catch((err) => console.warn('Failed to load request quotations:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAcceptQuotation = async (quotationId) => {
    if (!window.confirm('Are you sure you want to accept this quotation? This will confirm your booking with this provider.')) return;

    setAcceptingId(quotationId);
    try {
      const res = await api.acceptQuotation(quotationId);
      if (res.success) {
        alert('Quotation accepted! Booking confirmed.');
        navigate(`/bookings/${res.booking._id}`);
      }
    } catch (err) {
      alert(`Acceptance error: ${err.message}`);
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading received quotations...</div>;
  if (!requestItem) return <div style={{ textAlign: 'center', padding: '4rem' }}>Request not found.</div>;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Request Details Banner */}
      <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span className="badge badge-open" style={{ marginBottom: '0.4rem' }}>{requestItem.category}</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--secondary)' }}>{requestItem.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{requestItem.description}</p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className={`badge badge-${requestItem.status}`}>{requestItem.status}</span>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              📍 {requestItem.serviceLocation?.city}, {requestItem.serviceLocation?.locality}
            </div>
          </div>
        </div>
      </div>

      {/* Quotations List */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '1.25rem' }}>
        Received Quotations ({quotations.length})
      </h2>

      {quotations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <h3>No quotations received yet for this request.</h3>
          <p style={{ marginTop: '0.5rem' }}>Nearby verified providers have been notified. Check back shortly!</p>
        </div>
      ) : (
        <div className="grid-2">
          {quotations.map((q) => {
            const providerUser = q.providerId || {};
            const profile = q.providerProfile || {};
            const isAccepted = q.status === 'accepted';
            const isRejected = q.status === 'rejected';

            return (
              <div
                key={q._id}
                className="card"
                style={{
                  border: isAccepted ? '2px solid var(--success)' : '1px solid var(--surface-border)',
                  background: isAccepted ? '#f0fdf4' : '#ffffff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{profile.businessName || providerUser.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{providerUser.name}</p>
                  </div>
                  <VerificationBadge status={profile.verificationStatus} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#d97706', fontWeight: '700' }}>
                    <Star size={15} fill="#f59e0b" color="#f59e0b" />
                    <span>{profile.averageRating ? profile.averageRating.toFixed(1) : 'New'}</span>
                  </div>
                  <span>• {profile.experienceYears || 1} yrs exp</span>
                </div>

                {/* Proposal Box */}
                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Proposed Estimate</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>₹{q.proposedPrice}</span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    <strong>Work Plan:</strong> {q.workDescription}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <strong>Duration:</strong> {q.estimatedDuration}
                  </p>
                </div>

                {/* Status / Action */}
                {requestItem.status === 'booked' || requestItem.status === 'completed' ? (
                  <div style={{ textAlign: 'center', padding: '0.5rem', fontWeight: '700', color: isAccepted ? 'var(--success)' : 'var(--text-muted)' }}>
                    {isAccepted ? '✓ Accepted Quotation' : 'Offer Expired'}
                  </div>
                ) : (
                  <button
                    onClick={() => handleAcceptQuotation(q._id)}
                    disabled={acceptingId === q._id}
                    className="btn btn-success"
                    style={{ width: '100%' }}
                  >
                    <CheckCircle size={18} /> {acceptingId === q._id ? 'Accepting Quote...' : 'Accept Quote & Confirm Booking'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
