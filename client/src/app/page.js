'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getReports, getReportStats } from '@/services/api';
import { useSocket } from '@/context/SocketContext';

const features = [
  { icon: '📍', title: 'Geolocation Tagging', desc: 'Auto-detect your location or pin it on the map for precise crime reporting.', color: 'rgba(59,130,246,0.15)' },
  { icon: '🔔', title: 'Real-Time Alerts', desc: 'Get instant notifications when new incidents are reported in your area.', color: 'rgba(239,68,68,0.15)' },
  { icon: '🗺️', title: 'Live Crime Map', desc: 'View all reported incidents on an interactive map with category filters.', color: 'rgba(34,197,94,0.15)' },
  { icon: '🕵️', title: 'Anonymous Mode', desc: 'Report crimes anonymously to protect your identity while helping the community.', color: 'rgba(168,85,247,0.15)' },
  { icon: '📊', title: 'Incident Tracking', desc: 'Track the status of your reports from submission to resolution.', color: 'rgba(249,115,22,0.15)' },
  { icon: '👮', title: 'Authority Dashboard', desc: 'Dedicated panel for authorities to manage and respond to incidents efficiently.', color: 'rgba(6,182,212,0.15)' },
];

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const { socket } = useSocket();

  useEffect(() => {
    getReportStats().then(r => setStats(r.data)).catch(() => {});
    getReports({ limit: 6, sort: '-createdAt' }).then(r => setRecentReports(r.data.reports)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (report) => {
      setRecentReports(prev => [report, ...prev].slice(0, 6));
      setStats(prev => prev ? { ...prev, totalReports: prev.totalReports + 1, pendingReports: prev.pendingReports + 1 } : prev);
    };
    socket.on('newReport', handler);
    return () => socket.off('newReport', handler);
  }, [socket]);

  const formatCategory = (cat) => cat?.replace(/_/g, ' ') || '';

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge"><span className="pulse"></span> Real-Time Monitoring Active</div>
          <h1>Report Crime.<br /><span>Protect Community.</span></h1>
          <p>A civic engagement platform where you can report crimes with geolocation, photos, and videos. Authorities respond in real-time to keep your community safe.</p>
          <div className="hero-buttons">
            <Link href="/report" className="btn btn-primary">🚨 Report an Incident</Link>
            <Link href="/map" className="btn btn-secondary">🗺️ View Live Map</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="page-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📋</div>
            <div className="stat-info"><h3>{stats?.totalReports || 0}</h3><p>Total Reports</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">⏳</div>
            <div className="stat-info"><h3>{stats?.pendingReports || 0}</h3><p>Pending</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">🔍</div>
            <div className="stat-info"><h3>{stats?.investigatingReports || 0}</h3><p>Investigating</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info"><h3>{stats?.resolvedReports || 0}</h3><p>Resolved</p></div>
          </div>
        </div>
      </section>

      {/* Recent Reports */}
      {recentReports.length > 0 && (
        <section className="page-container">
          <div className="page-header">
            <h2 style={{fontSize: '1.6rem', fontWeight: 800}}>Recent Incidents</h2>
            <p style={{color: 'var(--text-secondary)'}}>Latest crime reports from the community</p>
          </div>
          <div className="reports-grid">
            {recentReports.map(report => (
              <Link href={`/reports/${report._id}`} key={report._id} className="report-card">
                <div className="report-card-header">
                  <span className="badge badge-category">{formatCategory(report.category)}</span>
                  <span className={`badge badge-${report.status}`}>{report.status?.replace(/_/g, ' ')}</span>
                </div>
                <div className="report-card-body">
                  <h3>{report.title}</h3>
                  <p>{report.description}</p>
                </div>
                <div className="report-card-footer">
                  <span className="location">📍 {report.location?.address || 'Unknown location'}</span>
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="features-section">
        <h2>Why <span style={{background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>CrimeWatch</span>?</h2>
        <p>Empowering citizens and authorities with cutting-edge tools for community safety.</p>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon" style={{background: f.color}}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
