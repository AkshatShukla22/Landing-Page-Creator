import { useState, useRef, useEffect, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PhonePreview, { DESIGNS } from '../components/PhonePreview';
import { createLandingPage, clearCreateError } from '../store/landingSlice';
import { checkSlugAvailable } from '../services/landingService';
import { uploadToCloudinary } from '../services/uploadService';
import styles from '../styles/CreatePage.module.css';

const initForm = {
  channelName: '', channelTitle: '', subscribers: '',
  slug: '', ctaText: 'Join on Telegram', channelLink: '',
  description1: '', description2: '',
  design: 'modern-blue', metaPixelId: '', googleTagId: '',
  status: 'active', logoBase64: '', logoUrl: '',
};

// Memoized preview — only re-renders when preview data actually changes
const StablePreview = memo(({ data }) => <PhonePreview data={data} />);

// Field wrapper defined OUTSIDE component — prevents re-creation on every render
const Field = ({ label, required, hint, error, children }) => (
  <div className="form-group">
    <label className="form-label">
      {label}{required && <span style={{ color: 'var(--error)', marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {hint && <span className="form-hint">{hint}</span>}
    {error && <span className="form-error">{error}</span>}
  </div>
);

export default function CreatePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isCreating, createError } = useSelector((s) => s.landing);
  const { user } = useSelector((s) => s.auth);

  // form = live state bound to inputs (updates every keystroke)
  const [form, setFormState] = useState(initForm);
  const formRef = useRef(initForm); // always has latest form without causing re-renders

  // preview = debounced snapshot sent to PhonePreview only (500ms after typing stops)
  const [preview, setPreview] = useState(initForm);

  const [slugStatus, setSlugStatus] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState('');

  const fileRef = useRef();
  const slugTimer = useRef();
  const previewTimer = useRef();

  useEffect(() => { dispatch(clearCreateError()); }, [dispatch]);

  // Central setter: updates form immediately, schedules preview update after 500ms idle
  const setForm = (updater) => {
    setFormState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      formRef.current = next;
      clearTimeout(previewTimer.current);
      previewTimer.current = setTimeout(() => setPreview(s => ({ ...s, ...formRef.current })), 500);
      return next;
    });
  };

  // Design/status are selects — reflect instantly in preview
  const setInstant = (key, val) => {
    setFormState(prev => {
      const next = { ...prev, [key]: val };
      formRef.current = next;
      setPreview(s => ({ ...s, [key]: val }));
      return next;
    });
  };

  const triggerSlugCheck = (slug) => {
    clearTimeout(slugTimer.current);
    if (!slug) { setSlugStatus(null); return; }
    setSlugStatus('checking');
    slugTimer.current = setTimeout(async () => {
      try {
        const res = await checkSlugAvailable(slug);
        setSlugStatus(res.available ? 'available' : 'taken');
      } catch { setSlugStatus(null); }
    }, 600);
  };

  const handleChannelNameChange = (val) => {
    setForm(f => {
      const next = { ...f, channelName: val };
      if (val && !f.slug) {
        next.slug = val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
        triggerSlugCheck(next.slug);
      }
      return next;
    });
  };

  const handleSlugChange = (val) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormState(prev => { const next = { ...prev, slug: clean }; formRef.current = next; return next; });
    triggerSlugCheck(clean);
  };

  const handleGenerateSlug = () => {
    const base = (formRef.current.channelName || 'page').toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const rand = base + '-' + Math.random().toString(36).substring(2, 6);
    setFormState(prev => { const next = { ...prev, slug: rand }; formRef.current = next; return next; });
    triggerSlugCheck(rand);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    // Show local preview instantly
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoPreview(ev.target.result);
      setPreview(s => ({ ...s, logoUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
    // Upload to Cloudinary directly from browser
    try {
      const { url } = await uploadToCloudinary(file);
      setFormState(prev => {
        const next = { ...prev, logoUrl: url, logoBase64: '' };
        formRef.current = next;
        setPreview(s => ({ ...s, logoUrl: url }));
        return next;
      });
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    }
  };

  const validate = () => {
    const f = formRef.current;
    const errs = {};
    if (!f.channelName.trim()) errs.channelName = 'Required';
    if (!f.channelTitle.trim()) errs.channelTitle = 'Required';
    if (!f.subscribers || isNaN(f.subscribers)) errs.subscribers = 'Enter valid number';
    if (!f.slug.trim()) errs.slug = 'Required';
    if (slugStatus === 'taken') errs.slug = 'Slug already taken';
    if (!f.channelLink.trim()) errs.channelLink = 'Required';
    if (!f.description1.trim()) errs.description1 = 'Required';
    if (f.metaPixelId && !/^\d{15,16}$/.test(f.metaPixelId)) errs.metaPixelId = 'Must be 15-16 digits';
    if (f.googleTagId && !/^G-[A-Z0-9]+$/i.test(f.googleTagId)) errs.googleTagId = 'Format: G-XXXXXXXXXX';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    const f = formRef.current;
    const result = await dispatch(createLandingPage({ ...f, subscribers: parseInt(f.subscribers) }));
    if (createLandingPage.fulfilled.match(result)) navigate('/dashboard');
  };

  // Block unapproved users
  if (user?.role !== 'admin' && user?.isApproved === false) {
    return (
      <div className="app-shell">
        <Sidebar />
        <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center', maxWidth: 420, padding: 40 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>⏳</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>Approval Pending</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>
              Your account is awaiting admin approval. Once approved, you'll be able to create landing pages.
            </p>
            <div style={{ background: 'var(--surface)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--r-lg)', padding: '14px 20px', width: '100%' }}>
              <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>⏳ Status: Pending Review</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/home')}>← Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>

        <div className={styles.layout}>
          {/* ── Form side ── */}
          <div className={styles.formSide}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Create Landing Page</h2>
              <p className={styles.formSub}>Build a stunning landing page for your Telegram channel</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className={styles.form}>
              {/* Logo */}
              <div className={styles.logoUpload} onClick={() => fileRef.current.click()}>
                {logoPreview
                  ? <img src={logoPreview} alt="logo" className={styles.logoPreviewImg} />
                  : (
                    <div className={styles.logoPlaceholder}>
                      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--muted)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Image Input</span>
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>1:1 • &lt; 5MB</span>
                    </div>
                  )
                }
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
              </div>

              {/* Row 1 — Channel Name / Title / Subscribers */}
              <div className={styles.row3}>
                <Field label="Channel Name" required error={fieldErrors.channelName}>
                  <input className="form-input" placeholder="e.g., TechReviews"
                    onChange={e => handleChannelNameChange(e.target.value)} />
                </Field>
                <Field label="Channel Title" required error={fieldErrors.channelTitle}>
                  <input className="form-input" placeholder="e.g., Tech Reviews & Tutorials"
                    onChange={e => setForm(f => ({ ...f, channelTitle: e.target.value }))} />
                </Field>
                <Field label="Subscribers" required hint="Enter manually" error={fieldErrors.subscribers}>
                  <input className="form-input" placeholder="e.g., 10000" type="number"
                    onChange={e => setForm(f => ({ ...f, subscribers: e.target.value }))} />
                </Field>
              </div>

              {/* Row 2 — Slug + CTA */}
              <div className={styles.row2}>
                <Field label="Custom URL Slug" required hint="Unique path for your landing page"
                  error={fieldErrors.slug || (slugStatus === 'taken' ? '✗ Already taken' : null)}>
                  <div className={styles.slugRow}>
                    <div className={styles.slugInputWrap}>
                      <input className={`form-input ${styles.slugInput}`} placeholder="e.g., my-awesome-channel"
                        value={form.slug} onChange={e => handleSlugChange(e.target.value)} />
                      {slugStatus === 'checking' && <span className={styles.slugStatus}><span className="spinner" style={{ width: 12, height: 12 }} /></span>}
                      {slugStatus === 'available' && <span className={styles.slugStatus} style={{ color: 'var(--success)' }}>✓</span>}
                      {slugStatus === 'taken'     && <span className={styles.slugStatus} style={{ color: 'var(--error)' }}>✗</span>}
                    </div>
                    <button type="button" className={`btn btn-ghost btn-sm ${styles.generateBtn}`} onClick={handleGenerateSlug}>Generate</button>
                  </div>
                  {slugStatus === 'available' && <span className="form-hint" style={{ color: 'var(--success)' }}>✓ Available</span>}
                </Field>
                <Field label="CTA Button Text" required>
                  <input className="form-input" defaultValue={form.ctaText}
                    onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} />
                </Field>
              </div>

              {/* Row 3 — Status / Design / Description 1 */}
              <div className={styles.row3}>
                <Field label="Status" required>
                  <select className="form-select" value={form.status} onChange={e => setInstant('status', e.target.value)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </Field>
                <Field label="Design" required>
                  <select className="form-select" value={form.design} onChange={e => setInstant('design', e.target.value)}>
                    {DESIGNS.map(d => <option key={d.value} value={d.value}>{d.emoji} {d.label}</option>)}
                  </select>
                </Field>
                <Field label="Description 1" required error={fieldErrors.description1}>
                  <input className="form-input" placeholder="Main channel description"
                    onChange={e => setForm(f => ({ ...f, description1: e.target.value }))} />
                </Field>
              </div>

              {/* Row 4 — Description 2 / Channel Link */}
              <div className={styles.row2}>
                <Field label="Description 2 (Optional)">
                  <input className="form-input" placeholder="Additional description"
                    onChange={e => setForm(f => ({ ...f, description2: e.target.value }))} />
                </Field>
                <Field label="Channel Link" required error={fieldErrors.channelLink}>
                  <input className="form-input" placeholder="e.g., https://t.me/yourchannel"
                    onChange={e => setForm(f => ({ ...f, channelLink: e.target.value }))} />
                </Field>
              </div>

              {/* Row 5 — Tracking */}
              <div className={styles.row3}>
                <Field label="Meta Pixel ID" required hint="15-16 digit number" error={fieldErrors.metaPixelId}>
                  <input className="form-input" placeholder="e.g., 1234567890123456"
                    onChange={e => setForm(f => ({ ...f, metaPixelId: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                    maxLength={16} />
                </Field>
                <Field label="Google Tag ID (Optional)" hint="Format: G-XXXXXXXXXX" error={fieldErrors.googleTagId}>
                  <input className="form-input" placeholder="e.g., G-XXXXXXXXXX"
                    onChange={e => setForm(f => ({ ...f, googleTagId: e.target.value }))} />
                </Field>
                <div />
              </div>

              {createError && (
                <div className={styles.errorBox}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {createError}
                </div>
              )}

              <button type="submit" className={`btn btn-primary w-full ${styles.submitBtn}`} disabled={isCreating}>
                {isCreating ? <><span className="spinner" /> Creating...</> : 'Create Landing Page'}
              </button>
            </form>
          </div>

          {/* ── Phone preview — receives debounced data only ── */}
          <div className={styles.previewSide}>
            <StablePreview data={preview} />
          </div>
        </div>
      </div>
    </div>
  );
}