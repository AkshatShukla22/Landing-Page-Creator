// frontend/src/pages/AdminPage.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { fetchAllUsers, removeUser, fetchPendingUsers, approveUser, rejectUser } from '../services/authService';
import styles from '../styles/AdminPage.module.css';

export default function AdminPage() {
  const { user } = useSelector((s) => s.auth);
  const [tab, setTab] = useState('requests'); // 'requests' | 'users'
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const [allRes, pendRes] = await Promise.all([fetchAllUsers(), fetchPendingUsers()]);
      setUsers(allRes.users.filter(u => u.role !== 'admin'));
      setPending(pendRes.users);
    } catch { setError('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await approveUser(id);
      await load();
    } catch { setError('Failed to approve'); }
    finally { setActionId(null); }
  };

  const handleReject = async (id) => {
    setActionId(id);
    try {
      await rejectUser(id);
      await load();
    } catch { setError('Failed to reject'); }
    finally { setActionId(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    setActionId(id);
    try {
      await removeUser(id);
      setUsers(u => u.filter(x => x._id !== id));
    } catch { setError('Failed to delete'); }
    finally { setActionId(null); }
  };

  const regularUsers = users;
  const approved = users.filter(u => u.approvalStatus === 'approved');
  const rejected = users.filter(u => u.approvalStatus === 'rejected');

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">Admin Panel</div>
            <div className="topbar-sub">Manage users and approval requests</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {pending.length > 0 && (
              <span className={styles.pendingBadge}>{pending.length} pending</span>
            )}
            <span className="badge badge-red">
              <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
              Admin Access
            </span>
          </div>
        </div>

        <div className="scroll-area">
          {/* Stats */}
          <div className={styles.statsRow}>
            {[
              { val: pending.length,        label: 'Pending Requests', color: '#f59e0b' },
              { val: approved.length,       label: 'Approved Users',   color: '#10b981' },
              { val: rejected.length,       label: 'Rejected',         color: '#f43f5e' },
              { val: regularUsers.length,   label: 'Total Users',      color: '#a78bfa' },
            ].map(s => (
              <div key={s.label} className="card card-sm" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${tab === 'requests' ? styles.tabActive : ''}`} onClick={() => setTab('requests')}>
              Approval Requests
              {pending.length > 0 && <span className={styles.tabBadge}>{pending.length}</span>}
            </button>
            <button className={`${styles.tab} ${tab === 'users' ? styles.tabActive : ''}`} onClick={() => setTab('users')}>
              All Users
            </button>
          </div>

          {error && <div style={{ color: 'var(--error)', fontSize: 13, marginBottom: 12 }}>{error}</div>}

          {/* Approval Requests Tab */}
          {tab === 'requests' && (
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                  Pending Approval Requests
                </span>
                <button className="btn btn-ghost btn-sm" onClick={load}>↻ Refresh</button>
              </div>

              {loading ? (
                <div className={styles.loader}><div className="spinner spinner-lg" /></div>
              ) : pending.length === 0 ? (
                <div className={styles.empty}>
                  <span style={{ fontSize: 32 }}>✅</span>
                  <span style={{ color: 'var(--text2)', fontWeight: 600 }}>No pending requests</span>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>All users have been reviewed</span>
                </div>
              ) : (
                <div className={styles.requestList}>
                  {pending.map(u => (
                    <div key={u._id} className={styles.requestCard}>
                      <div className={styles.requestLeft}>
                        <div className={styles.avatar}>{u.name?.[0]?.toUpperCase()}</div>
                        <div className={styles.requestInfo}>
                          <span className={styles.requestName}>{u.name}</span>
                          <span className={styles.requestEmail}>{u.email}</span>
                          <span className={styles.requestTime}>
                            Registered {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className={styles.requestActions}>
                        <span className="badge badge-gray">Pending</span>
                        <button
                          className={`btn btn-sm ${styles.approveBtn}`}
                          onClick={() => handleApprove(u._id)}
                          disabled={actionId === u._id}
                        >
                          {actionId === u._id ? <span className="spinner" /> : '✓ Approve'}
                        </button>
                        <button
                          className={`btn btn-sm btn-danger`}
                          onClick={() => handleReject(u._id)}
                          disabled={actionId === u._id}
                        >
                          {actionId === u._id ? <span className="spinner" /> : '✗ Reject'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Users Tab */}
          {tab === 'users' && (
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Registered Users</span>
                <button className="btn btn-ghost btn-sm" onClick={load}>↻ Refresh</button>
              </div>

              {loading ? (
                <div className={styles.loader}><div className="spinner spinner-lg" /></div>
              ) : regularUsers.length === 0 ? (
                <div className={styles.empty}><span>No users yet</span></div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr><th>#</th><th>Name</th><th>Email</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {regularUsers.map((u, i) => (
                        <tr key={u._id}>
                          <td style={{ color: 'var(--muted)', fontSize: 12 }}>{i + 1}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className={styles.avatar}>{u.name?.[0]?.toUpperCase()}</div>
                              <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--text2)' }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: 12.5, color: 'var(--muted)' }}>{u.email}</td>
                          <td>
                            {u.approvalStatus === 'approved' && <span className="badge badge-green">✓ Approved</span>}
                            {u.approvalStatus === 'pending'  && <span className="badge" style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>⏳ Pending</span>}
                            {u.approvalStatus === 'rejected' && <span className="badge badge-red">✗ Rejected</span>}
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                            {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              {u.approvalStatus !== 'approved' && (
                                <button className={`btn btn-sm ${styles.approveBtn}`} onClick={() => handleApprove(u._id)} disabled={actionId === u._id}>
                                  {actionId === u._id ? <span className="spinner" /> : '✓'}
                                </button>
                              )}
                              {u.approvalStatus !== 'rejected' && (
                                <button className="btn btn-sm btn-danger" onClick={() => handleReject(u._id)} disabled={actionId === u._id}>
                                  {actionId === u._id ? <span className="spinner" /> : '✗'}
                                </button>
                              )}
                              <button className="btn btn-icon btn-danger btn-sm" onClick={() => handleDelete(u._id)} disabled={actionId === u._id}>
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}