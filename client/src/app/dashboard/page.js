'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getReportStats, getReports, updateReportStatus } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== 'admin' && user.role !== 'authority')) { router.push('/login'); return; }
    Promise.all([
      getReportStats().then(r => setStats(r.data)),
      getReports({ limit: 20, sort: '-createdAt' }).then(r => setReports(r.data.reports))
    ]).finally(() => setLoading(false));
  }, [user, authLoading]);

  const handleQuickStatus = async (id, status) => {
    try {
      await updateReportStatus(id, { status, note: `Quick update to ${status}` });
      setReports(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="spinner-overlay"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📊 Dashboard</h1>
        <p>Overview of crime reports and incident management</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue">📋</div><div className="stat-info"><h3>{stats?.totalReports || 0}</h3><p>Total Reports</p></div></div>
        <div className="stat-card"><div className="stat-icon orange">⏳</div><div className="stat-info"><h3>{stats?.pendingReports || 0}</h3><p>Pending</p></div></div>
        <div className="stat-card"><div className="stat-icon purple">🔍</div><div className="stat-info"><h3>{stats?.investigatingReports || 0}</h3><p>Investigating</p></div></div>
        <div className="stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><h3>{stats?.resolvedReports || 0}</h3><p>Resolved</p></div></div>
      </div>

      <div className="dashboard-grid" style={{marginTop: '2rem'}}>
        {/* Category Breakdown */}
        <div className="glass-card">
          <h3 style={{marginBottom: '1rem', fontWeight: 700}}>📊 Category Breakdown</h3>
          {stats?.categoryStats?.map(c => (
            <div key={c._id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border-glass)'}}>
              <span style={{fontSize:'0.9rem', textTransform:'capitalize'}}>{c._id?.replace(/_/g,' ')}</span>
              <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                <div style={{width: Math.min(c.count * 20, 150), height: 8, borderRadius: 4, background:'var(--gradient-primary)'}}></div>
                <span style={{fontSize:'0.85rem', fontWeight:600, minWidth:24}}>{c.count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Daily Trend */}
        <div className="glass-card">
          <h3 style={{marginBottom: '1rem', fontWeight: 700}}>📈 Last 7 Days</h3>
          {stats?.dailyStats?.length > 0 ? stats.dailyStats.map(d => (
            <div key={d._id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border-glass)'}}>
              <span style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>{d._id}</span>
              <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                <div style={{width: Math.min(d.count * 30, 120), height: 8, borderRadius: 4, background:'var(--gradient-danger)'}}></div>
                <span style={{fontSize:'0.85rem', fontWeight:600}}>{d.count}</span>
              </div>
            </div>
          )) : <p style={{color:'var(--text-muted)', fontSize:'0.85rem'}}>No data for the last 7 days</p>}
        </div>
      </div>

      {/* Reports Table */}
      <div className="glass-card dashboard-full" style={{marginTop: '1.5rem'}}>
        <h3 style={{marginBottom: '1rem', fontWeight: 700}}>📋 All Reports</h3>
        <div className="table-container">
          <table>
            <thead><tr><th>Title</th><th>Category</th><th>Severity</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {reports.map(r => (
                <tr key={r._id}>
                  <td><Link href={`/reports/${r._id}`} style={{color:'var(--accent-blue)', fontWeight:500}}>{r.title}</Link></td>
                  <td><span className="badge badge-category">{r.category?.replace(/_/g,' ')}</span></td>
                  <td><span className={`badge badge-${r.severity}`}>{r.severity}</span></td>
                  <td><span className={`badge badge-${r.status}`}>{r.status?.replace(/_/g,' ')}</span></td>
                  <td style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{display:'flex', gap:4}}>
                      {r.status === 'pending' && <button className="btn btn-sm btn-secondary" onClick={() => handleQuickStatus(r._id, 'under_review')}>Review</button>}
                      {r.status === 'under_review' && <button className="btn btn-sm btn-secondary" onClick={() => handleQuickStatus(r._id, 'investigating')}>Investigate</button>}
                      {r.status === 'investigating' && <button className="btn btn-sm btn-success" onClick={() => handleQuickStatus(r._id, 'resolved')}>Resolve</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
