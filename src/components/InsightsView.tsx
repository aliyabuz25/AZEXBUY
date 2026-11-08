import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Locale } from '../types';
import { MarkdownRenderer } from '../utils/markdownRenderer';

// ─── Types ───────────────────────────────────────────────────────────────────
interface AzArticle {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  coverImage: string;
  author: string;
  isPublished: boolean;
  publishedAt: string | null;
  isFeatured: boolean;
  viewCount: number;
  seoTitle?: string;
  seoDescription?: string;
}

// ─── Filter labels ────────────────────────────────────────────────────────────
const FILTER_LABELS = ['All', 'Export Guides', 'Market Research', 'Trade Terms', 'Regulations', 'Product Analysis'] as const;
type FilterLabel = typeof FILTER_LABELS[number];

// Map display labels → actual API categories
const FILTER_MAP: Record<FilterLabel, string | null> = {
  'All': null,
  'Export Guides': 'Export Guides',
  'Market Research': 'Market Research',
  'Trade Terms': 'Trade Terms',
  'Regulations': 'Regulations',
  'Product Analysis': 'Product Analysis',
};

// Locale-aware category labels
const CATEGORY_LABELS: Record<FilterLabel, Record<string, string>> = {
  'All':             { AZ: 'Hamısı', TR: 'Tümü', EN: 'All', RU: 'Все' },
  'Export Guides':   { AZ: 'İxracat məlumatları', TR: 'İhracat bilgileri', EN: 'Export Guides', RU: 'Экспортные гиды' },
  'Market Research': { AZ: 'Bazar araşdırmaları', TR: 'Pazar araştırmaları', EN: 'Market Research', RU: 'Исследования рынка' },
  'Trade Terms':     { AZ: 'Ticarət şərtləri', TR: 'Ticaret terimleri', EN: 'Trade Terms & Incoterms', RU: 'Торговые термины' },
  'Regulations':     { AZ: 'Mevzuat', TR: 'Mevzuat ve gümrük', EN: 'Regulations & Customs', RU: 'Нормативы и таможня' },
  'Product Analysis':{ AZ: 'Məhsul analizləri', TR: 'Ürün analizleri', EN: 'Product & Sector Analysis', RU: 'Анализ продуктов' },
};

const CATEGORY_ICONS: Record<FilterLabel, string> = {
  'All':             'fa-solid fa-border-all',
  'Export Guides':   'fa-solid fa-box-open',
  'Market Research': 'fa-solid fa-magnifying-glass-chart',
  'Trade Terms':     'fa-solid fa-file-contract',
  'Regulations':     'fa-solid fa-building-columns',
  'Product Analysis':'fa-solid fa-chart-pie',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateLong(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function readingMins(text: string): number {
  return Math.max(1, Math.ceil((text?.trim().split(/\s+/).length || 0) / 200));
}

function stripBBCode(t: string) {
  return (t || '').replace(/\[\/?\w+[^\]]*\]/g, '').trim();
}

function exc(text: string, max = 110) {
  const c = stripBBCode(text);
  return c.length > max ? c.slice(0, max).trimEnd() + '…' : c;
}

// ─── BBCode & Markdown renderer ──────────────────────────────────────────────
function renderBBCode(text: string): React.ReactNode {
  if (!text) return null;
  return <MarkdownRenderer content={text} />;
}

// ─── Share Modal ──────────────────────────────────────────────────────────────
const ShareModal: React.FC<{ article: AzArticle; onClose: () => void }> = ({ article, onClose }) => {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}${window.location.pathname}#insights/${article.slug}`;
  const text = `${article.title} — AZEXBUY`;

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); } catch {
      const el = document.createElement('textarea');
      el.value = url; document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  const platforms = [
    { label: 'LinkedIn', icon: 'fa-brands fa-linkedin-in', bg: '#0A66C2', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { label: 'X', icon: 'fa-brands fa-x-twitter', bg: '#000', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
    { label: 'WhatsApp', icon: 'fa-brands fa-whatsapp', bg: '#25D366', href: `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}` },
    { label: 'Telegram', icon: 'fa-brands fa-telegram', bg: '#229ED9', href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
    { label: 'Email', icon: 'fa-solid fa-envelope', bg: '#4B5563', href: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}` },
    { label: 'Facebook', icon: 'fa-brands fa-facebook-f', bg: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#17231D' }}>Share Article</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: '#F8F8F3' }}>
            <i className="fa-solid fa-xmark" style={{ fontSize: '11px', color: '#7C857D' }}></i>
          </button>
        </div>
        {article.coverImage && (
          <div className="flex gap-3 items-center rounded-xl p-3 mb-5" style={{ backgroundColor: '#F8F8F3' }}>
            <img src={article.coverImage} alt="" referrerPolicy="no-referrer" className="w-11 h-11 rounded-lg object-cover shrink-0" />
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#17231D', lineHeight: 1.4 }} className="line-clamp-2">{article.title}</p>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {platforms.map((p) => (
            <a key={p.label} href={p.href} target="_blank" rel="noopener noreferrer"
              className="text-white rounded-xl py-2.5 flex flex-col items-center gap-1.5 cursor-pointer transition-opacity hover:opacity-85"
              style={{ backgroundColor: p.bg }}>
              <i className={`${p.icon}`} style={{ fontSize: '16px' }}></i>
              <span style={{ fontSize: '9px', fontWeight: 700 }}>{p.label}</span>
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl p-2.5" style={{ backgroundColor: '#F8F8F3' }}>
          <span className="truncate flex-1 font-medium" style={{ fontSize: '9px', color: '#7C857D' }}>{url}</span>
          <button onClick={copy} className="shrink-0 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
            style={{ backgroundColor: copied ? '#00382D' : '#17231D', color: '#fff', fontSize: '11px', fontWeight: 700 }}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Article Detail ───────────────────────────────────────────────────────────
const ArticleDetail: React.FC<{
  article: AzArticle;
  onBack: () => void;
  onShare: (a: AzArticle) => void;
}> = ({ article, onBack, onShare }) => {
  const mins = readingMins(article.content || article.summary || '');
  return (
    <div style={{ backgroundColor: '#F8F8F3', minHeight: '100vh' }}>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E8EAE3', position: 'sticky', top: 0, zIndex: 30 }}>
        <div className="custom-container" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
          <div className="flex items-center gap-2 min-w-0" style={{ fontSize: '12px' }}>
            <button onClick={onBack} className="flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
              style={{ color: '#7C857D', fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#17231D'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#7C857D'}>
              <i className="fa-solid fa-arrow-left" style={{ fontSize: '10px' }}></i>
              <span>Insights</span>
            </button>
            <span style={{ color: '#E8EAE3', flexShrink: 0 }}>/</span>
            <span className="truncate" style={{ color: '#17231D', fontWeight: 600, minWidth: 0 }}>{article.title}</span>
          </div>
        </div>
      </div>

      <div className="custom-container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: 'clamp(20px,4vw,48px)', paddingBottom: 'clamp(32px,6vw,64px)' }}>
        <div className="mb-5">
          <span className="rounded-full" style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#00382D', backgroundColor: '#D9F6B5', padding: '4px 12px' }}>
            {article.category}
          </span>
        </div>
        <h1 className="font-serif" style={{ fontSize: 'clamp(28px,5vw,42px)', color: '#17231D', lineHeight: 1.15, marginBottom: '16px', letterSpacing: '-0.02em' }}>
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4" style={{ fontSize: '13px', color: '#7C857D', marginBottom: '24px' }}>
          <span style={{ fontWeight: 600, color: '#17231D' }}>{article.author}</span>
          <span>·</span>
          <span>{fmtDateLong(article.publishedAt || article.createdAt)}</span>
          <span>·</span>
          <span>{mins} min read</span>
          {article.viewCount > 0 && <><span>·</span><span>{article.viewCount.toLocaleString()} views</span></>}
        </div>
        {article.summary && (
          <p className="font-medium italic" style={{ fontSize: '16px', color: 'rgba(23,35,29,0.7)', lineHeight: 1.65, borderLeft: '3px solid #B8F46A', paddingLeft: '20px', paddingTop: '8px', paddingBottom: '8px', marginBottom: '28px', backgroundColor: '#f4faf2', borderRadius: '0 8px 8px 0' }}>
            {article.summary}
          </p>
        )}
        <button onClick={() => onShare(article)} className="inline-flex items-center gap-2 rounded-full cursor-pointer transition-colors mb-8"
          style={{ backgroundColor: '#00382D', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '10px 20px' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#002C23'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#00382D'}>
          <i className="fa-solid fa-share-nodes" style={{ fontSize: '10px' }}></i>
          <span>Share</span>
        </button>
        {article.coverImage && (
          <div className="rounded-2xl overflow-hidden mb-8 shadow-sm" style={{ aspectRatio: '16/7' }}>
            <img src={article.coverImage} alt={article.title} referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-cover" />
          </div>
        )}
        <div>{article.content ? renderBBCode(article.content) : <p style={{ fontSize: '15px', color: 'rgba(23,35,29,0.7)', lineHeight: 1.7 }}>{article.summary}</p>}</div>
        <div className="flex items-center justify-between" style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #E8EAE3' }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#17231D', marginBottom: '2px' }}>Found this useful?</p>
            <p style={{ fontSize: '11px', color: '#7C857D' }}>Share it with your trade partners.</p>
          </div>
          <button onClick={() => onShare(article)} className="inline-flex items-center gap-2 rounded-full cursor-pointer transition-colors"
            style={{ border: '1px solid #E8EAE3', color: '#17231D', fontSize: '13px', fontWeight: 600, padding: '10px 20px', backgroundColor: '#fff' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#00382D'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#E8EAE3'}>
            <i className="fa-solid fa-share-nodes" style={{ fontSize: '12px', color: '#00382D' }}></i>
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── LEFT: Featured Card (large, image-bg, ~400–450px) ───────────────────────
const FeaturedCard: React.FC<{
  article: AzArticle;
  onRead: (a: AzArticle) => void;
  onShare: (a: AzArticle) => void;
}> = ({ article, onRead, onShare }) => {
  return (
    <article
      onClick={() => onRead(article)}
      className="relative overflow-hidden cursor-pointer group"
      style={{
        borderRadius: '10px',
        height: '425px',
        backgroundColor: '#00382D',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {/* Background image */}
      {article.coverImage && (
        <img
          src={article.coverImage}
          alt={article.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ opacity: 0.55 }}
        />
      )}

      {/* Gradient overlay — dark at bottom */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,25,15,0.98) 0%, rgba(0,30,18,0.65) 42%, rgba(0,30,18,0.08) 100%)' }}
      />

      {/* Top-left category label */}
      <div className="absolute top-4 left-4 z-10">
        <span className="rounded-full" style={{
          fontSize: '10px', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase',
          color: '#00382D', backgroundColor: '#B8F46A', padding: '3px 10px',
        }}>
          {article.category}
        </span>
      </div>

      {/* Bottom content */}
      <div className="relative z-10" style={{ padding: '0 24px 24px' }}>
        <h2 className="font-serif text-white" style={{
          fontSize: 'clamp(18px,2.2vw,24px)',
          lineHeight: 1.2,
          marginBottom: '8px',
          letterSpacing: '-0.01em',
        }}>
          {article.title}
        </h2>
        {article.summary && (
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: '16px' }} className="line-clamp-2">
            {article.summary}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onRead(article); }}
            className="inline-flex items-center gap-1.5 rounded-full cursor-pointer transition-colors"
            style={{ backgroundColor: '#fff', color: '#00382D', fontSize: '11px', fontWeight: 800, padding: '7px 16px' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#F8F8F3'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#fff'}
          >
            <span>Read more</span>
            <i className="fa-solid fa-arrow-right" style={{ fontSize: '8px' }}></i>
          </button>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{fmtDate(article.publishedAt || article.createdAt)}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onShare(article); }}
            className="ml-auto rounded-full flex items-center justify-center cursor-pointer transition-colors"
            style={{ width: '28px', height: '28px', backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.22)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.12)'}
            title="Share"
          >
            <i className="fa-solid fa-share-nodes" style={{ fontSize: '10px' }}></i>
          </button>
        </div>
      </div>
    </article>
  );
};

// ─── RIGHT: Side Card (horizontal, thumbnail left + text right, ~115px high) ──
const SideCard: React.FC<{
  article: AzArticle;
  onRead: (a: AzArticle) => void;
  onShare: (a: AzArticle) => void;
  showDivider: boolean;
}> = ({ article, onRead, onShare, showDivider }) => {
  return (
    <div>
      <article
        onClick={() => onRead(article)}
        className="flex gap-3 cursor-pointer group"
        style={{ padding: '14px 0', alignItems: 'flex-start' }}
      >
        {/* Thumbnail — 120×90px */}
        <div
          className="shrink-0 overflow-hidden"
          style={{ width: 'clamp(80px,20vw,120px)', height: 'clamp(60px,15vw,90px)', borderRadius: '8px', backgroundColor: '#E8EAE3' }}
        >
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,56,45,0.08)' }}>
              <i className="fa-solid fa-newspaper" style={{ fontSize: '20px', color: 'rgba(0,56,45,0.25)' }}></i>
            </div>
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0" style={{ paddingTop: '2px' }}>
          <span style={{
            fontSize: '9px', fontWeight: 800, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#00382D', display: 'block', marginBottom: '5px',
          }}>
            {article.category}
          </span>
          <h3
            className="font-serif group-hover:text-[#00382D] transition-colors line-clamp-3"
            style={{ fontSize: '13px', lineHeight: 1.3, color: '#17231D', marginBottom: '8px', letterSpacing: '-0.01em' }}
          >
            {article.title}
          </h3>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: '10px', color: '#7C857D' }}>
              {fmtDate(article.publishedAt || article.createdAt)}
              {article.author && <> · {article.author}</>}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onShare(article); }}
              className="cursor-pointer transition-colors"
              style={{ color: '#7C857D', fontSize: '10px', padding: '2px 4px' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#00382D'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#7C857D'}
              title="Share"
            >
              <i className="fa-solid fa-share-nodes"></i>
            </button>
          </div>
        </div>
      </article>
      {showDivider && <div style={{ borderBottom: '1px solid #E8EAE3' }} />}
    </div>
  );
};

// ─── Standard Grid Card (for "More Reports") ──────────────────────────────────
const GridCard: React.FC<{
  article: AzArticle;
  onRead: (a: AzArticle) => void;
  onShare: (a: AzArticle) => void;
}> = ({ article, onRead, onShare }) => (
  <article className="group flex flex-col h-full">
    <div
      className="overflow-hidden cursor-pointer mb-3 shrink-0"
      style={{ borderRadius: '8px', aspectRatio: '16/9', backgroundColor: '#E8EAE3' }}
      onClick={() => onRead(article)}
    >
      {article.coverImage ? (
        <img src={article.coverImage} alt={article.title} referrerPolicy="no-referrer" loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,56,45,0.08)' }}>
          <i className="fa-solid fa-newspaper" style={{ fontSize: '28px', color: 'rgba(0,56,45,0.2)' }}></i>
        </div>
      )}
    </div>
    <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#00382D', display: 'block', marginBottom: '6px' }}>
      {article.category}
    </span>
    <h3
      className="font-serif group-hover:text-[#00382D] transition-colors line-clamp-3 cursor-pointer flex-1"
      style={{ fontSize: '15px', lineHeight: 1.3, color: '#17231D', marginBottom: '8px', letterSpacing: '-0.01em' }}
      onClick={() => onRead(article)}
    >
      {article.title}
    </h3>
    <p className="line-clamp-2" style={{ fontSize: '12px', color: '#7C857D', lineHeight: 1.55, marginBottom: '12px' }}>
      {article.summary || exc(article.content)}
    </p>
    <div className="flex items-center justify-between mt-auto" style={{ paddingTop: '10px', borderTop: '1px solid #E8EAE3' }}>
      <span style={{ fontSize: '10px', color: '#7C857D' }}>{fmtDate(article.publishedAt || article.createdAt)}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => onShare(article)} className="cursor-pointer transition-colors"
          style={{ fontSize: '10px', color: '#7C857D' }} title="Share"
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#00382D'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#7C857D'}>
          <i className="fa-solid fa-share-nodes"></i>
        </button>
        <button onClick={() => onRead(article)} className="inline-flex items-center gap-1 cursor-pointer transition-colors"
          style={{ fontSize: '10px', fontWeight: 800, color: '#00382D' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#002C23'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#00382D'}>
          <span>Read more</span>
          <i className="fa-solid fa-arrow-right" style={{ fontSize: '8px' }}></i>
        </button>
      </div>
    </div>
  </article>
);

// ─── Main InsightsView ────────────────────────────────────────────────────────
interface InsightsViewProps { locale: Locale; onNavigateHome?: () => void; }
const PAGE_SIZE = 6;

export const InsightsView: React.FC<InsightsViewProps> = ({ locale, onNavigateHome }) => {
  const loc = locale || 'EN';
  const [articles, setArticles] = useState<AzArticle[]>([]);
  const [featured, setFeatured] = useState<AzArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<AzArticle | null>(null);
  const [shareTarget, setShareTarget] = useState<AzArticle | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterLabel>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [ar, fr] = await Promise.all([
        fetch('/api/azexbuy/articles?limit=100'),
        fetch('/api/azexbuy/articles/featured'),
      ]);
      if (!ar.ok) throw new Error('API error');
      setArticles(await ar.json());
      if (fr.ok) { const f = await fr.json(); setFeatured(f || null); }
    } catch { setError('Could not load articles. Please try again.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRead = async (article: AzArticle) => {
    try {
      const res = await fetch(`/api/azexbuy/articles/${article.slug}`);
      setSelectedArticle(res.ok ? await res.json() : article);
    } catch { setSelectedArticle(article); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => { setSelectedArticle(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // Filter
  const catFilter = FILTER_MAP[activeFilter];
  const filtered = articles.filter(a => {
    const mc = !catFilter || a.category === catFilter;
    const q = searchQuery.trim().toLowerCase();
    const ms = !q || a.title.toLowerCase().includes(q) || (a.summary || '').toLowerCase().includes(q);
    return mc && ms;
  });

  const showFeaturedHero = activeFilter === 'All' && !searchQuery && !!featured;
  // Right: up to 3 side articles (excluding featured)
  const sideArticles = showFeaturedHero
    ? filtered.filter(a => a.id !== featured!.id).slice(0, 3)
    : [];
  // Grid: remaining after featured + side
  const usedIds = new Set([...(showFeaturedHero ? [featured!.id] : []), ...sideArticles.map(a => a.id)]);
  const gridArticles = filtered.filter(a => !usedIds.has(a.id));
  const visibleGrid = gridArticles.slice(0, visibleCount);

  if (selectedArticle) {
    return (
      <>
        <ArticleDetail article={selectedArticle} onBack={handleBack} onShare={setShareTarget} />
        {shareTarget && <ShareModal article={shareTarget} onClose={() => setShareTarget(null)} />}
      </>
    );
  }

  return (
    <div style={{ backgroundColor: '#F8F8F3', minHeight: '100vh' }}>

      {/* ═══════════════════════════════════════════
          1. COMPACT DARK GREEN NAV — 40px high
      ═══════════════════════════════════════════ */}
      <nav style={{ backgroundColor: '#00382D', height: '44px' }} className="flex items-center">
        <div className="custom-container w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center" style={{ gap: '10px' }}>
              <span className="font-serif text-white shrink-0" style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.03em' }}>
                AZEXBUY
              </span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>·</span>
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.04em' }}>
                {loc === 'AZ' ? 'Analitika' : loc === 'TR' ? 'Analitik' : loc === 'RU' ? 'Аналитика' : 'Insights'}
              </span>
            </div>
            <button
              type="button"
              onClick={onNavigateHome}
              style={{
                fontSize: '11px', fontWeight: 500,
                color: 'rgba(255,255,255,0.6)',
                background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                padding: '0',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}
            >
              <i className="fa-solid fa-arrow-left" style={{ fontSize: '9px' }}></i>
              {loc === 'AZ' ? 'Ana Səhifə' : loc === 'TR' ? 'Ana Sayfa' : loc === 'RU' ? 'Главная' : 'Home'}
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          2. HERO — ~200px, dark green, 2-column
      ═══════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#00382D', display: 'flex', alignItems: 'center' }}>
        <div className="custom-container w-full" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
          <div className="flex flex-col lg:flex-row lg:items-center" style={{ gap: '24px' }}>

            {/* Left — large serif headline */}
            <div style={{ flex: '1 1 0', minWidth: 0 }}>
<h1 className="font-serif text-white" style={{
                fontSize: 'clamp(24px,3.5vw,42px)',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                margin: 0,
              }}>
                {loc === 'AZ'
                  ? <>{`Azərbaycan ixracatı üzrə`}<br />{`bilik və `}<span style={{ color: '#B8F46A' }}>analitika</span></>
                  : loc === 'TR'
                  ? <>{`Azerbaycan ticareti üzerine`}<br />{`bilgi ve `}<span style={{ color: '#B8F46A' }}>analitik</span></>
                  : loc === 'RU'
                  ? <>{`Знания и аналитика`}<br />{`по `}<span style={{ color: '#B8F46A' }}>азербайджанской торговле</span></>
                  : <>{`Azerbaijan trade`}<br />{`knowledge & `}<span style={{ color: '#B8F46A' }}>insights</span></>
                }
              </h1>
            </div>

            {/* Right — small desc, hidden on mobile */}
            <div className="hidden lg:block" style={{ width: '280px', flexShrink: 0 }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: '16px' }}>
                {loc === 'AZ' ? 'Azərbaycan ixracat dəhlizləri, beynəlxalq satınalma və qlobal ticarət bazarı üzrə ekspert analitikası.' : loc === 'TR' ? "Azerbaycan ihracat koridorları, uluslararası satın alma ve küresel ticaret pazarı üzerine uzman analizi." : loc === 'RU' ? 'Экспертная аналитика по экспортным коридорам Азербайджана, международным закупкам и мировым торговым рынкам.' : "Expert analysis on Azerbaijan's export corridors, international procurement insights, and global trade market intelligence."}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => searchRef.current?.focus()}
                  className="rounded-full cursor-pointer transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: 600, padding: '6px 16px', backgroundColor: 'rgba(255,255,255,0.07)', letterSpacing: '0.01em' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.13)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.07)'}>
                  {loc === 'AZ' ? 'Məqalələrə bax' : loc === 'TR' ? 'Makalelere göz at' : loc === 'RU' ? 'Смотреть статьи' : 'Explore articles'}
                </button>
                <div
                  className="rounded-full flex items-center justify-center cursor-pointer"
                  style={{ width: '28px', height: '28px', border: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.6)' }}
                  onClick={() => searchRef.current?.focus()}>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: '10px' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CONTENT AREA
      ═══════════════════════════════════════════ */}
      <div style={{ backgroundColor: '#F8F8F3' }}>
        <div className="custom-container" style={{ paddingTop: '28px', paddingBottom: '48px' }}>

          {/* ── Section heading + subtitle + search + filters ── */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 className="font-serif" style={{ fontSize: 'clamp(26px,3vw,36px)', color: '#17231D', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              {loc === 'AZ' ? 'Beynəlxalq ticarət haqqında məlumat və analitika mərkəzi' : loc === 'TR' ? 'Uluslararası ticaret hakkında bilgi ve analitik merkezi' : loc === 'RU' ? 'Аналитический центр о международной торговле' : 'International Trade Knowledge & Analytics Hub'}
            </h2>
            <p style={{ fontSize: '12px', color: '#7C857D', marginBottom: '18px' }}>
              {loc === 'AZ' ? 'İxracatçılar, istehsalçılar və beynəlxalq alıcılar üçün praktik bilgilər' : loc === 'TR' ? 'İhracatçılar, üreticiler ve uluslararası alıcılar için pratik bilgiler' : loc === 'RU' ? 'Практические знания для экспортёров, производителей и международных покупателей' : 'Practical knowledge for exporters, producers and international buyers'}
            </p>

            {/* Search — hidden when not needed but functional */}
            <div style={{ maxWidth: '340px', margin: '0 auto 16px' }}>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#7C857D' }}></i>
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setVisibleCount(PAGE_SIZE); setActiveFilter('All'); }}
                  placeholder={loc === 'AZ' ? 'Məqalə axtar...' : loc === 'TR' ? 'Makale ara...' : loc === 'RU' ? 'Поиск статей...' : 'Search articles...'}
                  style={{
                    width: '100%', paddingLeft: '36px', paddingRight: searchQuery ? '36px' : '14px',
                    paddingTop: '8px', paddingBottom: '8px',
                    fontSize: '12px', borderRadius: '999px',
                    border: '1px solid #E8EAE3', backgroundColor: '#fff',
                    color: '#17231D', outline: 'none', boxSizing: 'border-box',
                  }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#7C857D', background: 'none', border: 'none', fontSize: '11px' }}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Filter pills — ~280px wide × 30px high */}
            <div style={{
              display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px',
              backgroundColor: '#EDEEE8', borderRadius: '999px',
              padding: '3px',
            }}>
              {FILTER_LABELS.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => { setActiveFilter(f); setVisibleCount(PAGE_SIZE); setSearchQuery(''); }}
                  style={{
                    fontSize: '11px', fontWeight: activeFilter === f ? 600 : 400,
                    padding: '0 10px', height: '24px', borderRadius: '999px',
                    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                    backgroundColor: activeFilter === f ? '#fff' : 'transparent',
                    color: activeFilter === f ? '#17231D' : '#7C857D',
                    boxShadow: activeFilter === f ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px',
                  }}>
                  <i className={CATEGORY_ICONS[f]} style={{ fontSize: '9px' }}></i>
                  {CATEGORY_LABELS[f][loc] || f}
                </button>
              ))}
            </div>
          </div>

          {/* ── States ── */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '20px', color: '#00382D', marginRight: '10px' }}></i>
              <span style={{ fontSize: '13px', color: '#7C857D' }}>Loading reports...</span>
            </div>
          )}

          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <p style={{ fontSize: '13px', color: '#7C857D', marginBottom: '12px' }}>{error}</p>
              <button onClick={fetchData} style={{ fontSize: '11px', fontWeight: 700, color: '#00382D', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}>Retry</button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#17231D', marginBottom: '8px' }}>No articles found</p>
              <button onClick={() => { setActiveFilter('All'); setSearchQuery(''); }}
                style={{ fontSize: '11px', fontWeight: 700, color: '#00382D', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}>
                Show all
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              ASYMMETRIC GRID: 52% left + 48% right
          ═══════════════════════════════════════════ */}
          {!loading && !error && filtered.length > 0 && (
            <>
              {showFeaturedHero && (
                <div className="flex flex-col lg:flex-row" style={{ gap: '18px', marginBottom: '36px' }}>
                  {/* LEFT — full width on mobile, 52% on desktop */}
                  <div className="w-full lg:w-[52%] lg:flex-shrink-0">
                    <FeaturedCard article={featured!} onRead={handleRead} onShare={setShareTarget} />
                  </div>
                  {/* RIGHT — side cards */}
                  {sideArticles.length > 0 && (
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      {sideArticles.map((a, i) => (
                        <SideCard
                          key={a.id}
                          article={a}
                          onRead={handleRead}
                          onShare={setShareTarget}
                          showDivider={i < sideArticles.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* More reports grid */}
              {visibleGrid.length > 0 && (
                <div>
                  {showFeaturedHero && (
                    <div className="flex items-center gap-4" style={{ marginBottom: '24px' }}>
                      <h3 className="font-serif" style={{ fontSize: '18px', color: '#17231D', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>More Reports</h3>
                      <div style={{ flex: 1, borderTop: '1px solid #E8EAE3' }}></div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '20px 24px' }}>
                    {visibleGrid.map(a => (
                      <GridCard key={a.id} article={a} onRead={handleRead} onShare={setShareTarget} />
                    ))}
                  </div>
                  {visibleCount < gridArticles.length && (
                    <div style={{ textAlign: 'center', marginTop: '48px' }}>
                      <button
                        onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                        className="inline-flex items-center gap-2 rounded-full cursor-pointer transition-all"
                        style={{ border: '1px solid #E8EAE3', color: '#17231D', fontSize: '13px', fontWeight: 600, padding: '12px 28px', backgroundColor: '#fff' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#00382D'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#E8EAE3'}>
                        <span>Load more reports</span>
                        <span style={{ fontSize: '11px', color: '#7C857D' }}>({gridArticles.length - visibleCount})</span>
                        <i className="fa-solid fa-chevron-down" style={{ fontSize: '10px' }}></i>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Resources block */}
          {!loading && !error && (
            <div className="rounded-2xl" style={{ backgroundColor: '#00382D', padding: 'clamp(20px,4vw,32px) clamp(16px,4vw,36px)', marginTop: '36px' }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ gap: '20px' }}>
                <div>
                  <h3 className="font-serif text-white" style={{ fontSize: '18px', letterSpacing: '-0.01em', marginBottom: '4px' }}>Useful Trade Resources</h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>Official international trade reference links</p>
                </div>
                <div className="flex flex-wrap" style={{ gap: '10px' }}>
                  {[
                    { label: 'Incoterms® 2020', href: 'https://iccwbo.org/resources-for-business/incoterms-rules/incoterms-2020/' },
                    { label: 'HS Code Search', href: 'https://www.wcoomd.org/en/topics/nomenclature/instrument-and-tools/hs-nomenclature-2022-edition.aspx' },
                    { label: 'AQTA Azerbaijan', href: 'https://aqta.gov.az' },
                  ].map(item => (
                    <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full cursor-pointer transition-colors"
                      style={{ border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 700, padding: '7px 16px', backgroundColor: 'rgba(255,255,255,0.07)' }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#B8F46A'; el.style.color = '#B8F46A'; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.18)'; el.style.color = 'rgba(255,255,255,0.7)'; }}>
                      {item.label}
                      <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '8px', opacity: 0.6 }}></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {shareTarget && <ShareModal article={shareTarget} onClose={() => setShareTarget(null)} />}
    </div>
  );
};
