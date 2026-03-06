// frontend/src/pages/AdminPage.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { fetchAllUsers, removeUser, fetchPendingUsers, approveUser, rejectUser } from '../services/authService';
import '../styles/AdminPage.css';

export default function AdminPage() {
  const { sidebarCollapsed } = useSelector((s) => s.ui);

  const [tab,      setTab]      = useState('requests');
  const [users,    setUsers]    = useState([]);
  const [pending,  setPending]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error,    setError]    = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [allRes, pendRes] = await Promise.all([fetchAllUsers(), fetchPendingUsers()]);
      setUsers(allRes.users.filter(u => u.role !== 'admin'));
      setPending(pendRes.users);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    setActionId(id);
    try { await approveUser(id); await load(); }
    catch { setError('Failed to approve'); }
    finally { setActionId(null); }
  };

  const handleReject = async (id) => {
    setActionId(id);
    try { await rejectUser(id); await load(); }
    catch { setError('Failed to reject'); }
    finally { setActionId(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    setActionId(id);
    try { await removeUser(id); setUsers(u => u.filter(x => x._id !== id)); }
    catch { setError('Failed to delete'); }
    finally { setActionId(null); }
  };

  const approved = users.filter(u => u.approvalStatus === 'approved');
  const rejected = users.filter(u => u.approvalStatus === 'rejected');

  const marginLeft = sidebarCollapsed ? 'var(--sb-collapsed, 64px)' : 'var(--sb-width, 220px)';

  const stats = [
    { val: pending.length, label: 'Pending Requests', accent: '#f59e0b' },
    { val: approved.length, label: 'Approved Users',  accent: '#10b981' },
    { val: rejected.length, label: 'Rejected',         accent: '#ff4d6d' },
    { val: users.length,    label: 'Total Users',       accent: '#a78bfa' },
  ];

  return (
    <div className="admin-shell">
      <Sidebar />

      <div className="admin-main" style={{ marginLeft }}>

        {/* ── Topbar ── */}
        <div className="admin-topbar">
          <div>
            <div className="admin-page-label">Restricted Access</div>
            <div className="admin-page-title">Admin Panel</div>
          </div>
          <div className="admin-topbar-right">
            {pending.length > 0 && (
              <span className="pending-pill">
                <i className="fa-solid fa-clock" />
                {pending.length} pending
              </span>
            )}
            <span className="admin-access-badge">
              <i className="fa-solid fa-shield-halved" />
              Admin Access
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="admin-body">

          {/* Stats */}
          <div className="admin-stats">
            {stats.map((s) => (
              <div key={s.label} className="admin-stat" style={{ '--accent': s.accent }}>
                <div className="admin-stat-val">{s.val}</div>
                <div className="admin-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="admin-tabs">
            <button
              className={`admin-tab${tab === 'requests' ? ' admin-tab-active' : ''}`}
              onClick={() => setTab('requests')}
            >
              <i className="fa-solid fa-user-clock" />
              Approval Requests
              {pending.length > 0 && (
                <span className="admin-tab-badge">{pending.length}</span>
              )}
            </button>
            <button
              className={`admin-tab${tab === 'users' ? ' admin-tab-active' : ''}`}
              onClick={() => setTab('users')}
            >
              <i className="fa-solid fa-users" />
              All Users
            </button>
          </div>

          {/* Content card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">
                {tab === 'requests' ? 'Pending Approval Requests' : 'Registered Users'}
              </span>
              <button className="admin-refresh-btn" onClick={load} title="Refresh">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
            </div>

            {error && (
              <div className="admin-error">
                <i className="fa-solid fa-circle-exclamation" />
                {error}
              </div>
            )}

            {/* ── Requests tab ── */}
            {tab === 'requests' && (
              loading ? (
                <div className="admin-loading">
                  <div className="admin-spinner" /> Loading requests...
                </div>
              ) : pending.length === 0 ? (
                <div className="admin-empty">
                  <i className="fa-solid fa-circle-check admin-empty-icon" />
                  <div className="admin-empty-title">All clear</div>
                  <div className="admin-empty-sub">No pending approval requests</div>
                </div>
              ) : (
                <div className="request-list">
                  {pending.map((u) => (
                    <div key={u._id} className="request-card">
                      <div className="request-left">
                        <div className="user-avatar">{u.name?.[0]?.toUpperCase()}</div>
                        <div className="request-info">
                          <span className="request-name">{u.name}</span>
                          <span className="request-email">{u.email}</span>
                          <span className="request-time">
                            Registered {new Date(u.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="request-actions">
                        <span className="status-pending">Pending</span>
                        <button
                          className="approve-btn"
                          onClick={() => handleApprove(u._id)}
                          disabled={actionId === u._id}
                        >
                          {actionId === u._id
                            ? <div className="admin-spinner" style={{ width: 12, height: 12 }} />
                            : <><i className="fa-solid fa-check" /> Approve</>
                          }
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleReject(u._id)}
                          disabled={actionId === u._id}
                        >
                          {actionId === u._id
                            ? <div className="admin-spinner" style={{ width: 12, height: 12 }} />
                            : <><i className="fa-solid fa-xmark" /> Reject</>
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* ── Users tab ── */}
            {tab === 'users' && (
              loading ? (
                <div className="admin-loading">
                  <div className="admin-spinner" /> Loading users...
                </div>
              ) : users.length === 0 ? (
                <div className="admin-empty">
                  <i className="fa-solid fa-users admin-empty-icon" />
                  <div className="admin-empty-title">No users yet</div>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u._id}>
                          <td><span className="cell-num">{i + 1}</span></td>

                          <td>
                            <div className="cell-user">
                              <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 14 }}>
                                {u.name?.[0]?.toUpperCase()}
                              </div>
                              <span className="cell-uname">{u.name}</span>
                            </div>
                          </td>

                          <td><span className="cell-email">{u.email}</span></td>

                          <td>
                            {u.approvalStatus === 'approved' && <span className="badge-approved">Approved</span>}
                            {u.approvalStatus === 'pending'  && <span className="badge-pending">Pending</span>}
                            {u.approvalStatus === 'rejected' && <span className="badge-rejected">Rejected</span>}
                          </td>

                          <td>
                            <span className="cell-date">
                              {new Date(u.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              })}
                            </span>
                          </td>

                          <td>
                            <div className="tbl-actions">
                              {u.approvalStatus !== 'approved' && (
                                <button
                                  className="tbl-btn tbl-btn-approve"
                                  title="Approve"
                                  onClick={() => handleApprove(u._id)}
                                  disabled={actionId === u._id}
                                >
                                  {actionId === u._id
                                    ? <div className="admin-spinner" style={{ width: 10, height: 10 }} />
                                    : <i className="fa-solid fa-check" />
                                  }
                                </button>
                              )}
                              {u.approvalStatus !== 'rejected' && (
                                <button
                                  className="tbl-btn tbl-btn-reject"
                                  title="Reject"
                                  onClick={() => handleReject(u._id)}
                                  disabled={actionId === u._id}
                                >
                                  {actionId === u._id
                                    ? <div className="admin-spinner" style={{ width: 10, height: 10 }} />
                                    : <i className="fa-solid fa-xmark" />
                                  }
                                </button>
                              )}
                              <button
                                className="tbl-btn tbl-btn-delete"
                                title="Delete"
                                onClick={() => handleDelete(u._id)}
                                disabled={actionId === u._id}
                              >
                                {actionId === u._id
                                  ? <div className="admin-spinner" style={{ width: 10, height: 10 }} />
                                  : <i className="fa-solid fa-trash" />
                                }
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}