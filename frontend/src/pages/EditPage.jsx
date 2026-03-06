import { useState, useRef, useEffect, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PhonePreview, { DESIGNS } from '../components/PhonePreview';
import { updateLandingPage } from '../store/landingSlice';
import { fetchPageById, checkSlugAvailable } from '../services/landingService';
import { uploadToCloudinary } from '../services/uploadService';
import '../styles/CreatePage.css';
import '../styles/EditPage.css';

const StablePreview = memo(({ data }) => <PhonePreview data={data} />);

export default function EditPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading: isSaving } = useSelector((s) => s.landing);
  const { user } = useSelector((s) => s.auth);
  const { sidebarCollapsed } = useSelector((s) => s.ui);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [originalSlug, setOriginalSlug] = useState('');

  const [form, setFormState] = useState(null);
  const formRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const [slugStatus, setSlugStatus] = useState('available');
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
          design: p.design || 'obsidian',
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
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoPreview(ev.target.result);
      setPreview(s => ({ ...s, logoUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
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

  const marginLeft = sidebarCollapsed ? 'var(--sb-collapsed,64px)' : 'var(--sb-width,220px)';

  // Blocked
  if (user?.role !== 'admin' && user?.isApproved === false) {
    return (
      <div className="create-shell">
        <Sidebar />
        <div className="create-main" style={{ marginLeft }}>
          <div className="create-blocked">
            <div className="blocked-icon"><i className="fa-solid fa-clock" /></div>
            <div className="blocked-title">Approval Pending</div>
            <p className="blocked-desc">Your account is awaiting admin approval.</p>
            <button className="create-btn-ghost" onClick={() => navigate('/home')}>
              <i className="fa-solid fa-arrow-left" /> Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="create-shell">
      <Sidebar />
      <div className="create-main" style={{ marginLeft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="create-spinner" style={{ width: 36, height: 36 }} />
      </div>
    </div>
  );

  if (notFound) return (
    <div className="create-shell">
      <Sidebar />
      <div className="create-main" style={{ marginLeft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 40 }}>🔍</span>
        <p style={{ color: 'var(--text2)' }}>Landing page not found.</p>
        <button className="create-back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
      </div>
    </div>
  );

  return (
    <div className="create-shell">
      <Sidebar />

      <div className="create-main" style={{ marginLeft }}>

        {/* ── Topbar ── */}
        <div className="create-topbar">
          <button className="create-back-btn" onClick={() => navigate('/dashboard')}>
            <i className="fa-solid fa-chevron-left" /> Dashboard
          </button>
          <div className="create-topbar-center">
            <div className="create-page-label">MetaBull Universe</div>
            <div className="create-page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              Edit Landing Page
              {form?.status && (
                <span className={`edit-status-badge ${form.status}`}>{form.status}</span>
              )}
            </div>
          </div>
          <div className="edit-topbar-actions">
            <a
              href={`/p/${form?.slug}`}
              target="_blank"
              rel="noreferrer"
              className="edit-preview-link"
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
              </svg>
              Preview Live
            </a>
            <button
              className="create-submit-btn"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving
                ? <><div className="create-spinner" /> Saving...</>
                : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>
              }
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="edit-body">

          {/* ── Form column ── */}
          <div className="edit-form-col">
            <form onSubmit={handleSubmit} noValidate className="edit-form">

              {/* Logo upload */}
              <div className="logo-upload-wrap">
                <div className="logo-upload" onClick={() => fileRef.current.click()}>
                  {logoPreview
                    ? <img src={logoPreview} alt="logo" className="logo-preview-img" />
                    : (
                      <div className="logo-placeholder">
                        <i className="fa-solid fa-image" />
                        <span>Change Logo</span>
                        <span className="logo-hint">1:1 · max 5MB</span>
                      </div>
                    )
                  }
                </div>
                <div className="logo-upload-info">
                  <div className="logo-upload-title">Channel Logo</div>
                  <div className="logo-upload-sub">Square image recommended. Will appear in preview.</div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
              </div>

              {/* ── Channel Info divider ── */}
              <div className="edit-section-divider">
                <div className="edit-section-divider-line" />
                <div className="edit-section-divider-label"><i className="fa-solid fa-pen" /> Channel Info</div>
                <div className="edit-section-divider-line" />
              </div>

              {/* Row: Name + Title */}
              <div className="create-row-2">
                <div className="create-field">
                  <label className="create-label">Channel Name <span className="req">*</span></label>
                  <input className={`create-input${fieldErrors.channelName ? ' error' : ''}`} defaultValue={form.channelName}
                    onChange={e => setForm(f => ({ ...f, channelName: e.target.value }))} />
                  {fieldErrors.channelName && <span className="field-err">{fieldErrors.channelName}</span>}
                </div>
                <div className="create-field">
                  <label className="create-label">Channel Title <span className="req">*</span></label>
                  <input className={`create-input${fieldErrors.channelTitle ? ' error' : ''}`} defaultValue={form.channelTitle}
                    onChange={e => setForm(f => ({ ...f, channelTitle: e.target.value }))} />
                  {fieldErrors.channelTitle && <span className="field-err">{fieldErrors.channelTitle}</span>}
                </div>
              </div>

              {/* Row: Subscribers + Status */}
              <div className="create-row-2">
                <div className="create-field">
                  <label className="create-label">Subscribers <span className="req">*</span></label>
                  <input className={`create-input${fieldErrors.subscribers ? ' error' : ''}`} defaultValue={form.subscribers} type="number"
                    onChange={e => setForm(f => ({ ...f, subscribers: e.target.value }))} />
                  {fieldErrors.subscribers && <span className="field-err">{fieldErrors.subscribers}</span>}
                </div>
                <div className="create-field">
                  <label className="create-label">Status</label>
                  <select className="create-select" value={form.status} onChange={e => setInstant('status', e.target.value)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* ── URL divider ── */}
              <div className="edit-section-divider">
                <div className="edit-section-divider-line" />
                <div className="edit-section-divider-label"><i className="fa-solid fa-link" /> URL & CTA</div>
                <div className="edit-section-divider-line" />
              </div>

              {/* Slug */}
              <div className="create-field">
                <label className="create-label">URL Slug <span className="req">*</span></label>
                <div className="slug-row">
                  <div className="slug-input-wrap">
                    <span className="slug-prefix">/</span>
                    <input
                      className={`create-input slug-input${fieldErrors.slug ? ' error' : ''}`}
                      value={form.slug}
                      onChange={e => handleSlugChange(e.target.value)}
                    />
                    <span className={`slug-status${slugStatus === 'available' ? ' avail' : slugStatus === 'taken' ? ' taken' : ''}`}>
                      {slugStatus === 'checking'  && <div className="create-spinner-sm" />}
                      {slugStatus === 'available' && <i className="fa-solid fa-check" />}
                      {slugStatus === 'taken'     && <i className="fa-solid fa-xmark" />}
                    </span>
                  </div>
                </div>
                {fieldErrors.slug && <span className="field-err">{fieldErrors.slug}</span>}
                {slugStatus === 'available' && form.slug !== originalSlug && <span className="field-ok">Slug is available</span>}
              </div>

              {/* CTA + Channel link */}
              <div className="create-row-2">
                <div className="create-field">
                  <label className="create-label">CTA Button Text</label>
                  <input className="create-input" defaultValue={form.ctaText}
                    onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} />
                </div>
                <div className="create-field">
                  <label className="create-label">Channel Link <span className="req">*</span></label>
                  <input className={`create-input${fieldErrors.channelLink ? ' error' : ''}`} defaultValue={form.channelLink}
                    onChange={e => setForm(f => ({ ...f, channelLink: e.target.value }))} />
                  {fieldErrors.channelLink && <span className="field-err">{fieldErrors.channelLink}</span>}
                </div>
              </div>

              {/* ── Design divider ── */}
              <div className="edit-section-divider">
                <div className="edit-section-divider-line" />
                <div className="edit-section-divider-label"><i className="fa-solid fa-palette" /> Design</div>
                <div className="edit-section-divider-line" />
              </div>

              {/* Design */}
              <div className="create-field">
                <label className="create-label">Design Theme</label>
                <div className="design-grid">
                  {DESIGNS.map(d => (
                    <button
                      key={d.value}
                      type="button"
                      className={`design-thumb${form.design === d.value ? ' selected' : ''}`}
                      onClick={() => setInstant('design', d.value)}
                    >
                      <span className="design-thumb-emoji">{d.emoji}</span>
                      <span className="design-thumb-label">{d.label}</span>
                      {form.design === d.value && (
                        <span className="design-thumb-check"><i className="fa-solid fa-check" /></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Content divider ── */}
              <div className="edit-section-divider">
                <div className="edit-section-divider-line" />
                <div className="edit-section-divider-label"><i className="fa-solid fa-align-left" /> Content</div>
                <div className="edit-section-divider-line" />
              </div>

              {/* Descriptions */}
              <div className="create-field">
                <label className="create-label">Description <span className="req">*</span></label>
                <textarea className={`create-textarea${fieldErrors.description1 ? ' error' : ''}`} defaultValue={form.description1}
                  rows={3} onChange={e => setForm(f => ({ ...f, description1: e.target.value }))} />
                {fieldErrors.description1 && <span className="field-err">{fieldErrors.description1}</span>}
              </div>

              <div className="create-field">
                <label className="create-label">Description 2 <span className="optional">(optional)</span></label>
                <textarea className="create-textarea" defaultValue={form.description2} rows={2}
                  onChange={e => setForm(f => ({ ...f, description2: e.target.value }))} />
              </div>

              {/* ── Tracking divider ── */}
              <div className="edit-section-divider">
                <div className="edit-section-divider-line" />
                <div className="edit-section-divider-label"><i className="fa-solid fa-chart-line" /> Tracking</div>
                <div className="edit-section-divider-line" />
              </div>

              <div className="edit-tracking-wrap">
              {/* Tracking */}
              <div className="tracking-card">
                <div className="tracking-card-header">
                  <i className="fa-brands fa-meta" />
                  <div>
                    <div className="tracking-card-title">Meta Pixel</div>
                    <div className="tracking-card-sub">Facebook & Instagram Ads tracking</div>
                  </div>
                </div>
                <div className="create-field">
                  <label className="create-label">Pixel ID</label>
                  <input
                    className={`create-input${fieldErrors.metaPixelId ? ' error' : ''}`}
                    placeholder="e.g., 1234567890123456"
                    defaultValue={form.metaPixelId}
                    onChange={e => setForm(f => ({ ...f, metaPixelId: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                    maxLength={16}
                  />
                  {fieldErrors.metaPixelId
                    ? <span className="field-err">{fieldErrors.metaPixelId}</span>
                    : <span className="field-hint">15-16 digit number from Events Manager</span>
                  }
                </div>
              </div>

              <div className="tracking-card">
                <div className="tracking-card-header">
                  <i className="fa-brands fa-google" />
                  <div>
                    <div className="tracking-card-title">Google Tag</div>
                    <div className="tracking-card-sub">Google Analytics & Ads tracking</div>
                  </div>
                </div>
                <div className="create-field">
                  <label className="create-label">Tag ID <span className="optional">(optional)</span></label>
                  <input
                    className={`create-input${fieldErrors.googleTagId ? ' error' : ''}`}
                    placeholder="e.g., G-XXXXXXXXXX"
                    defaultValue={form.googleTagId}
                    onChange={e => setForm(f => ({ ...f, googleTagId: e.target.value }))}
                  />
                  {fieldErrors.googleTagId
                    ? <span className="field-err">{fieldErrors.googleTagId}</span>
                    : <span className="field-hint">Format: G-XXXXXXXXXX from Google Analytics</span>
                  }
                </div>
              </div>

              </div>{/* end edit-tracking-wrap */}

              {saveError && (
                <div className="create-error-box">
                  <i className="fa-solid fa-circle-exclamation" />
                  {saveError}
                </div>
              )}

            </form>
          </div>{/* end edit-form-col */}

          {/* ── Preview column ── */}
          <div className="create-preview-col">
            <div className="preview-sticky">
              <div className="preview-label-row">
                <span className="preview-section-label">
                  <i className="fa-solid fa-mobile-screen" /> Preview
                </span>
                <span className="preview-design-name">
                  {DESIGNS.find(d => d.value === form.design)?.emoji} {DESIGNS.find(d => d.value === form.design)?.label}
                </span>
              </div>
              <StablePreview data={preview} />
            </div>
          </div>{/* end create-preview-col */}

        </div>{/* end edit-body */}
      </div>{/* end create-main */}
    </div> 
  );
}