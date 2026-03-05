import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register, clearError } from '../store/authSlice';
import styles from '../styles/AuthPage.module.css';

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [localError, setLocalError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(clearError());
    setLocalError('');
    setForm({ name: '', email: '', password: '' });
    setShowPass(false);
  }, [mode, dispatch]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setLocalError('');
    dispatch(clearError());
  };

  const validate = () => {
    if (mode === 'register' && !form.name.trim()) return 'Name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid email';
    if (!form.password) return 'Password is required';
    if (mode === 'register' && form.password.length < 6) return 'Password must be 6+ characters';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setLocalError(err);

    if (mode === 'login') {
      const result = await dispatch(login({ email: form.email, password: form.password }));
      if (login.fulfilled.match(result)) {
        const role = result.payload.user.role;
        navigate(role === 'admin' ? '/admin' : '/home', { replace: true });
      }
    } else {
      const result = await dispatch(register(form));
      if (register.fulfilled.match(result)) {
        navigate('/home', { replace: true });
      }
    }
  };

  const displayError = localError || error;

  return (
    <div className={styles.page}>
      {/* Background blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />

      {/* Grid lines */}
      <div className={styles.grid} />

      <div className={styles.container}>
        {/* Left brand panel */}
        <div className={styles.brand}>
          <div className={styles.brandInner}>
            <div className={styles.logo}>
              <span className={styles.logoMark}>M</span>
            </div>
            <h1 className={styles.brandName}>MetaBull</h1>
            <p className={styles.brandTagline}>The next generation platform built for those who move fast.</p>
            <div className={styles.brandFeatures}>
              {['Secure JWT Auth', 'Role-based Access', 'Real-time Data'].map((f) => (
                <div key={f} className={styles.feature}>
                  <span className={styles.featureDot} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.brandFooter}>
            <div className={styles.stat}><span className={styles.statNum}>99.9%</span><span className={styles.statLabel}>Uptime</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><span className={styles.statNum}>256-bit</span><span className={styles.statLabel}>Encryption</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><span className={styles.statNum}>JWT</span><span className={styles.statLabel}>Secured</span></div>
          </div>
        </div>

        {/* Right form panel */}
        <div className={styles.formPanel}>
          {/* Mode switcher */}
          <div className={styles.switcher}>
            <button
              className={`${styles.switchBtn} ${mode === 'login' ? styles.switchActive : ''}`}
              onClick={() => setMode('login')}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`${styles.switchBtn} ${mode === 'register' ? styles.switchActive : ''}`}
              onClick={() => setMode('register')}
              type="button"
            >
              Sign Up
            </button>
            <div className={`${styles.switchIndicator} ${mode === 'register' ? styles.switchIndicatorRight : ''}`} />
          </div>

          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className={styles.formSub}>
              {mode === 'login'
                ? 'Enter your credentials to access your dashboard'
                : 'Join MetaBull and unlock full access'}
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {/* Name field (register only) */}
            <div className={`${styles.fieldGroup} ${mode === 'register' ? styles.visible : styles.hidden}`}>
              <label className={styles.label}>Full Name</label>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  tabIndex={mode === 'register' ? 0 : -1}
                />
              </div>
            </div>

            {/* Email */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </div>

            {/* Error */}
            {displayError && (
              <div className={styles.errorBox}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {displayError}
              </div>
            )}

            {/* Submit */}
            <button className={styles.submitBtn} type="submit" disabled={isLoading}>
              {isLoading ? (
                <><span className="spinner" /> {mode === 'login' ? 'Signing in...' : 'Creating account...'}</>
              ) : (
                <>{mode === 'login' ? 'Sign In' : 'Create Account'}</>
              )}
            </button>
          </form>

          {mode === 'login' && (
            <p className={styles.hint}>
              Admin? Use <span className={styles.hintAccent}>metabull@metabull.com</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}