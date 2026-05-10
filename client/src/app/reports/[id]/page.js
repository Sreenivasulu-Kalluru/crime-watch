'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getReportById, updateReportStatus } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import MapView from '@/components/MapView';

export default function ReportDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusForm, setStatusForm] = useState({ status: '', note: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getReportById(id).then(r => { setReport(r.data); setStatusForm(f => ({...f, status: r.data.status})); }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data } = await updateReportStatus(id, statusForm);
      setReport(data);
    } catch (err) { console.error(err); }
    finally { setUpdating(false); }
  };

  if (loading) return <div className="spinner-overlay"><div className="spinner"></div></div>;
  if (!report) return <div className="page-container empty-state"><h3>Report not found</h3></div>;

  const coords = report.location?.coordinates;
  const isAdmin = user && (user.role === 'admin' || user.role === 'authority');

  return (
    <div className="page-container report-detail">
      <div className="report-detail-header">
        <h1>{report.title}</h1>
        <div className="report-meta">
          <span className="badge badge-category">{report.category?.replace(/_/g, ' ')}</span>
          <span className={`badge badge-${report.severity}`}>{report.severity}</span>
          <span className={`badge badge-${report.status}`}>{report.status?.replace(/_/g, ' ')}</span>
          {report.isAnonymous && <span className="badge" style={{background:'rgba(168,85,247,0.15)',color:'#a855f7'}}>🕵️ Anonymous</span>}
        </div>
      </div>

      <div className="report-detail-body">
        <div>
          <div className="glass-card" style={{marginBottom: '1.5rem'}}>
            <h3 style={{marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 700}}>📝 Description</h3>
            <p style={{color: 'var(--text-secondary)', lineHeight: 1.8}}>{report.description}</p>
          </div>

          {report.media?.length > 0 && (
            <div className="glass-card" style={{marginBottom: '1.5rem'}}>
              <h3 style={{marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 700}}>📷 Evidence</h3>
              <div className="report-media-grid">
                {report.media.map((m, i) => <img key={i} src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/${m}`} alt={`Evidence ${i + 1}`} />)}
              </div>
            </div>
          )}

          {coords && (
            <div className="glass-card">
              <h3 style={{marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 700}}>📍 Location</h3>
              {report.location?.address && <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'0.75rem'}}>{report.location.address}</p>}
              <div style={{height: 280, borderRadius: 12, overflow: 'hidden'}}>
                <MapView reports={[report]} center={[coords[1], coords[0]]} zoom={15} />
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="glass-card" style={{marginBottom: '1.5rem'}}>
            <h3 style={{marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 700}}>ℹ️ Details</h3>
            <div style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>
              <p><strong>Reported:</strong> {new Date(report.createdAt).toLocaleString()}</p>
              {!report.isAnonymous && report.reporter && <p style={{marginTop:6}}><strong>Reporter:</strong> {report.reporter.name}</p>}
              {report.assignedTo && <p style={{marginTop:6}}><strong>Assigned To:</strong> {report.assignedTo.name}</p>}
            </div>
          </div>

          <div className="glass-card" style={{marginBottom: '1.5rem'}}>
            <h3 style={{marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 700}}>📊 Status Timeline</h3>
            <div className="status-timeline">
              {report.statusHistory?.map((h, i) => (
                <div className="timeline-item" key={i}>
                  <div className="timeline-dot">•</div>
                  <div className="timeline-content">
                    <h4>{h.status?.replace(/_/g, ' ')}</h4>
                    <p>{h.note}</p>
                    <time>{new Date(h.changedAt).toLocaleString()}</time>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="glass-card">
              <h3 style={{marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 700}}>⚙️ Update Status</h3>
              <form onSubmit={handleStatusUpdate}>
                <div className="form-group">
                  <select className="form-control" value={statusForm.status} onChange={e => setStatusForm({...statusForm, status: e.target.value})}>
                    {['pending','under_review','investigating','resolved','dismissed'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <input className="form-control" placeholder="Add a note..." value={statusForm.note} onChange={e => setStatusForm({...statusForm, note: e.target.value})} />
                </div>
                <button className="btn btn-primary btn-sm" disabled={updating}>{updating ? 'Updating...' : 'Update Status'}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
