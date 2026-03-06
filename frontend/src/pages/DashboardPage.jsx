// frontend/src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getLandingPages, deleteLandingPage } from '../store/landingSlice';
import '../styles/DashboardPage.css';

const ROWS = 10;

export default function DashboardPage() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user }   = useSelector((s) => s.auth);
  const { pages, isLoading }  = useSelector((s) => s.landing);
  const { sidebarCollapsed }  = useSelector((s) => s.ui);

  const [search,      setSearch]      = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId,  setDeletingId]  = useState(null);
  const [copied,      setCopied]      = useState('');

  useEffect(() => { dispatch(getLandingPages()); }, [dispatch]);
  useEffect(() => { setCurrentPage(1); }, [search]);

  const filtered   = pages.filter(p =>
    p.channelName.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ROWS);
  const paginated  = filtered.slice((currentPage - 1) * ROWS, currentPage * ROWS);

  const handleDelete = async (id) => {
    if (!confirm('Delete this landing page?')) return;
    setDeletingId(id);
    await dispatch(deleteLandingPage(id));
    setDeletingId(null);
  };

  const copyUrl = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(''), 2000);
  };

  const marginLeft = sidebarCollapsed ? 'var(--sb-collapsed, 64px)' : 'var(--sb-width, 220px)';

  return (
    <div className="dash-shell">
      <Sidebar />

      <div className="dash-main" style={{ marginLeft }}>

        {/* ── Topbar ── */}
        <div className="dash-topbar">
          <div>
            <div className="dash-page-label">MetaBull Universe</div>
            <div className="dash-page-title">Landing Pages</div>
          </div>
          <div className="dash-topbar-right">
            {user?.role === 'admin' && (
              <button className="dash-btn-ghost" onClick={() => navigate('/admin')}>
                <i className="fa-solid fa-lock" /> Admin Panel
              </button>
            )}
            <button className="dash-btn-gold" onClick={() => navigate('/create')}>
              <i className="fa-solid fa-plus" /> New Page
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="dash-body">

          {/* Controls */}
          <div className="dash-controls">
            <div className="dash-search-wrap">
              <i className="fa-solid fa-magnifying-glass dash-search-icon" />
              <input
                className="dash-search"
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="dash-meta">
              <strong>{filtered.length}</strong> pages &nbsp;&middot;&nbsp;
              page <strong>{currentPage}</strong> of <strong>{Math.max(totalPages, 1)}</strong>
            </span>
          </div>

          {/* Table card */}
          <div className="dash-table-card">

            {isLoading ? (
              <div className="dash-loading">
                <div className="dash-spinner" />
                Loading pages...
              </div>
            ) : paginated.length === 0 ? (
              <div className="dash-empty">
                <i className="fa-solid fa-file-circle-plus dash-empty-icon" />
                <div className="dash-empty-title">
                  {search ? 'No results found' : 'No pages yet'}
                </div>
                <div className="dash-empty-sub">
                  {search
                    ? `No pages matching "${search}"`
                    : 'Create your first landing page to get started'}
                </div>
                {!search && (
                  <button className="dash-btn-gold" style={{ marginTop: 6 }} onClick={() => navigate('/create')}>
                    <i className="fa-solid fa-plus" /> Create Now
                  </button>
                )}
              </div>
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Logo</th>
                      <th>Channel Name</th>
                      <th>Channel Link</th>
                      <th>Page URL</th>
                      <th>Subscribers</th>
                      <th>Views</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((p, i) => (
                      <tr key={p._id}>

                        <td><span className="cell-index">{(currentPage - 1) * ROWS + i + 1}</span></td>

                        <td>
                          {p.logoUrl
                            ? <img src={p.logoUrl} alt="logo" className="logo-img" />
                            : <div className="logo-placeholder">{p.channelName?.[0]?.toUpperCase()}</div>
                          }
                        </td>

                        <td><span className="cell-name">{p.channelName}</span></td>

                        <td>
                          <a href={p.channelLink} target="_blank" rel="noreferrer" className="cell-link">
                            {p.channelLink.length > 22 ? p.channelLink.substring(0, 22) + '…' : p.channelLink}
                            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 9 }} />
                          </a>
                        </td>

                        <td>
                          <div className="cell-slug">
                            <span className="slug-text">/{p.slug}</span>
                            <button
                              className={`copy-btn${copied === p.slug ? ' copy-btn-copied' : ''}`}
                              onClick={() => copyUrl(p.slug)}
                              title="Copy URL"
                            >
                              <i className={`fa-solid ${copied === p.slug ? 'fa-check' : 'fa-copy'}`} />
                            </button>
                          </div>
                        </td>

                        <td>
                          <span className="cell-views">
                            <i className="fa-solid fa-users" style={{ marginRight: 5, opacity: 0.45 }} />
                            {p.subscribers?.toLocaleString() ?? '—'}
                          </span>
                        </td>

                        <td>
                          <span className="cell-views">
                            <i className="fa-solid fa-eye" style={{ marginRight: 5, opacity: 0.45 }} />
                            {p.views}
                          </span>
                        </td>

                        <td>
                          <span className={p.status === 'active' ? 'status-active' : 'status-inactive'}>
                            {p.status}
                          </span>
                        </td>

                        <td>
                          <div className="cell-actions">
                            <button className="action-btn" title="Preview" onClick={() => window.open(`/p/${p.slug}`, '_blank')}>
                              <i className="fa-solid fa-eye" />
                            </button>
                            <button className="action-btn" title="Edit" onClick={() => navigate(`/edit/${p._id}`)}>
                              <i className="fa-solid fa-pen" />
                            </button>
                            <button
                              className="action-btn action-btn-danger"
                              title="Delete"
                              onClick={() => handleDelete(p._id)}
                              disabled={deletingId === p._id}
                            >
                              {deletingId === p._id
                                ? <div className="dash-spinner" style={{ width: 11, height: 11 }} />
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
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="dash-pagination">
                <span className="dash-page-info">
                  {(currentPage - 1) * ROWS + 1}–{Math.min(currentPage * ROWS, filtered.length)} of {filtered.length}
                </span>
                <div className="dash-page-btns">
                  <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <i className="fa-solid fa-chevron-left" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button key={n} className={`page-btn${currentPage === n ? ' active' : ''}`} onClick={() => setCurrentPage(n)}>
                      {n}
                    </button>
                  ))}
                  <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    <i className="fa-solid fa-chevron-right" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}