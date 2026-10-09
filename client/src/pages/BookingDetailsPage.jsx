import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { VerificationBadge } from '../components/VerificationBadge';
import {
  CheckCircle2, Clock, MapPin, Phone, Star, AlertCircle, XCircle,
  PhoneCall, Car, Wrench, CheckCheck, AlertTriangle, Video, UploadCloud,
} from 'lucide-react';


const STATUS_STEPS = [
  { key: 'confirmed',   label: 'Booking Confirmed', icon: <CheckCircle2 size={18} />, color: '#2563eb' },
  { key: 'on_the_way',  label: 'On the Way',        icon: <Car size={18} />,           color: '#0284c7' },
  { key: 'in_progress', label: 'In Progress',       icon: <Wrench size={18} />,        color: '#b45309' },
  { key: 'completed',   label: 'Job Completed',     icon: <CheckCheck size={18} />,    color: '#059669' },
];

export const BookingDetailsPage = () => {
  const { id } = useParams();
  const { user, isCustomer, isProvider, isAdmin } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const loadBooking = () => {
    setLoading(true);
    api.getBookingById(id)
      .then((res) => setBooking(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBooking(); }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    setStatusUpdating(true);
    try {
      await api.updateBookingStatus(id, newStatus);
      loadBooking();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.cancelBooking(id);
      loadBooking();
    } catch (err) {
      alert(`Cancellation error: ${err.message}`);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.uploadFile(formData);
      if (res.fileUrl) {
        setVideoUrl(res.fileUrl);
      }
    } catch (err) {
      alert(`Video upload failed: ${err.message}`);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setReviewSubmitting(true);
    try {
      await api.createReview(id, {
        rating,
        reviewText,
        videoUrl: videoUrl.trim(),
        serviceCategory: booking?.requestId?.category,
      });
      setReviewSubmitted(true);
    } catch (err) {
      alert(`Review error: ${err.message}`);
    } finally {
      setReviewSubmitting(false);
    }
  };


  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem', gap: '1rem' }}>
      <div style={{ width: '44px', height: '44px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
      <p style={{ color: '#64748b' }}>Loading booking details...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444' }}>Error: {error}</div>;
  if (!booking) return <div style={{ textAlign: 'center', padding: '4rem' }}>Booking record not found.</div>;

  const requestInfo  = booking.requestId || {};
  const customerUser = booking.customerId || {};
  const providerUser = booking.providerId || {};
  const providerProfile = booking.providerProfile || {};

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === booking.status);

  const nextProviderStatuses = {
    confirmed:   ['on_the_way', 'in_progress'],
    on_the_way:  ['in_progress'],
    in_progress: ['completed'],
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '880px' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <span className={`badge badge-${booking.status}`} style={{ fontSize: '0.85rem' }}>
          {booking.status.replace(/_/g, ' ').toUpperCase()}
        </span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', marginTop: '0.4rem' }}>
          Booking Details & Tracking
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Reference: #{booking._id}</p>
      </div>

      {/* ── Timeline Tracker ── */}
      {booking.status !== 'cancelled' ? (
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
            {/* Progress line */}
            <div style={{ position: 'absolute', top: '18px', left: '10%', right: '10%', height: '3px', background: '#e2e8f0', zIndex: 0 }}>
              <div
                style={{
                  height: '100%',
                  width: currentStepIdx < 0 ? '0%' : `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%`,
                  background: 'linear-gradient(90deg, #2563eb, #059669)',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>

            {STATUS_STEPS.map((step, idx) => {
              const isPassed = booking.status === 'completed' ? true : idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step.key} style={{ textAlign: 'center', flex: 1, zIndex: 2, padding: '0 0.25rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: isPassed ? step.color : '#e2e8f0',
                      color: isPassed ? '#fff' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.5rem auto',
                      boxShadow: isCurrent ? `0 0 0 5px ${step.color}30` : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {step.icon}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: isCurrent ? '800' : '500', color: isCurrent ? step.color : '#64748b', display: 'block', lineHeight: '1.3' }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <XCircle size={20} /> This booking has been cancelled.
        </div>
      )}

      {/* ── Info Grid ── */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Service Request Details */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '1rem', color: '#0f172a' }}>Service Request Details</h3>
          <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: '#334155' }}>
            <div><strong>Title:</strong> {requestInfo.title}</div>
            <div><strong>Category:</strong> {requestInfo.category}</div>
            <div><strong>Description:</strong> {requestInfo.description}</div>
            {requestInfo.urgency && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <strong>Urgency:</strong>
                <span className={`badge badge-${requestInfo.urgency === 'high' || requestInfo.urgency === 'emergency' ? 'cancelled' : requestInfo.urgency === 'medium' ? 'booked' : 'open'}`}>
                  {requestInfo.urgency}
                </span>
              </div>
            )}
            <div>
              <strong>Service Location:</strong> {booking.serviceAddress?.address && `${booking.serviceAddress.address}, `}
              {booking.serviceAddress?.locality}, {booking.serviceAddress?.city}
            </div>
            <div>
              <strong>Scheduled Date:</strong> {new Date(booking.scheduledAt).toLocaleDateString('en-IN', { dateStyle: 'full' })}
            </div>
          </div>
        </div>

        {/* Provider / Customer Contact Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '1rem', color: '#0f172a' }}>
            {isCustomer ? 'Provider Information' : 'Customer Information'}
          </h3>

          {isCustomer ? (
            <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: '#334155' }}>
              <div><strong>Business:</strong> {providerProfile.businessName || providerUser.name}</div>
              <div><VerificationBadge status={providerProfile.verificationStatus} /></div>
              <div><strong>Technician:</strong> {providerUser.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>Contact:</strong>
                {providerUser.phone ? (
                  <a
                    href={`tel:${providerUser.phone}`}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <PhoneCall size={14} /> Call Provider
                  </a>
                ) : (
                  <span style={{ color: '#64748b', fontStyle: 'italic' }}>Available after confirmation</span>
                )}
              </div>
              {providerUser.phone && (
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                  📱 Opens your phone app on mobile. On desktop, copy: {providerUser.phone}
                </p>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: '#334155' }}>
              <div><strong>Customer Name:</strong> {customerUser.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>Contact:</strong>
                {customerUser.phone ? (
                  <a
                    href={`tel:${customerUser.phone}`}
                    className="btn btn-success btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <PhoneCall size={14} /> Call Customer
                  </a>
                ) : (
                  <span style={{ color: '#64748b', fontStyle: 'italic' }}>Not provided</span>
                )}
              </div>
              {customerUser.phone && (
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                  📱 Opens your phone app on mobile. Number: {customerUser.phone}
                </p>
              )}
              <div><strong>Preferred Area:</strong> {customerUser.location?.city}</div>
            </div>
          )}

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '700', color: '#0f172a' }}>Agreed Job Price</span>
            <span style={{ fontSize: '1.45rem', fontWeight: '900', color: '#2563eb' }}>₹{booking.agreedPrice}</span>
          </div>
        </div>
      </div>

      {/* ── Provider Status Update Controls ── */}
      {(isProvider || isAdmin) && booking.status !== 'completed' && booking.status !== 'cancelled' && (
        <div className="card" style={{ marginBottom: '2rem', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '0.75rem', color: '#0369a1' }}>
            Update Job Progress Status
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
            {(nextProviderStatuses[booking.status] || []).map((nextStatus) => {
              const step = STATUS_STEPS.find((s) => s.key === nextStatus);
              const colorMap = { on_the_way: 'btn-secondary', in_progress: 'btn-primary', completed: 'btn-success' };
              return (
                <button
                  key={nextStatus}
                  onClick={() => handleUpdateStatus(nextStatus)}
                  disabled={statusUpdating}
                  className={`btn ${colorMap[nextStatus] || 'btn-primary'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {step?.icon} Mark as "{step?.label}"
                </button>
              );
            })}
            <button
              onClick={handleCancelBooking}
              className="btn btn-danger btn-sm"
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <XCircle size={15} /> Cancel Booking
            </button>
          </div>

          {/* Status history log */}
          {booking.statusHistory && booking.statusHistory.length > 0 && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid #bae6fd', paddingTop: '0.75rem' }}>
              <p style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0369a1', marginBottom: '0.4rem' }}>Status History:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {booking.statusHistory.map((h, i) => (
                  <span key={i} style={{ background: '#e0f2fe', color: '#0c4a6e', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                    {h.status.replace(/_/g, ' ')} — {new Date(h.updatedAt).toLocaleTimeString()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Customer Cancel Control ── */}
      {isCustomer && booking.status === 'confirmed' && (
        <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
          <button onClick={handleCancelBooking} className="btn btn-danger btn-sm">
            <XCircle size={15} /> Cancel This Booking
          </button>
        </div>
      )}

      {/* ── Review Form ── */}
      {isCustomer && booking.status === 'completed' && (
        <div className="card" style={{ border: '2px solid #2563eb' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '0.4rem', color: '#0f172a' }}>
            Leave Feedback & Review Provider
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
            How was your experience with {providerProfile.businessName || providerUser.name}?
          </p>

          {reviewSubmitted ? (
            <div style={{ background: '#dcfce7', color: '#15803d', padding: '1rem', borderRadius: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCheck size={20} /> Thank you! Your review has been recorded successfully.
            </div>
          ) : (
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label className="form-label">Rating (1–5 Stars)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRating(r)}
                      style={{
                        width: '42px', height: '42px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: r <= rating ? '#fef3c7' : '#f1f5f9',
                        fontSize: '1.3rem', transition: 'all 0.2s ease',
                        transform: r <= rating ? 'scale(1.15)' : 'scale(1)',
                      }}
                    >
                      {r <= rating ? '⭐' : '☆'}
                    </button>
                  ))}
                  <span style={{ alignSelf: 'center', fontSize: '0.9rem', color: '#64748b', marginLeft: '0.5rem' }}>
                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Review Feedback</label>
                <textarea
                  required
                  rows={3}
                  className="form-textarea"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details about punctuality, work quality, and professionalism..."
                />
              </div>

              {/* Optional Customer Satisfaction Video Review */}
              <div className="form-group" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e293b', fontWeight: '700' }}>
                  <Video size={16} color="#2563eb" /> Customer Satisfaction Video Review (Optional)
                </label>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  Inspire other homeowners by uploading a short video clip showing the completed work or sharing your quick thoughts.
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <label
                    className="btn btn-outline btn-sm"
                    style={{ cursor: uploadingVideo ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <UploadCloud size={16} />
                    {uploadingVideo ? 'Uploading Video...' : 'Upload Video Clip (MP4/WebM)'}
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      style={{ display: 'none' }}
                      onChange={handleVideoUpload}
                      disabled={uploadingVideo}
                    />
                  </label>

                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>or paste video link:</span>

                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://... (video link)"
                    style={{ flex: 1, minWidth: '200px', fontSize: '0.85rem' }}
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>

                {videoUrl && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontSize: '0.8rem', fontWeight: '600' }}>
                    <CheckCheck size={14} /> Video attached: {videoUrl.slice(0, 45)}...
                  </div>
                )}
              </div>

              <button type="submit" disabled={reviewSubmitting || uploadingVideo} className="btn btn-primary">
                {reviewSubmitting ? 'Submitting Review...' : 'Submit Review'}
              </button>

            </form>
          )}
        </div>
      )}
    </div>
  );
};
