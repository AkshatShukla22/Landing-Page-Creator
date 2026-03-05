import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getLandingPages, getStats } from '../store/landingSlice';
import styles from '../styles/HomePage.module.css';

const StatCard = ({ icon, label, value, accent, sub }) => (
  <div className={styles.statCard} style={{ '--accent': accent }}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statInfo}>
      <span className={styles.statVal} style={{ color: accent }}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
      {sub && <span className={styles.statSub}>{sub}</span>}
    </div>
  </div>
);

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { pages, stats, isLoading } = useSelector((s) => s.landing);

  useEffect(() => {
    dispatch(getLandingPages());
    dispatch(getStats());
  }, [dispatch]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const recentPages = pages.slice(0, 4);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">Home</div>
            <div className="topbar-sub">Welcome back 👋</div>
          </div>
          <div className={styles.topActions}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>View Dashboard</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/create')}>+ Create New</button>
          </div>
        </div>

        <div className="scroll-area">
          {/* Hero */}
          <div className={styles.hero}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>Create Beautiful<br />Landing Pages in Minutes</h1>
              <p className={styles.heroSub}>Build, manage, and track stunning landing pages with our powerful platform.</p>
              <div className={styles.heroBtns}>
                <button className="btn btn-primary" onClick={() => navigate('/create')}>Start Creating</button>
                <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>View Dashboard</button>
              </div>
            </div>
            <div className={styles.heroBg} />
          </div>

          {/* Stats */}
          <div className={styles.statsGrid}>
            <StatCard icon="📄" label="Total Pages" value={stats.totalPages} accent="#a78bfa" sub="All landing pages" />
            <StatCard icon="👁️" label="Total Views" value={stats.totalViews.toLocaleString()} accent="#f59e0b" sub="Cumulative views" />
            <StatCard icon="📊" label="Avg. Views / Page" value={stats.avgViews} accent="#10b981" sub="Per page average" />
            <StatCard icon="✅" label="Active Pages" value={pages.filter(p => p.status === 'active').length} accent="#6366f1" sub="Currently live" />
          </div>

          {/* Feature cards */}
          <div className={styles.featureGrid}>
            {[
              { icon: '⚡', title: 'Lightning Fast', desc: 'Create & deploy in minutes' },
              { icon: '👁️', title: 'Track Performance', desc: 'Built-in analytics' },
              { icon: '📈', title: 'Grow Your Business', desc: 'Optimized pages' },
            ].map((f) => (
              <div key={f.title} className="card card-sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', padding: '24px' }}>
                <span style={{ fontSize: 28 }}>{f.icon}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{f.title}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{f.desc}</span>
              </div>
            ))}
          </div>

          {/* Recent pages */}
          {recentPages.length > 0 && (
            <div className={styles.recentSection}>
              <div className={styles.recentHeader}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Recent Pages</span>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>View All</button>
              </div>
              <div className={styles.recentGrid}>
                {recentPages.map((p) => (
                  <div key={p._id} className={`card card-sm ${styles.recentCard}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{p.channelName}</span>
                      <span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{p.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>/{p.slug}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>👁 {p.views} views</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}