import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { VerificationBadge } from '../components/VerificationBadge';
import { Briefcase, Upload, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

export const ProviderProfileManagePage = () => {
  const { user, providerProfile, refreshUser } = useAuth();

  const [businessName, setBusinessName] = useState(providerProfile?.businessName || '');
  const [biography, setBiography] = useState(providerProfile?.biography || '');
  const [minPrice, setMinPrice] = useState(providerProfile?.indicativePriceRange?.min || 200);
  const [maxPrice, setMaxPrice] = useState(providerProfile?.indicativePriceRange?.max || 2000);
  const [experienceYears, setExperienceYears] = useState(providerProfile?.experienceYears || 1);
  const [isAvailable, setIsAvailable] = useState(providerProfile?.availability?.isAvailable ?? true);
  const [workingHours, setWorkingHours] = useState(providerProfile?.availability?.workingHours || '09:00 AM - 07:00 PM');

  // Document Upload
  const [docType, setDocType] = useState('Government ID / Business License');
  const [file, setFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (providerProfile) {
      setBusinessName(providerProfile.businessName || '');
      setBiography(providerProfile.biography || '');
      setMinPrice(providerProfile.indicativePriceRange?.min || 200);
      setMaxPrice(providerProfile.indicativePriceRange?.max || 2000);
      setExperienceYears(providerProfile.experienceYears || 1);
      setIsAvailable(providerProfile.availability?.isAvailable ?? true);
      setWorkingHours(providerProfile.availability?.workingHours || '09:00 AM - 07:00 PM');
    }
  }, [providerProfile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await api.updateProviderProfile({
        businessName,
        biography,
        experienceYears,
        indicativePriceRange: { min: Number(minPrice), max: Number(maxPrice) },
      });

      await api.updateAvailability({
        isAvailable,
        workingHours,
      });

      setMessage('Profile and availability settings saved successfully!');
      refreshUser();
    } catch (err) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please choose a document file to upload.');
      return;
    }

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append('verificationDoc', file);
    formData.append('docType', docType);

    try {
      const res = await api.submitVerification(formData);
      if (res.success) {
        alert('Verification document uploaded! Status changed to Pending Review.');
        setFile(null);
        refreshUser();
      }
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploadingDoc(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '780px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)' }}>
          Manage Provider Profile & Verification
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Update your business overview, pricing, working availability, and upload identity credentials
        </p>
      </div>

      {message && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '600' }}>
          ✓ {message}
        </div>
      )}

      {/* Verification Status Banner */}
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
            Current Verification Status:
          </strong>
          <VerificationBadge status={providerProfile?.verificationStatus} />
        </div>

        {providerProfile?.verificationStatus !== 'verified' && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
            Upload government ID or business trade license below to complete verification and receive the Green Verified Badge.
          </p>
        )}
      </div>

      {/* Form: Profile Information */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--secondary)' }}>
          Business Profile Details
        </h3>

        <form onSubmit={handleSaveProfile}>
          <div className="form-group">
            <label className="form-label">Business / Professional Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Biography & Trade Experience</label>
            <textarea
              rows={4}
              className="form-textarea"
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="Describe your trade background, specialized repair skills, warranty guarantees..."
            />
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input
                type="number"
                min={0}
                className="form-input"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Min Indicative Price (₹)</label>
              <input
                type="number"
                min={50}
                className="form-input"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Indicative Price (₹)</label>
              <input
                type="number"
                min={100}
                className="form-input"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1rem', marginTop: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem' }}>Availability & Working Hours</h4>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Availability Toggle</label>
                <select
                  className="form-select"
                  value={isAvailable ? 'true' : 'false'}
                  onChange={(e) => setIsAvailable(e.target.value === 'true')}
                >
                  <option value="true">● Available for New Customer Jobs</option>
                  <option value="false">○ Busy / Temporarily Unavailable</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Working Hours Schedule</label>
                <input
                  type="text"
                  className="form-input"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="09:00 AM - 07:00 PM"
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Form: Upload Verification Document */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
          Submit Verification Documents
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Upload clear photos/PDF of your Government ID (Aadhaar, Voter ID, PAN) or Trade License for admin verification.
        </p>

        <form onSubmit={handleDocSubmit}>
          <div className="form-group">
            <label className="form-label">Document Type</label>
            <select
              className="form-select"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="Government ID / Aadhaar">Government ID / Aadhaar Card</option>
              <option value="Business License / GST">Business License / GST Registration</option>
              <option value="Trade Certification">Trade / Skill Certification</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select File (Image or PDF)</label>
            <input
              type="file"
              required
              accept="image/*,.pdf"
              className="form-input"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <button type="submit" disabled={uploadingDoc} className="btn btn-outline">
            <Upload size={16} /> {uploadingDoc ? 'Uploading...' : 'Submit Document for Review'}
          </button>
        </form>
      </div>
    </div>
  );
};
