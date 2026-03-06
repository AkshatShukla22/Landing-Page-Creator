// frontend/src/pages/HomePage.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getLandingPages, getStats } from '../store/landingSlice';
import '../styles/HomePage.css';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const pillars = [
  {
    icon: 'fa-solid fa-rocket',
    title: 'Instant Deploy',
    desc: 'Publish high-performance landing pages in seconds — no code required.',
  },
  {
    icon: 'fa-solid fa-chart-line',
    title: 'Live Analytics',
    desc: 'Track every visit, source, and conversion in real time from your dashboard.',
  },
  {
    icon: 'fa-solid fa-layer-group',
    title: 'Multi-Project',
    desc: 'Manage unlimited brands and campaigns from a single unified workspace.',
  },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user }                   = useSelector((s) => s.auth);
  const { pages, stats, isLoading } = useSelector((s) => s.landing);
  const { sidebarCollapsed }        = useSelector((s) => s.ui);

  useEffect(() => {
    dispatch(getLandingPages());
    dispatch(getStats());
  }, [dispatch]);

  const activeCount = pages.filter((p) => p.status === 'active').length;

  const statTiles = [
    { icon: 'fa-solid fa-file-lines',   label: 'Total Pages',      value: stats.totalPages ?? 0,                      sub: 'In workspace',      accent: '#a78bfa' },
    { icon: 'fa-solid fa-eye',          label: 'Total Views',      value: stats.totalViews?.toLocaleString() ?? '0',  sub: 'Cumulative',        accent: '#d4af37' },
    { icon: 'fa-solid fa-chart-bar',    label: 'Avg. Views / Page',value: stats.avgViews ?? 0,                        sub: 'Per page',          accent: '#10b981' },
    { icon: 'fa-solid fa-circle-check', label: 'Active Pages',     value: activeCount,                                sub: 'Currently live',    accent: '#6366f1' },
  ];

  return (
    <div className="home-shell">
      <Sidebar />

      <div className="home-main" style={{ marginLeft: sidebarCollapsed ? 'var(--sb-collapsed, 64px)' : 'var(--sb-width, 220px)' }}>

        {/* ── Topbar ── */}
        <div className="home-topbar">
          <span className="topbar-greeting">
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </span>
          <div className="topbar-actions">
            <button className="btn-ghost-home" onClick={() => navigate('/dashboard')}>
              <i className="fa-solid fa-table-columns" /> Dashboard
            </button>
            <button className="btn-gold-home" onClick={() => navigate('/create')}>
              <i className="fa-solid fa-plus" /> New Page
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="home-content">

          {/* ── Hero ── */}
          <div className="home-hero">
            <div className="hero-kicker">
              <div className="hero-kicker-line" />
              <span className="hero-kicker-text">MetaBull Universe — Platform</span>
            </div>

            <h1 className="hero-title">
              Build Pages That
              <span className="hero-title-accent">Convert.</span>
            </h1>

            <p className="hero-desc">
              MetaBull Universe is a professional-grade platform for creating,
              managing, and scaling landing pages — designed for teams that
              demand performance and precision.
            </p>

            <div className="hero-ctas">
              <button className="btn-gold-home" onClick={() => navigate('/create')}>
                <i className="fa-solid fa-rocket" /> Launch a Page
              </button>
              <div className="hero-cta-divider" />
              <span className="hero-stat-inline">
                <strong>{pages.length}</strong> pages &nbsp;·&nbsp; <strong>{activeCount}</strong> live
              </span>
            </div>
          </div>

          {/* ── Bottom: Stats + Pillars ── */}
          <div className="home-bottom">

            {/* Stats */}
            <div>
              <div className="section-label">Platform Stats</div>
              <div className="stats-row">
                {statTiles.map((s) => (
                  <div key={s.label} className="stat-tile" style={{ '--accent': s.accent }}>
                    <i className={`${s.icon} stat-tile-icon`} />
                    <div className="stat-tile-val">
                      {isLoading
                        ? <span className="shimmer" style={{ display: 'inline-block', width: 36, height: 30 }} />
                        : s.value
                      }
                    </div>
                    <div className="stat-tile-label">{s.label}</div>
                    <div className="stat-tile-sub">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillars */}
            <div>
              <div className="section-label">What We Offer</div>
              <div className="pillars-row">
                {pillars.map((p) => (
                  <div key={p.title} className="pillar">
                    <div className="pillar-icon">
                      <i className={p.icon} />
                    </div>
                    <div className="pillar-title">{p.title}</div>
                    <div className="pillar-desc">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}