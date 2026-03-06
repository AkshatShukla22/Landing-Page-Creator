// frontend/src/components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { toggleSidebar } from '../store/uiSlice';
import '../styles/Sidebar.css';

export default function Sidebar() {
  const { user }             = useSelector((s) => s.auth);
  const { sidebarCollapsed } = useSelector((s) => s.ui);
  const dispatch             = useDispatch();
  const navigate             = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth', { replace: true });
  };

  return (
    <aside className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>

      {/* ── Toggle ── */}
      <button
        className="sidebar-toggle"
        onClick={() => dispatch(toggleSidebar())}
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <i className="fa-solid fa-chevron-left" />
      </button>

      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">M</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">MetaBull</span>
          <span className="sidebar-logo-sub">Universe</span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="sidebar-nav">

        <NavLink
          to="/home"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <i className="fa-solid fa-house" />
          <span className="nav-label">Home</span>
          <span className="nav-tooltip">Home</span>
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <i className="fa-solid fa-table-cells-large" />
          <span className="nav-label">Dashboard</span>
          <span className="nav-tooltip">Dashboard</span>
        </NavLink>

        {(user?.role === 'admin' || user?.isApproved || user?.isApproved === undefined) ? (
          <NavLink
            to="/create"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <i className="fa-solid fa-plus" />
            <span className="nav-label">Create New</span>
            <span className="nav-tooltip">Create New</span>
          </NavLink>
        ) : (
          <div className="nav-item nav-item-disabled" title="Awaiting admin approval">
            <i className="fa-solid fa-plus" />
            <span className="nav-label">Create New</span>
            <span className="nav-pending-badge">PENDING</span>
            <span className="nav-tooltip">Awaiting Approval</span>
          </div>
        )}

        {user?.role === 'admin' && (
          <>
            <div className="sidebar-divider" />
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <i className="fa-solid fa-lock" />
              <span className="nav-label">Admin Panel</span>
              <span className="nav-tooltip">Admin Panel</span>
            </NavLink>
          </>
        )}

      </nav>

      {/* ── Bottom ── */}
      <div className="sidebar-bottom">
        <div className="user-chip">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <i className="fa-solid fa-arrow-right-from-bracket" />
          <span className="logout-label">Logout</span>
          <span className="nav-tooltip">Logout</span>
        </button>
      </div>

    </aside>
  );
}