// frontend/src/pages/AuthPage.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register, clearError } from '../store/authSlice';
import '../styles/AuthPage.css';

const features = [
  { icon: 'fa-solid fa-chart-line',     label: 'Real-time Analytics Dashboard'  },
  { icon: 'fa-solid fa-layer-group',    label: 'Multi-project Management'        },
  { icon: 'fa-solid fa-user-shield',    label: 'Role-based Access Control'       },
  { icon: 'fa-solid fa-bolt',           label: 'Instant Landing Page Builder'    },
];

const stats = [
  { num: '10K+',  label: 'Active Users'  },
  { num: '99.9%', label: 'Uptime'        },
  { num: '256',   label: 'Data Points'   },
];

export default function AuthPage() {
  const [mode, setMode]       = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
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
        navigate(result.payload.user.role === 'admin' ? '/admin' : '/home', { replace: true });
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
    <div className="page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="blob blob-4" />
      <div className="blob blob-5" />

      <div className="container">

        {/* ── Brand Panel ── */}
        <div className="brand">
          <div className="brandInner">

            <div className="logo">
              <span className="logoMark">M</span>
            </div>

            <div className="brandName">MetaBull</div>
            <div className="brandSub">Universe</div>

            <p className="brandTagline">
              The all-in-one platform to build, manage, and scale
              your digital presence — fast.
            </p>

            <div className="brandFeatures">
              {features.map((f) => (
                <div key={f.label} className="feature">
                  <div className="featureIcon">
                    <i className={f.icon} />
                  </div>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="brandFooter">
            {stats.map((s, i) => (
              <>
                <div key={s.label} className="stat">
                  <span className="statNum">{s.num}</span>
                  <span className="statLabel">{s.label}</span>
                </div>
                {i < stats.length - 1 && <div className="statDivider" />}
              </>
            ))}
          </div>
        </div>

        {/* ── Form Panel ── */}
        <div className="formPanel">

          {/* Tab switcher */}
          <div className="switcher">
            <button
              className={`switchBtn ${mode === 'login' ? 'switchActive' : ''}`}
              onClick={() => setMode('login')}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`switchBtn ${mode === 'register' ? 'switchActive' : ''}`}
              onClick={() => setMode('register')}
              type="button"
            >
              Sign Up
            </button>
            <div className={`switchIndicator ${mode === 'register' ? 'switchIndicatorRight' : ''}`} />
          </div>

          {/* Header */}
          <div className="formHeader">
            <h2 className="formTitle">
              {mode === 'login' ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="formSub">
              {mode === 'login'
                ? 'Sign in to access your MetaBull dashboard'
                : 'Create your account and join MetaBull Universe'}
            </p>
          </div>

          {/* Form */}
          <form className="form" onSubmit={handleSubmit} noValidate>

            {/* Name — register only */}
            <div className={`fieldGroup ${mode === 'register' ? 'visible' : 'hidden'}`}>
              <label className="label">Full Name</label>
              <div className="inputWrap">
                <i className="fa-solid fa-user inputIcon" />
                <input
                  className="input"
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
            <div className="fieldGroup">
              <label className="label">Email Address</label>
              <div className="inputWrap">
                <i className="fa-solid fa-envelope inputIcon" />
                <input
                  className="input"
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="fieldGroup">
              <label className="label">Password</label>
              <div className="inputWrap">
                <i className="fa-solid fa-lock inputIcon" />
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="eyeBtn"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                >
                  <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            {/* Error */}
            {displayError && (
              <div className="errorBox">
                <i className="fa-solid fa-circle-exclamation" />
                {displayError}
              </div>
            )}

            {/* Submit */}
            <button className="submitBtn" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  <i className={`fa-solid ${mode === 'login' ? 'fa-arrow-right-to-bracket' : 'fa-user-plus'}`} />
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {mode === 'login' && (
            <p className="hint">
              Admin access via <span className="hintAccent">admin@metabull.com</span>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}