// frontend/src/pages/CreatePage.jsx
import { useState, useRef, useEffect, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PhonePreview, { DESIGNS } from '../components/PhonePreview';
import { createLandingPage, clearCreateError } from '../store/landingSlice';
import { checkSlugAvailable } from '../services/landingService';
import { uploadToCloudinary } from '../services/uploadService';
import '../styles/CreatePage.css';

const initForm = {
  channelName: '', channelTitle: '', subscribers: '',
  slug: '', ctaText: 'Join on Telegram', channelLink: '',
  description1: '', description2: '',
  design: 'obsidian', metaPixelId: '', googleTagId: '',
  status: 'active', logoBase64: '', logoUrl: '',
};

const StablePreview = memo(({ data }) => <PhonePreview data={data} />);

export default function CreatePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isCreating, createError } = useSelector((s) => s.landing);
  const { user }             = useSelector((s) => s.auth);
  const { sidebarCollapsed } = useSelector((s) => s.ui);

  const [form, setFormState]   = useState(initForm);
  const formRef                = useRef(initForm);
  const [preview, setPreview]  = useState(initForm);
  const [slugStatus, setSlugStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const [fieldErrors, setFieldErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState('');
  const [activeSection, setActiveSection] = useState('basic'); // basic | design | tracking

  const fileRef      = useRef();
  const slugTimer    = useRef();
  const previewTimer = useRef();

  useEffect(() => { dispatch(clearCreateError()); }, [dispatch]);

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
        next.slug = val.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-');
        triggerSlugCheck(next.slug);
      }
      return next;
    });
  };

  const handleSlugChange = (val) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g,'');
    setFormState(prev => { const next = { ...prev, slug: clean }; formRef.current = next; return next; });
    triggerSlugCheck(clean);
  };

  const handleGenerateSlug = () => {
    const base = (formRef.current.channelName || 'page').toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-');
    const rand = base + '-' + Math.random().toString(36).substring(2,6);
    setFormState(prev => { const next = { ...prev, slug: rand }; formRef.current = next; return next; });
    triggerSlugCheck(rand);
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
    } catch (err) { alert('Upload failed: ' + err.message); }
  };

  const validate = () => {
    const f = formRef.current;
    const errs = {};
    if (!f.channelName.trim())            errs.channelName   = 'Required';
    if (!f.channelTitle.trim())           errs.channelTitle  = 'Required';
    if (!f.subscribers || isNaN(f.subscribers)) errs.subscribers = 'Enter valid number';
    if (!f.slug.trim())                   errs.slug          = 'Required';
    if (slugStatus === 'taken')           errs.slug          = 'Slug already taken';
    if (!f.channelLink.trim())            errs.channelLink   = 'Required';
    if (!f.description1.trim())           errs.description1  = 'Required';
    if (f.metaPixelId && !/^\d{15,16}$/.test(f.metaPixelId)) errs.metaPixelId = '15-16 digits';
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

  // Blocked
  if (user?.role !== 'admin' && user?.isApproved === false) {
    return (
      <div className="create-shell">
        <Sidebar />
        <div className="create-main" style={{ marginLeft: sidebarCollapsed ? 'var(--sb-collapsed,64px)' : 'var(--sb-width,220px)' }}>
          <div className="create-blocked">
            <div className="blocked-icon"><i className="fa-solid fa-clock" /></div>
            <div className="blocked-title">Approval Pending</div>
            <p className="blocked-desc">Your account is awaiting admin approval. Once approved, you'll be able to create landing pages.</p>
            <div className="blocked-status">⏳ Status: Pending Review</div>
            <button className="create-btn-ghost" onClick={() => navigate('/home')}>
              <i className="fa-solid fa-arrow-left" /> Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const marginLeft = sidebarCollapsed ? 'var(--sb-collapsed,64px)' : 'var(--sb-width,220px)';

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
            <div className="create-page-title">New Landing Page</div>
          </div>
          <button
            className="create-submit-btn"
            onClick={handleSubmit}
            disabled={isCreating}
          >
            {isCreating
              ? <><div className="create-spinner" /> Creating...</>
              : <><i className="fa-solid fa-rocket" /> Publish Page</>
            }
          </button>
        </div>

        {/* ── Body ── */}
        <div className="create-body">

          {/* ── Form column ── */}
          <div className="create-form-col">

            {/* Section tabs */}
            <div className="create-section-tabs">
              {[
                { id: 'basic',    icon: 'fa-solid fa-pen', label: 'Content' },
                { id: 'design',   icon: 'fa-solid fa-palette', label: 'Design' },
                { id: 'tracking', icon: 'fa-solid fa-chart-line', label: 'Tracking' },
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`create-tab${activeSection === tab.id ? ' active' : ''}`}
                  onClick={() => setActiveSection(tab.id)}
                >
                  <i className={tab.icon} />
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} noValidate className="create-form">

              {/* ── BASIC SECTION ── */}
              {activeSection === 'basic' && (
                <div className="create-section">

                  {/* Logo upload */}
                  <div className="logo-upload-wrap">
                    <div className="logo-upload" onClick={() => fileRef.current.click()}>
                      {logoPreview
                        ? <img src={logoPreview} alt="logo" className="logo-preview-img" />
                        : <div className="logo-placeholder">
                            <i className="fa-solid fa-image" />
                            <span>Upload Logo</span>
                            <span className="logo-hint">1:1 · max 5MB</span>
                          </div>
                      }
                    </div>
                    <div className="logo-upload-info">
                      <div className="logo-upload-title">Channel Logo</div>
                      <div className="logo-upload-sub">Square image recommended. Will appear in preview.</div>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                  </div>

                  {/* Row: Name + Title */}
                  <div className="create-row-2">
                    <div className="create-field">
                      <label className="create-label">Channel Name <span className="req">*</span></label>
                      <input className={`create-input${fieldErrors.channelName?' error':''}`} placeholder="e.g., MetaBull Official"
                        onChange={e => handleChannelNameChange(e.target.value)} />
                      {fieldErrors.channelName && <span className="field-err">{fieldErrors.channelName}</span>}
                    </div>
                    <div className="create-field">
                      <label className="create-label">Channel Title <span className="req">*</span></label>
                      <input className={`create-input${fieldErrors.channelTitle?' error':''}`} placeholder="e.g., Tech Reviews & Tutorials"
                        onChange={e => setForm(f => ({ ...f, channelTitle: e.target.value }))} />
                      {fieldErrors.channelTitle && <span className="field-err">{fieldErrors.channelTitle}</span>}
                    </div>
                  </div>

                  {/* Row: Subscribers + Status */}
                  <div className="create-row-2">
                    <div className="create-field">
                      <label className="create-label">Subscribers <span className="req">*</span></label>
                      <input className={`create-input${fieldErrors.subscribers?' error':''}`} placeholder="e.g., 128000" type="number"
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

                  {/* Slug */}
                  <div className="create-field">
                    <label className="create-label">URL Slug <span className="req">*</span></label>
                    <div className="slug-row">
                      <div className="slug-input-wrap">
                        <span className="slug-prefix">/</span>
                        <input
                          className={`create-input slug-input${fieldErrors.slug?' error':''}`}
                          placeholder="my-channel-page"
                          value={form.slug}
                          onChange={e => handleSlugChange(e.target.value)}
                        />
                        <span className={`slug-status${slugStatus==='available'?' avail':slugStatus==='taken'?' taken':''}`}>
                          {slugStatus==='checking' && <div className="create-spinner-sm" />}
                          {slugStatus==='available' && <i className="fa-solid fa-check" />}
                          {slugStatus==='taken'     && <i className="fa-solid fa-xmark" />}
                        </span>
                      </div>
                      <button type="button" className="slug-gen-btn" onClick={handleGenerateSlug}>Generate</button>
                    </div>
                    {fieldErrors.slug && <span className="field-err">{fieldErrors.slug}</span>}
                    {slugStatus==='available' && <span className="field-ok">Slug is available</span>}
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
                      <input className={`create-input${fieldErrors.channelLink?' error':''}`} placeholder="https://t.me/yourchannel"
                        onChange={e => setForm(f => ({ ...f, channelLink: e.target.value }))} />
                      {fieldErrors.channelLink && <span className="field-err">{fieldErrors.channelLink}</span>}
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="create-field">
                    <label className="create-label">Description <span className="req">*</span></label>
                    <textarea className={`create-textarea${fieldErrors.description1?' error':''}`} placeholder="Main channel description..."
                      rows={3} onChange={e => setForm(f => ({ ...f, description1: e.target.value }))} />
                    {fieldErrors.description1 && <span className="field-err">{fieldErrors.description1}</span>}
                  </div>

                  <div className="create-field">
                    <label className="create-label">Description 2 <span className="optional">(optional)</span></label>
                    <textarea className="create-textarea" placeholder="Additional info..." rows={2}
                      onChange={e => setForm(f => ({ ...f, description2: e.target.value }))} />
                  </div>
                </div>
              )}

              {/* ── DESIGN SECTION ── */}
              {activeSection === 'design' && (
                <div className="create-section">
                  <div className="section-heading">
                    <i className="fa-solid fa-swatchbook" />
                    Choose a design theme for your landing page
                  </div>
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
                          <span className="design-thumb-check">
                            <i className="fa-solid fa-check" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TRACKING SECTION ── */}
              {activeSection === 'tracking' && (
                <div className="create-section">
                  <div className="section-heading">
                    <i className="fa-solid fa-chart-line" />
                    Add tracking pixels to measure your page performance
                  </div>

                  <div className="tracking-card">
                    <div className="tracking-card-header">
                      <i className="fa-brands fa-meta" />
                      <div>
                        <div className="tracking-card-title">Meta Pixel</div>
                        <div className="tracking-card-sub">Facebook & Instagram Ads tracking</div>
                      </div>
                    </div>
                    <div className="create-field">
                      <label className="create-label">Pixel ID <span className="req">*</span></label>
                      <input className={`create-input${fieldErrors.metaPixelId?' error':''}`}
                        placeholder="e.g., 1234567890123456"
                        value={form.metaPixelId}
                        onChange={e => setForm(f => ({ ...f, metaPixelId: e.target.value.replace(/\D/g,'').slice(0,16) }))}
                        maxLength={16} />
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
                      <input className={`create-input${fieldErrors.googleTagId?' error':''}`}
                        placeholder="e.g., G-XXXXXXXXXX"
                        value={form.googleTagId}
                        onChange={e => setForm(f => ({ ...f, googleTagId: e.target.value }))} />
                      {fieldErrors.googleTagId
                        ? <span className="field-err">{fieldErrors.googleTagId}</span>
                        : <span className="field-hint">Format: G-XXXXXXXXXX from Google Analytics</span>
                      }
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {createError && (
                <div className="create-error-box">
                  <i className="fa-solid fa-circle-exclamation" />
                  {createError}
                </div>
              )}

            </form>
          </div>

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
          </div>

        </div>
      </div>
    </div>
  );
}