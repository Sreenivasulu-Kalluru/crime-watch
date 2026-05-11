'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getReports } from '@/services/api';
import { useSocket } from '@/context/SocketContext';
import MapView from '@/components/MapView';

const categoryColors = {
  theft: '#f97316', assault: '#ef4444', vandalism: '#a855f7', fraud: '#eab308',
  drug_activity: '#ec4899', suspicious_activity: '#6366f1', traffic: '#06b6d4',
  murder: '#dc2626', kidnapping: '#b91c1c', cybercrime: '#8b5cf6', other: '#64748b'
};

export default function LiveMapPage() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { socket } = useSocket();
  const router = useRouter();

  useEffect(() => {
    getReports({ limit: 500 }).then(r => setReports(r.data.reports)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (report) => setReports(prev => [report, ...prev]);
    socket.on('newReport', handler);
    return () => socket.off('newReport', handler);
  }, [socket]);

  const filtered = filter ? reports.filter(r => r.category === filter) : reports;

  return (
    <div className="map-container">
      <button className="map-back-btn" onClick={() => router.back()} aria-label="Go back">← Back</button>
      
      <button 
        className="map-toggle-btn" 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle details"
      >
        {isSidebarOpen ? '✕ Close Details' : 'ℹ️ Crime Details'}
      </button>

      <MapView reports={filtered} />
      <div className={`map-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <h3>🗺️ Live Crime Map</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {filtered.length} incidents displayed
        </p>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)} style={{ fontSize: '0.85rem' }}>
            <option value="">All Categories</option>
            {Object.keys(categoryColors).map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <div className="map-legend">
          {Object.entries(categoryColors).map(([cat, color]) => (
            <div className="map-legend-item" key={cat}>
              <div className="map-legend-dot" style={{ background: color }}></div>
              {cat.replace(/_/g, ' ')}
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: '1rem' }}>Recent Reports</h3>
        <div className="live-feed">
          {filtered.slice(0, 10).map(r => (
            <div className="feed-item" key={r._id}>
              <div className="feed-dot" style={{ background: categoryColors[r.category] || '#64748b' }}></div>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{r.title}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {r.location?.address || 'Unknown'} • {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
