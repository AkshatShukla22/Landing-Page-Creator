import styles from '../styles/PhonePreview.module.css';

export const DESIGNS = [
  { value: 'modern-blue',       label: 'Modern Blue',       emoji: '🧠' },
  { value: 'dark-rose',         label: 'Dark Rose',         emoji: '🌙' },
  { value: 'clean-minimal',     label: 'Clean Minimal',     emoji: '✨' },
  { value: 'ocean',             label: 'Ocean',             emoji: '🌊' },
  { value: 'crypto-minimal',    label: 'Crypto Minimal',    emoji: '💎' },
  { value: 'neon-cyber',        label: 'Neon Cyber',        emoji: '🌟' },
  { value: 'glassmorphism',     label: 'Glassmorphism',     emoji: '🫧' },
  { value: 'gray-minimal',      label: 'Gray Minimal',      emoji: '🌫' },
  { value: 'vibrant-gradient',  label: 'Vibrant Gradient',  emoji: '🌈' },
  { value: 'serene-green',      label: 'Serene Green',      emoji: '🌿' },
  { value: 'sunset',            label: 'Sunset',            emoji: '🌅' },
];

const DESIGN_STYLES = {
  'modern-blue': {
    bg: 'linear-gradient(160deg, #e8f0fe 0%, #c7d7fd 100%)',
    card: '#fff',
    title: '#1a237e',
    sub: '#3949ab',
    text: '#374151',
    btn: 'linear-gradient(90deg, #3b82f6, #6366f1)',
    btnText: '#fff',
    subscribers: '#6366f1',
    dot: '#3b82f6',
  },
  'dark-rose': {
    bg: 'linear-gradient(160deg, #1a0a0f 0%, #2d0f1a 100%)',
    card: 'rgba(255,255,255,0.05)',
    title: '#fce7f3',
    sub: '#f9a8d4',
    text: '#fce7f3',
    btn: 'linear-gradient(90deg, #e11d48, #be185d)',
    btnText: '#fff',
    subscribers: '#f9a8d4',
    dot: '#e11d48',
  },
  'clean-minimal': {
    bg: '#f9fafb',
    card: '#fff',
    title: '#111827',
    sub: '#6b7280',
    text: '#374151',
    btn: '#111827',
    btnText: '#fff',
    subscribers: '#6b7280',
    dot: '#111827',
  },
  'ocean': {
    bg: 'linear-gradient(160deg, #0c4a6e 0%, #0e7490 100%)',
    card: 'rgba(255,255,255,0.1)',
    title: '#e0f2fe',
    sub: '#7dd3fc',
    text: '#e0f2fe',
    btn: 'linear-gradient(90deg, #0284c7, #0891b2)',
    btnText: '#fff',
    subscribers: '#7dd3fc',
    dot: '#38bdf8',
  },
  'crypto-minimal': {
    bg: 'linear-gradient(160deg, #0f0f1a 0%, #1a1a2e 100%)',
    card: 'rgba(255,255,255,0.04)',
    title: '#e2e8f0',
    sub: '#94a3b8',
    text: '#cbd5e1',
    btn: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
    btnText: '#fff',
    subscribers: '#818cf8',
    dot: '#6366f1',
  },
  'neon-cyber': {
    bg: 'linear-gradient(160deg, #050510 0%, #0d0d2b 100%)',
    card: 'rgba(99,102,241,0.08)',
    title: '#e0e7ff',
    sub: '#22d3ee',
    text: '#c7d2fe',
    btn: 'linear-gradient(90deg, #06b6d4, #6366f1)',
    btnText: '#fff',
    subscribers: '#22d3ee',
    dot: '#06b6d4',
  },
  'glassmorphism': {
    bg: 'linear-gradient(160deg, #312e81 0%, #4c1d95 100%)',
    card: 'rgba(255,255,255,0.12)',
    title: '#f5f3ff',
    sub: '#ddd6fe',
    text: '#ede9fe',
    btn: 'rgba(255,255,255,0.25)',
    btnText: '#fff',
    subscribers: '#ddd6fe',
    dot: '#a78bfa',
  },
  'gray-minimal': {
    bg: '#1a1a1a',
    card: '#242424',
    title: '#f5f5f5',
    sub: '#9ca3af',
    text: '#d1d5db',
    btn: '#f5f5f5',
    btnText: '#111',
    subscribers: '#9ca3af',
    dot: '#6b7280',
  },
  'vibrant-gradient': {
    bg: 'linear-gradient(160deg, #7c3aed 0%, #db2777 50%, #ea580c 100%)',
    card: 'rgba(255,255,255,0.15)',
    title: '#fff',
    sub: '#fde68a',
    text: '#fef3c7',
    btn: '#fff',
    btnText: '#7c3aed',
    subscribers: '#fde68a',
    dot: '#fff',
  },
  'serene-green': {
    bg: 'linear-gradient(160deg, #064e3b 0%, #065f46 100%)',
    card: 'rgba(255,255,255,0.08)',
    title: '#d1fae5',
    sub: '#6ee7b7',
    text: '#a7f3d0',
    btn: 'linear-gradient(90deg, #10b981, #059669)',
    btnText: '#fff',
    subscribers: '#6ee7b7',
    dot: '#34d399',
  },
  'sunset': {
    bg: 'linear-gradient(160deg, #7c2d12 0%, #9a3412 50%, #92400e 100%)',
    card: 'rgba(255,255,255,0.1)',
    title: '#fef3c7',
    sub: '#fcd34d',
    text: '#fde68a',
    btn: 'linear-gradient(90deg, #f59e0b, #ef4444)',
    btnText: '#fff',
    subscribers: '#fcd34d',
    dot: '#fbbf24',
  },
};

function formatSubs(n) {
  if (!n || isNaN(n)) return '0';
  const num = parseInt(n);
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

export default function PhonePreview({ data }) {
  const {
    channelName = 'Channel Name',
    channelTitle = 'Channel Title',
    subscribers = 0,
    description1 = 'Channel description goes here.',
    description2 = '',
    ctaText = 'Join on Telegram',
    logoUrl = '',
    design = 'modern-blue',
  } = data || {};

  const ds = DESIGN_STYLES[design] || DESIGN_STYLES['modern-blue'];

  return (
    <div className={styles.phoneWrap}>
      <div className={styles.phone}>
        {/* Status bar */}
        <div className={styles.statusBar}>
          <span>9:41</span>
          <span className={styles.statusRight}>▲▲▲ WiFi 100%</span>
        </div>
        {/* Screen */}
        <div className={styles.screen} style={{ background: ds.bg }}>
          <div className={styles.content}>
            {/* Logo */}
            <div className={styles.logoWrap} style={{ borderColor: ds.dot + '44', background: ds.card }}>
              {logoUrl ? (
                <img src={logoUrl} alt="logo" className={styles.logoImg} />
              ) : (
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke={ds.sub} strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            {/* Channel info */}
            <p className={styles.channelName} style={{ color: ds.sub }}>{channelName || 'Channel Name'}</p>
            <h2 className={styles.channelTitle} style={{ color: ds.title }}>{channelTitle || 'Channel Title'}</h2>
            <div className={styles.subRow} style={{ color: ds.subscribers }}>
              <svg width="11" height="11" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              {formatSubs(subscribers)} Members
            </div>
            {/* Descriptions */}
            <p className={styles.desc} style={{ color: ds.text }}>{description1 || 'Channel description goes here.'}</p>
            {description2 && <p className={styles.desc2} style={{ color: ds.text }}>{description2}</p>}
            {/* CTA */}
            <button className={styles.cta} style={{ background: ds.btn, color: ds.btnText }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: ds.btnText, opacity: 0.7, flexShrink: 0 }} />
              {ctaText || 'Join on Telegram'}
            </button>
            {/* Disclaimer */}
            <p className={styles.disclaimer} style={{ color: ds.text, opacity: 0.45 }}>
              Disclaimer: All content is for educational purposes only. {channelName || 'Channel Name'} is not responsible for any financial decisions.
            </p>
          </div>
        </div>
        {/* Home bar */}
        <div className={styles.homeBar} />
      </div>
      <p className={styles.liveLabel}>LIVE PREVIEW</p>
    </div>
  );
}