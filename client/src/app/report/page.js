'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createReport } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import MapView from '@/components/MapView';

const categories = [
  { value: 'theft', label: '🔓 Theft' }, { value: 'assault', label: '👊 Assault' },
  { value: 'vandalism', label: '🔨 Vandalism' }, { value: 'fraud', label: '💳 Fraud' },
  { value: 'drug_activity', label: '💊 Drug Activity' }, { value: 'suspicious_activity', label: '👁️ Suspicious Activity' },
  { value: 'traffic', label: '🚗 Traffic Incident' }, { value: 'murder', label: '🔪 Murder' },
  { value: 'kidnapping', label: '🚨 Kidnapping' }, { value: 'cybercrime', label: '💻 Cybercrime' },
  { value: 'other', label: '📝 Other' }
];

export default function ReportCrimePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '', category: '', severity: 'medium', latitude: '', longitude: '', address: '', isAnonymous: false });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toString();
        const lng = pos.coords.longitude.toString();
        setForm(f => ({ ...f, latitude: lat, longitude: lng }));
        // Reverse geocode to get address
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
          const data = await res.json();
          if (data.display_name) {
            setForm(f => ({ ...f, address: data.display_name }));
          }
        } catch {}
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) {
          setError('Location access denied. Please allow location permission in your browser or enter coordinates manually.');
        } else if (err.code === 2) {
          setError('Location unavailable. Please enter coordinates manually.');
        } else {
          setError('Location request timed out. Please try again or enter manually.');
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  };

  useEffect(() => { detectLocation(); }, []);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).slice(0, 5);
    setFiles(selected);
    setPreviews(selected.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      files.forEach(f => formData.append('media', f));
      await createReport(formData);
      setSuccess('Report submitted successfully!');
      setTimeout(() => router.push('/reports'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <h1>🚨 Report a Crime</h1>
        <p>Help keep your community safe by reporting incidents</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2rem' }}>
        <div className="form-group">
          <label>Incident Title *</label>
          <input className="form-control" placeholder="Brief title of the incident" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Severity</label>
            <select className="form-control" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 High</option>
              <option value="critical">🔴 Critical</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea className="form-control" placeholder="Describe the incident in detail..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Latitude *</label>
            <input className="form-control" type="number" step="any" placeholder="e.g. 17.3850" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Longitude *</label>
            <input className="form-control" type="number" step="any" placeholder="e.g. 78.4867" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} required />
          </div>
        </div>
        <button type="button" onClick={detectLocation} className="btn btn-sm btn-secondary" style={{ marginBottom: '1rem' }} disabled={geoLoading}>
          {geoLoading ? '📡 Detecting...' : '📍 Auto-detect My Location'}
        </button>

        <div className="form-group">
          <label>Address / Landmark</label>
          <input className="form-control" placeholder="Nearby landmark or street address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
        </div>

        {form.latitude && form.longitude && (
          <div style={{ height: 250, borderRadius: 12, overflow: 'hidden', marginBottom: '1.25rem', border: '1px solid var(--border-glass)' }}>
            <MapView reports={[{ _id: 'preview', title: 'Report Location', description: 'Your selected location', category: form.category || 'other', status: 'pending', location: { coordinates: [parseFloat(form.longitude), parseFloat(form.latitude)] } }]} center={[parseFloat(form.latitude), parseFloat(form.longitude)]} zoom={14} />
          </div>
        )}

        <div className="form-group">
          <label>Upload Photos / Videos (max 5)</label>
          <div className="file-input-wrapper">
            <label className="file-input-label" htmlFor="media-upload">
              <span className="icon">📷</span>
              <p>Click to upload or drag and drop</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPEG, PNG, GIF, MP4, WebM (max 50MB each)</p>
            </label>
            <input id="media-upload" type="file" multiple accept="image/*,video/*" onChange={handleFiles} />
          </div>
          {previews.length > 0 && (
            <div className="file-preview">
              {previews.map((src, i) => <div key={i} className="file-preview-item"><img src={src} alt={`Preview ${i + 1}`} /></div>)}
            </div>
          )}
        </div>

        <label className="form-check" style={{ marginBottom: '1.5rem' }}>
          <input type="checkbox" checked={form.isAnonymous} onChange={e => setForm({ ...form, isAnonymous: e.target.checked })} />
          🕵️ Submit anonymously (your identity won&apos;t be revealed)
        </label>

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
          {loading ? 'Submitting...' : '🚨 Submit Report'}
        </button>
      </form>
    </div>
  );
}
