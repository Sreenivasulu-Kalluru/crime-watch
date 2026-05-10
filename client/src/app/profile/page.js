'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getReports } from '@/services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchMyReports();
    }
  }, [user]);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const res = await getReports({ reporter: user._id, limit: 100 });
      setReports(res.data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <div className="spinner-overlay"><div className="spinner"></div></div>;
  if (!user) return null;

  return (
    <div className="page-container">
      <div className="page-header" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="nav-avatar" style={{ width: '60px', height: '60px', fontSize: '1.8rem', cursor: 'default' }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1>{user.name}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{user.email} • <span style={{ textTransform: 'capitalize' }}>{user.role}</span></p>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Reports</h2>
      
      {reports.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You haven't submitted any reports yet.</p>
          <Link href="/report" className="btn btn-primary">+ Report an Incident</Link>
        </div>
      ) : (
        <div className="reports-grid">
          {reports.map((report) => (
            <Link href={`/reports/${report._id}`} key={report._id} className="report-card">
              <div className="report-card-header">
                <span className="badge badge-category">{report.category?.replace(/_/g, ' ')}</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <span className={`badge badge-${report.severity}`}>{report.severity}</span>
                  <span className={`badge badge-${report.status}`}>{report.status?.replace(/_/g, ' ')}</span>
                </div>
              </div>
              
              <div className="report-card-body">
                <h3>{report.title}</h3>
                <p>{report.description}</p>
              </div>
              
              <div className="report-card-footer">
                <div className="location" style={{ maxWidth: '70%' }}>
                  <span style={{ fontSize: '1.1rem' }}>📍</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {report.location?.address || 'Unknown location'}
                  </span>
                </div>
                <div>{new Date(report.createdAt).toLocaleDateString()}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
