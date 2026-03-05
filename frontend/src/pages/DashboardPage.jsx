import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getLandingPages, deleteLandingPage } from '../store/landingSlice';
import styles from '../styles/DashboardPage.module.css';

const CopyIcon = () => <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;
const EditIcon = () => <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>;
const EyeIcon = () => <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const TrashIcon = () => <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const LinkIcon = () => <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>;

const ROWS_OPTIONS = [5, 10, 20];

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { pages, isLoading } = useSelector((s) => s.landing);

  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [copied, setCopied] = useState('');

  useEffect(() => { dispatch(getLandingPages()); }, [dispatch]);

  const filtered = pages.filter(p =>
    p.channelName.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleDelete = async (id) => {
    if (!confirm('Delete this landing page?')) return;
    setDeletingId(id);
    await dispatch(deleteLandingPage(id));
    setDeletingId(null);
  };

  const copyUrl = (slug) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">Admin Dashboard</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select className={styles.rowsSelect} value={rowsPerPage} onChange={e => { setRowsPerPage(+e.target.value); setCurrentPage(1); }}>
              {ROWS_OPTIONS.map(r => <option key={r} value={r}>{r} rows</option>)}
            </select>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin')} style={{ display: user?.role === 'admin' ? 'flex' : 'none' }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              Admin Panel
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => {}}>
              🗑 Recycle Bin
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/create')}>+ Create New</button>
          </div>
        </div>

        <div className="scroll-area">
          {/* Search */}
          <div className={styles.searchWrap}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search landing pages..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>

          {/* Table */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Your Landing Pages</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Manage and track all your channel landing pages</span>
            </div>

            {isLoading ? (
              <div className={styles.loader}><div className="spinner spinner-lg" /><span>Loading...</span></div>
            ) : paginated.length === 0 ? (
              <div className={styles.empty}>
                <span style={{ fontSize: 32 }}>📄</span>
                <span style={{ color: 'var(--text2)', fontWeight: 600 }}>No landing pages yet</span>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/create')}>Create your first page</button>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Logo</th>
                      <th>Channel Name</th>
                      <th>Channel Link</th>
                      <th>Landing Page URL</th>
                      <th>Design</th>
                      <th>Subscribers</th>
                      <th>Views</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((p, i) => (
                      <tr key={p._id}>
                        <td>
                          <div className={styles.indexBadge}>{(currentPage - 1) * rowsPerPage + i + 1}</div>
                        </td>
                        <td>
                          <div className={styles.logoCell}>
                            {p.logoUrl
                              ? <img src={p.logoUrl} alt="logo" className={styles.logoImg} />
                              : <div className={styles.logoPlaceholder}>{p.channelName?.[0]?.toUpperCase()}</div>
                            }
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--accent2)', fontSize: 13 }}>{p.channelName}</span>
                        </td>
                        <td>
                          <a href={p.channelLink} target="_blank" rel="noreferrer" className={styles.link}>
                            {p.channelLink.length > 20 ? p.channelLink.substring(0, 20) + '...' : p.channelLink}
                            <LinkIcon />
                          </a>
                        </td>
                        <td>
                          <div className={styles.slugCell}>
                            <span className={styles.slugText}>/{p.slug}</span>
                            <button className={styles.copyBtn} onClick={() => copyUrl(p.slug)} title="Copy URL">
                              {copied === p.slug ? '✓' : <CopyIcon />}
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-purple`}>#{p.design?.split('-').map(w => w[0]).join('')?.toUpperCase() || 'MB'}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" style={{ display: 'inline', marginRight: 4 }}>
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                            </svg>
                            {p.subscribers?.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: 4 }}>
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                            {p.views}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button className={`btn btn-icon btn-ghost btn-sm`} title="Preview" onClick={() => window.open(`/p/${p.slug}`, '_blank')}><EyeIcon /></button>
                            <button className={`btn btn-icon btn-ghost btn-sm`} title="Edit" onClick={() => navigate(`/edit/${p._id}`)}><EditIcon /></button>
                            <span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-gray'}`} style={{ cursor: 'default' }}>
                              {p.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                            <button className={`btn btn-icon btn-danger btn-sm`} title="Delete" onClick={() => handleDelete(p._id)} disabled={deletingId === p._id}>
                              {deletingId === p._id ? <span className="spinner" /> : <TrashIcon />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} results
                </span>
                <div className={styles.pageBtns}>
                  <button className={`btn btn-ghost btn-sm`} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Previous</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button key={n} className={`btn btn-sm ${currentPage === n ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCurrentPage(n)}>{n}</button>
                  ))}
                  <button className={`btn btn-ghost btn-sm`} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}