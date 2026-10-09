import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { VerificationBadge } from '../components/VerificationBadge';
import { Briefcase, Send, CheckCircle2, Clock, MapPin, IndianRupee, FileText, AlertCircle } from 'lucide-react';

export const ProviderDashboard = () => {
  const { user, providerProfile } = useAuth();

  const [matchingRequests, setMatchingRequests] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quote Submission Modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [proposedPrice, setProposedPrice] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('1-2 hours');
  const [proposedAppointment, setProposedAppointment] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getProviderRequests(),
      api.getProviderQuotations(),
      api.getBookings(),
    ])
      .then(([reqRes, quoteRes, bookRes]) => {
        setMatchingRequests(reqRes.data || []);
        setQuotations(quoteRes.data || []);
        setBookings(bookRes.data || []);
      })
      .catch((err) => console.warn('Provider dashboard fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openQuoteModal = (reqItem) => {
    setSelectedRequest(reqItem);
    setProposedPrice('');
    setWorkDescription(`Comprehensive inspection and ${reqItem.category} repair service.`);
    const apptDate = reqItem.preferredDate ? new Date(reqItem.preferredDate).toISOString().split('T')[0] : '';
    setProposedAppointment(apptDate);
  };

  const handleSendQuotation = async (e) => {
    e.preventDefault();
    if (!proposedPrice || !workDescription || !proposedAppointment) {
      alert('Please fill out all quotation fields.');
      return;
    }

    setSubmittingQuote(true);
    try {
      const res = await api.createQuotation(selectedRequest._id, {
        proposedPrice: Number(proposedPrice),
        workDescription,
        estimatedDuration,
        proposedAppointment,
      });

      if (res.success) {
        alert('Quotation submitted successfully to customer!');
        setSelectedRequest(null);
        loadData();
      }
    } catch (err) {
      alert(`Error submitting quotation: ${err.message}`);
    } finally {
      setSubmittingQuote(false);
    }
  };

  const completedJobs = bookings.filter((b) => b.status === 'completed');
  const grossEarnings = completedJobs.reduce((sum, b) => sum + (b.agreedPrice || 0), 0);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#ffffff', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>
              {providerProfile?.businessName || user?.name}
            </h1>
            <VerificationBadge status={providerProfile?.verificationStatus} />
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Provider Portal • Categories: {providerProfile?.serviceCategories?.join(', ')}
          </p>
        </div>

        <Link to="/provider/profile-manage" className="btn btn-outline" style={{ color: '#fff', borderColor: '#fff' }}>
          Manage Profile & Documents
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nearby Open Requests</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.2rem' }}>{matchingRequests.length}</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quotations Sent</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0284c7', marginTop: '0.2rem' }}>{quotations.length}</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Confirmed Jobs</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#b45309', marginTop: '0.2rem' }}>
            {bookings.filter((b) => b.status === 'confirmed' || b.status === 'in_progress').length}
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gross Earnings</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--success)', marginTop: '0.2rem' }}>₹{grossEarnings}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading provider dashboard data...</div>
      ) : (
        <div className="grid-2">
          {/* Nearby Customer Requests matching provider categories */}
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '1rem' }}>
              Nearby Customer Service Requests ({matchingRequests.length})
            </h2>

            {matchingRequests.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                <p>No open customer requests in your service categories right now.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {matchingRequests.map((req) => (
                  <div key={req._id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span className="badge badge-open">{req.category}</span>
                      <span className={`badge badge-${req.urgency}`}>{req.urgency} Urgency</span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.4rem' }}>{req.title}</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{req.description}</p>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <span>📍 {req.serviceLocation?.city}, {req.serviceLocation?.locality}</span>
                      <span>📅 {new Date(req.preferredDate).toLocaleDateString()}</span>
                    </div>

                    <button onClick={() => openQuoteModal(req)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                      <Send size={15} /> Send Quotation Estimate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Assigned Jobs */}
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '1rem' }}>
              Your Active & Recent Jobs ({bookings.length})
            </h2>

            {bookings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                <p>No assigned jobs yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.map((b) => (
                  <div key={b._id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                        {b.requestId?.title || b.requestId?.category || 'Assigned Job'}
                      </span>
                      <span className={`badge badge-${b.status}`}>{b.status.replace('_', ' ')}</span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Customer: <strong>{b.customerId?.name}</strong> • Phone: {b.customerId?.phone}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--surface-border)', paddingTop: '0.75rem' }}>
                      <span style={{ fontWeight: '700', color: 'var(--primary)' }}>Agreed: ₹{b.agreedPrice}</span>
                      <Link to={`/bookings/${b._id}`} className="btn btn-outline btn-sm">
                        Manage Job Status
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quote Submission Modal */}
      {selectedRequest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              Submit Quotation for "{selectedRequest.title}"
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Provide an estimated price and brief work explanation for the customer
            </p>

            <form onSubmit={handleSendQuotation}>
              <div className="form-group">
                <label className="form-label">Proposed Total Price (₹)</label>
                <input
                  type="number"
                  required
                  min={50}
                  className="form-input"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  placeholder="e.g. 450"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description of Proposed Work</label>
                <textarea
                  required
                  rows={3}
                  className="form-textarea"
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  placeholder="Detail parts included, inspection steps, or labor breakdown..."
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Est. Duration</label>
                  <input
                    type="text"
                    className="form-input"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="1-2 hours"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Appointment Date</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={proposedAppointment}
                    onChange={(e) => setProposedAppointment(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setSelectedRequest(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submittingQuote} className="btn btn-primary" style={{ flex: 1 }}>
                  {submittingQuote ? 'Submitting...' : 'Send Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
