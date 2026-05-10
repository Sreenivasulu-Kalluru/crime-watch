'use client';
import { useEffect, useState } from 'react';
import { getUsers, updateUserRole, deleteUser } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, userId: null });

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    getUsers().then(r => setUsers(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [user, authLoading]);

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRole(id, role);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteModal.userId);
      setUsers(prev => prev.filter(u => u._id !== deleteModal.userId));
      setDeleteModal({ open: false, userId: null });
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="spinner-overlay"><div className="spinner"></div></div>;

  const roleColors = { citizen: 'var(--accent-blue)', authority: 'var(--accent-orange)', admin: 'var(--accent-red)' };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👑 Admin Panel</h1>
        <p>Manage users and system settings</p>
      </div>

      <div className="stats-grid" style={{marginBottom: '2rem'}}>
        <div className="stat-card"><div className="stat-icon blue">👥</div><div className="stat-info"><h3>{users.length}</h3><p>Total Users</p></div></div>
        <div className="stat-card"><div className="stat-icon green">🧑</div><div className="stat-info"><h3>{users.filter(u=>u.role==='citizen').length}</h3><p>Citizens</p></div></div>
        <div className="stat-card"><div className="stat-icon orange">👮</div><div className="stat-info"><h3>{users.filter(u=>u.role==='authority').length}</h3><p>Authorities</p></div></div>
        <div className="stat-card"><div className="stat-icon red">👑</div><div className="stat-info"><h3>{users.filter(u=>u.role==='admin').length}</h3><p>Admins</p></div></div>
      </div>

      <div className="glass-card">
        <h3 style={{marginBottom: '1rem', fontWeight: 700}}>👥 User Management</h3>
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{fontWeight: 500}}>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div style={{width:32, height:32, borderRadius:'50%', background:'var(--gradient-primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'0.8rem', fontWeight:700}}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{color:'var(--text-secondary)', fontSize:'0.85rem'}}>{u.email}</td>
                  <td>
                    <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} style={{
                      padding:'4px 8px', borderRadius:6, border:'1px solid var(--border-glass)',
                      background:'var(--bg-glass)', color: roleColors[u.role], fontSize:'0.8rem', fontWeight:600
                    }}>
                      <option value="citizen">Citizen</option>
                      <option value="authority">Authority</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u._id !== user._id && (
                      <button className="btn btn-sm btn-danger" onClick={() => setDeleteModal({ open: true, userId: u._id })}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, userId: null })}
      />
    </div>
  );
}
