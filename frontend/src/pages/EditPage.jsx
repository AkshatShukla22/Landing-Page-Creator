import { useState, useRef, useEffect, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PhonePreview, { DESIGNS } from '../components/PhonePreview';
import { updateLandingPage } from '../store/landingSlice';
import { fetchPageById, checkSlugAvailable } from '../services/landingService';
import { uploadToCloudinary } from '../services/uploadService';
import styles from '../styles/CreatePage.module.css'; // reuse same styles

const StablePreview = memo(({ data }) => <PhonePreview data={data} />);

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

export default function EditPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading: isSaving } = useSelector((s) => s.landing);
  const { user } = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [originalSlug, setOriginalSlug] = useState('');

  const [form, setFormState] = useState(null);
  const formRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const [slugStatus, setSlugStatus] = useState('available'); // already exists so starts available
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [logoPreview, setLogoPreview] = useState('');

  const fileRef = useRef();
  const slugTimer = useRef();
  const previewTimer = useRef();

  // Load page data
  useEffect(() => {
    fetchPageById(id)
      .then(res => {
        const p = res.page;
        const init = {
          channelName: p.channelName || '',
          channelTitle: p.channelTitle || '',
          subscribers: p.subscribers || '',
          slug: p.slug || '',
          ctaText: p.ctaText || 'Join on Telegram',
          channelLink: p.channelLink || '',
          description1: p.description1 || '',
          description2: p.description2 || '',
          design: p.design || 'modern-blue',
          metaPixelId: p.metaPixelId || '',
          googleTagId: p.googleTagId || '',
          status: p.status || 'active',
          logoBase64: '',
          logoUrl: p.logoUrl || '',
        };
        setFormState(init);
        formRef.current = init;
        setPreview(init);
        setOriginalSlug(p.slug);
        if (p.logoUrl) setLogoPreview(p.logoUrl);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const setForm = (updater) => {
    setFormState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      formRef.current = next;
      clearTimeout(previewTimer.current);
      previewTimer.current = setTimeout(() => setPreview(s => ({ ...s, ...formRef.current })), 500);
      return next;
    });
  };

  const setInstant = (key, val) => {
    setFormState(prev => {
      const next = { ...prev, [key]: val };
      formRef.current = next;
      setPreview(s => ({ ...s, [key]: val }));
      return next;
    });
  };

  const triggerSlugCheck = (slug) => {
    if (slug === originalSlug) { setSlugStatus('available'); return; }
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

  const handleSlugChange = (val) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormState(prev => { const next = { ...prev, slug: clean }; formRef.current = next; return next; });
    triggerSlugCheck(clean);
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
    setFieldErrors({}); setSaveError('');
    const f = formRef.current;
    const result = await dispatch(updateLandingPage({ id, data: { ...f, subscribers: parseInt(f.subscribers) } }));
    if (updateLandingPage.fulfilled.match(result)) {
      navigate('/dashboard');
    } else {
      setSaveError(result.payload || 'Failed to save changes');
    }
  };

  if (user?.role !== 'admin' && user?.isApproved === false) {
    return (
      <div className="app-shell">
        <Sidebar />
        <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center', maxWidth: 420, padding: 40 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>⏳</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>Approval Pending</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>Your account is awaiting admin approval.</p>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/home')}>← Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner spinner-lg" />
      </div>
    </div>
  );

  if (notFound) return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 40 }}>🔍</span>
        <p style={{ color: 'var(--text2)' }}>Landing page not found.</p>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>← Back</button>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a
              href={`/p/${form?.slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-sm"
            >
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
              Preview Live Page
            </a>
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.formSide}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Edit Landing Page</h2>
              <p className={styles.formSub}>Update your landing page details</p>
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
                      <span>Change Logo</span>
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>1:1 • &lt; 5MB</span>
                    </div>
                  )
                }
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
              </div>

              <div className={styles.row3}>
                <Field label="Channel Name" required error={fieldErrors.channelName}>
                  <input className="form-input" defaultValue={form.channelName}
                    onChange={e => setForm(f => ({ ...f, channelName: e.target.value }))} />
                </Field>
                <Field label="Channel Title" required error={fieldErrors.channelTitle}>
                  <input className="form-input" defaultValue={form.channelTitle}
                    onChange={e => setForm(f => ({ ...f, channelTitle: e.target.value }))} />
                </Field>
                <Field label="Subscribers" required error={fieldErrors.subscribers}>
                  <input className="form-input" defaultValue={form.subscribers} type="number"
                    onChange={e => setForm(f => ({ ...f, subscribers: e.target.value }))} />
                </Field>
              </div>

              <div className={styles.row2}>
                <Field label="Custom URL Slug" required error={fieldErrors.slug || (slugStatus === 'taken' ? '✗ Already taken' : null)}>
                  <div className={styles.slugRow}>
                    <div className={styles.slugInputWrap}>
                      <input className={`form-input ${styles.slugInput}`} value={form.slug}
                        onChange={e => handleSlugChange(e.target.value)} />
                      {slugStatus === 'checking'  && <span className={styles.slugStatus}><span className="spinner" style={{ width: 12, height: 12 }} /></span>}
                      {slugStatus === 'available' && <span className={styles.slugStatus} style={{ color: 'var(--success)' }}>✓</span>}
                      {slugStatus === 'taken'     && <span className={styles.slugStatus} style={{ color: 'var(--error)' }}>✗</span>}
                    </div>
                  </div>
                  {slugStatus === 'available' && form.slug !== originalSlug && <span className="form-hint" style={{ color: 'var(--success)' }}>✓ Available</span>}
                </Field>
                <Field label="CTA Button Text" required>
                  <input className="form-input" defaultValue={form.ctaText}
                    onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} />
                </Field>
              </div>

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
                  <input className="form-input" defaultValue={form.description1}
                    onChange={e => setForm(f => ({ ...f, description1: e.target.value }))} />
                </Field>
              </div>

              <div className={styles.row2}>
                <Field label="Description 2 (Optional)">
                  <input className="form-input" defaultValue={form.description2}
                    onChange={e => setForm(f => ({ ...f, description2: e.target.value }))} />
                </Field>
                <Field label="Channel Link" required error={fieldErrors.channelLink}>
                  <input className="form-input" defaultValue={form.channelLink}
                    onChange={e => setForm(f => ({ ...f, channelLink: e.target.value }))} />
                </Field>
              </div>

              <div className={styles.row3}>
                <Field label="Meta Pixel ID" hint="15-16 digit number" error={fieldErrors.metaPixelId}>
                  <input className="form-input" defaultValue={form.metaPixelId}
                    onChange={e => setForm(f => ({ ...f, metaPixelId: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                    maxLength={16} />
                </Field>
                <Field label="Google Tag ID (Optional)" hint="Format: G-XXXXXXXXXX" error={fieldErrors.googleTagId}>
                  <input className="form-input" defaultValue={form.googleTagId}
                    onChange={e => setForm(f => ({ ...f, googleTagId: e.target.value }))} />
                </Field>
                <div />
              </div>

              {saveError && (
                <div className={styles.errorBox}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {saveError}
                </div>
              )}

              <button type="submit" className={`btn btn-primary w-full ${styles.submitBtn}`} disabled={isSaving}>
                {isSaving ? <><span className="spinner" /> Saving...</> : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className={styles.previewSide}>
            <StablePreview data={preview} />
          </div>
        </div>
      </div>
    </div>
  );
}