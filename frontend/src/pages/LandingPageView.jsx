import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPageBySlug } from '../services/landingService';
import styles from '../styles/LandingPageView.module.css';

// Design themes — same palette as PhonePreview
const THEMES = {
  'modern-blue':      { bg: 'linear-gradient(160deg,#e8f0fe 0%,#c7d7fd 100%)', card: '#fff', title: '#1a237e', sub: '#3949ab', text: '#374151', btn: 'linear-gradient(90deg,#3b82f6,#6366f1)', btnText: '#fff', subs: '#6366f1' },
  'dark-rose':        { bg: 'linear-gradient(160deg,#1a0a0f 0%,#2d0f1a 100%)', card: 'rgba(255,255,255,0.05)', title: '#fce7f3', sub: '#f9a8d4', text: '#fce7f3', btn: 'linear-gradient(90deg,#e11d48,#be185d)', btnText: '#fff', subs: '#f9a8d4' },
  'clean-minimal':    { bg: '#f9fafb', card: '#fff', title: '#111827', sub: '#6b7280', text: '#374151', btn: '#111827', btnText: '#fff', subs: '#6b7280' },
  'ocean':            { bg: 'linear-gradient(160deg,#0c4a6e 0%,#0e7490 100%)', card: 'rgba(255,255,255,0.1)', title: '#e0f2fe', sub: '#7dd3fc', text: '#e0f2fe', btn: 'linear-gradient(90deg,#0284c7,#0891b2)', btnText: '#fff', subs: '#7dd3fc' },
  'crypto-minimal':   { bg: 'linear-gradient(160deg,#0f0f1a 0%,#1a1a2e 100%)', card: 'rgba(255,255,255,0.04)', title: '#e2e8f0', sub: '#94a3b8', text: '#cbd5e1', btn: 'linear-gradient(90deg,#6366f1,#8b5cf6)', btnText: '#fff', subs: '#818cf8' },
  'neon-cyber':       { bg: 'linear-gradient(160deg,#050510 0%,#0d0d2b 100%)', card: 'rgba(99,102,241,0.08)', title: '#e0e7ff', sub: '#22d3ee', text: '#c7d2fe', btn: 'linear-gradient(90deg,#06b6d4,#6366f1)', btnText: '#fff', subs: '#22d3ee' },
  'glassmorphism':    { bg: 'linear-gradient(160deg,#312e81 0%,#4c1d95 100%)', card: 'rgba(255,255,255,0.12)', title: '#f5f3ff', sub: '#ddd6fe', text: '#ede9fe', btn: 'rgba(255,255,255,0.25)', btnText: '#fff', subs: '#ddd6fe' },
  'gray-minimal':     { bg: '#1a1a1a', card: '#242424', title: '#f5f5f5', sub: '#9ca3af', text: '#d1d5db', btn: '#f5f5f5', btnText: '#111', subs: '#9ca3af' },
  'vibrant-gradient': { bg: 'linear-gradient(160deg,#7c3aed 0%,#db2777 50%,#ea580c 100%)', card: 'rgba(255,255,255,0.15)', title: '#fff', sub: '#fde68a', text: '#fef3c7', btn: '#fff', btnText: '#7c3aed', subs: '#fde68a' },
  'serene-green':     { bg: 'linear-gradient(160deg,#064e3b 0%,#065f46 100%)', card: 'rgba(255,255,255,0.08)', title: '#d1fae5', sub: '#6ee7b7', text: '#a7f3d0', btn: 'linear-gradient(90deg,#10b981,#059669)', btnText: '#fff', subs: '#6ee7b7' },
  'sunset':           { bg: 'linear-gradient(160deg,#7c2d12 0%,#9a3412 50%,#92400e 100%)', card: 'rgba(255,255,255,0.1)', title: '#fef3c7', sub: '#fcd34d', text: '#fde68a', btn: 'linear-gradient(90deg,#f59e0b,#ef4444)', btnText: '#fff', subs: '#fcd34d' },
};

function formatSubs(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return Number(n).toLocaleString();
}

// Inject Meta Pixel
function injectMetaPixel(pixelId) {
  if (!pixelId || window._mbPixelDone) return;
  window._mbPixelDone = true;
  window.fbq = window.fbq || function () { (window.fbq.q = window.fbq.q || []).push(arguments); };
  window._fbq = window._fbq || window.fbq;
  window.fbq.loaded = true;
  window.fbq.version = '2.0';
  window.fbq.queue = [];
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
}

// Inject Google Tag
function injectGoogleTag(tagId) {
  if (!tagId || window._mbGtagDone) return;
  window._mbGtagDone = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', tagId);
}

export default function LandingPageView() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchPageBySlug(slug)
      .then(res => {
        setPage(res.page);
        // Inject tracking pixels after load
        if (res.page.metaPixelId) injectMetaPixel(res.page.metaPixelId);
        if (res.page.googleTagId) injectGoogleTag(res.page.googleTagId);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleCTA = () => {
    if (!page?.channelLink) return;
    // Fire pixel event on CTA click
    if (window.fbq) window.fbq('track', 'Lead');
    if (window.gtag) window.gtag('event', 'cta_click', { event_category: 'engagement', event_label: page.channelName });
    window.open(page.channelLink, '_blank', 'noopener,noreferrer');
  };

  if (loading) return (
    <div className={styles.fullPage} style={{ background: '#0d0d14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className={styles.loader} />
    </div>
  );

  if (notFound || !page) return (
    <div className={styles.fullPage} style={{ background: '#0d0d14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <span style={{ fontSize: 48 }}>🔍</span>
      <h2 style={{ color: '#f0f0f8', fontFamily: 'Syne, sans-serif', fontSize: 22 }}>Page not found</h2>
      <p style={{ color: '#55556a', fontSize: 14 }}>This landing page doesn't exist or has been disabled.</p>
    </div>
  );

  const t = THEMES[page.design] || THEMES['modern-blue'];

  return (
    <div className={styles.fullPage} style={{ background: t.bg }}>
      <div className={styles.phoneFrame}>
        <div className={styles.content}>
          {/* Logo */}
          <div className={styles.logoWrap} style={{ borderColor: t.subs + '55', background: t.card }}>
            {page.logoUrl
              ? <img src={page.logoUrl} alt={page.channelName} className={styles.logoImg} />
              : (
                <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke={t.sub} strokeWidth="1.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )
            }
          </div>

          {/* Channel info */}
          <p className={styles.channelName} style={{ color: t.sub }}>{page.channelName}</p>
          <h1 className={styles.channelTitle} style={{ color: t.title }}>{page.channelTitle}</h1>

          <div className={styles.subsRow} style={{ color: t.subs, background: t.card }}>
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            {formatSubs(page.subscribers)} Members
          </div>

          {/* Descriptions */}
          <p className={styles.desc} style={{ color: t.text }}>{page.description1}</p>
          {page.description2 && <p className={styles.desc} style={{ color: t.text, opacity: 0.75 }}>{page.description2}</p>}

          {/* Divider */}
          <div className={styles.divider} style={{ background: t.subs + '33' }} />

          {/* CTA button */}
          <button className={styles.ctaBtn} style={{ background: t.btn, color: t.btnText }} onClick={handleCTA}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.47l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.268.089z"/>
            </svg>
            {page.ctaText || 'Join on Telegram'}
          </button>

          {/* Disclaimer */}
          <p className={styles.disclaimer} style={{ color: t.text }}>
            Disclaimer: All content is for educational purposes only. {page.channelName} is not responsible for any financial decisions. Trading involves risk — please do your own research.
          </p>
        </div>
      </div>
    </div>
  );
}