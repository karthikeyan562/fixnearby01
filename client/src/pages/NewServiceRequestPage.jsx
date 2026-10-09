import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Wrench, Upload, Calendar, MapPin, AlertCircle, CheckCircle, Mic } from 'lucide-react';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';

export const NewServiceRequestPage = () => {
  const { user } = useAuth();
  const { setIsOpen: setVoiceOpen } = useVoiceAssistant();
  const navigate = useNavigate();

  const [category, setCategory] = useState('Electrician');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState(user?.location?.city || 'Coimbatore');
  const [locality, setLocality] = useState(user?.location?.locality || 'RS Puram');
  const [postalCode, setPostalCode] = useState(user?.location?.postalCode || '641002');
  const [address, setAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [urgency, setUrgency] = useState('medium');
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.uploadFile(formData);
      if (res.success) {
        setFileUrl(res.fileUrl);
      }
    } catch (err) {
      alert(`File upload failed: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Please provide a problem title and detailed description.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        category,
        title,
        description,
        photoUrls: fileUrl ? [fileUrl] : [],
        serviceLocation: { city, locality, postalCode, address },
        preferredDate,
        urgency,
      };

      const res = await api.createRequest(payload);
      if (res.success) {
        navigate(`/requests/${res.data._id}/quotations`);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit service request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '720px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', background: 'var(--primary)', color: '#fff', padding: '0.65rem', borderRadius: '14px', marginBottom: '0.5rem' }}>
          <Wrench size={24} />
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)' }}>Create New Service Request</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Describe your repair issue to receive estimates from nearby verified professionals
        </p>

        <button
          type="button"
          onClick={() => setVoiceOpen(true)}
          className="btn btn-outline btn-sm"
          style={{ marginTop: '1rem', borderRadius: '9999px' }}
        >
          <Mic size={16} /> Prefer Speaking? Try FixNearby Voice Helper
        </button>
      </div>

      <div className="card">
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Category */}
          <div className="form-group">
            <label className="form-label">Service Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Electrician">Electrician (Wiring, Switches, Breakers)</option>
              <option value="Plumber">Plumber (Pipes, Taps, Leakage, Motor)</option>
              <option value="AC Technician">AC Technician (Servicing, Gas Refill, Repair)</option>
              <option value="Appliance Repair">Appliance Repair (Washing Machine, Fridge, TV)</option>
              <option value="Carpenter">Carpenter (Furniture, Cabinets, Locks)</option>
              <option value="Painter">Painter (Walls, Waterproofing)</option>
            </select>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Problem Title</label>
            <input
              type="text"
              required
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Main switch board tripping continuously"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Detailed Description of Problem</label>
            <textarea
              required
              rows={4}
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what happened, symptoms, appliances involved, or special requirements..."
            />
          </div>

          {/* Urgency */}
          <div className="form-group">
            <label className="form-label">Urgency Level</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {['low', 'medium', 'high', 'emergency'].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUrgency(u)}
                  className={`btn ${urgency === u ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize', fontSize: '0.82rem', padding: '0.5rem' }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Service Location */}
          <div className="form-group" style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1rem', marginTop: '1rem' }}>
            <label className="form-label">Service Address & Location</label>

            <div className="grid-3" style={{ marginBottom: '0.75rem' }}>
              <input
                type="text"
                required
                className="form-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City (e.g. Coimbatore)"
              />
              <input
                type="text"
                required
                className="form-input"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Locality (e.g. RS Puram)"
              />
              <input
                type="text"
                required
                className="form-input"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Pincode (641002)"
              />
            </div>

            <input
              type="text"
              className="form-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Door No, Street Name, Landmark"
            />
          </div>

          {/* Preferred Date */}
          <div className="form-group">
            <label className="form-label">Preferred Appointment Date</label>
            <input
              type="date"
              required
              className="form-input"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
            />
          </div>

          {/* Optional Photo Upload */}
          <div className="form-group">
            <label className="form-label">Optional Photo Upload (Issue Image)</label>
            <input
              type="file"
              accept="image/*"
              className="form-input"
              onChange={handleFileUpload}
            />
            {fileUrl && (
              <div style={{ color: 'var(--success)', fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: '600' }}>
                ✓ Image attached successfully!
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Submitting Request...' : 'Submit Request & Receive Quotations'}
          </button>
        </form>
      </div>
    </div>
  );
};
