'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getReports } from '@/services/api';
import { useSocket } from '@/context/SocketContext';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', status: '', severity: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { socket } = useSocket();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const { data } = await getReports(params);
      setReports(data.reports);
      setTotalPages(data.pages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, [page, filters]);

  useEffect(() => {
    if (!socket) return;
    const handler = (report) => setReports(prev => [report, ...prev].slice(0, 12));
    socket.on('newReport', handler);
    return () => socket.off('newReport', handler);
  }, [socket]);

  const formatCategory = (cat) => cat?.replace(/_/g, ' ') || '';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📋 Crime Reports</h1>
        <p>Browse all reported incidents in the community</p>
      </div>

      <div className="filters-bar">
        <select value={filters.category} onChange={e => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}>
          <option value="">All Categories</option>
          {['theft','assault','vandalism','fraud','drug_activity','suspicious_activity','traffic','murder','kidnapping','cybercrime','other'].map(c =>
            <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
          )}
        </select>
        <select value={filters.status} onChange={e => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}>
          <option value="">All Status</option>
          {['pending','under_review','investigating','resolved','dismissed'].map(s =>
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          )}
        </select>
        <select value={filters.severity} onChange={e => { setFilters({ ...filters, severity: e.target.value }); setPage(1); }}>
          <option value="">All Severity</option>
          {['low','medium','high','critical'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="spinner-overlay"><div className="spinner"></div></div>
      ) : reports.length === 0 ? (
        <div className="empty-state"><div className="icon">📭</div><h3>No reports found</h3><p>Try adjusting your filters or check back later.</p></div>
      ) : (
        <>
          <div className="reports-grid">
            {reports.map(report => (
              <Link href={`/reports/${report._id}`} key={report._id} className="report-card">
                <div className="report-card-header">
                  <span className="badge badge-category">{formatCategory(report.category)}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className={`badge badge-${report.severity}`}>{report.severity}</span>
                    <span className={`badge badge-${report.status}`}>{report.status?.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <div className="report-card-body">
                  <h3>{report.title}</h3>
                  <p>{report.description}</p>
                </div>
                <div className="report-card-footer">
                  <span className="location">📍 {report.location?.address || 'Unknown'}</span>
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '2rem' }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} onClick={() => setPage(i + 1)} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-secondary'}`}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
