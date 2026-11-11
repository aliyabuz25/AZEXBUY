import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Article, Locale } from '../types';
import { MarkdownRenderer } from '../utils/markdownRenderer';

const BACKEND = '';

// ─── Share Modal ────────────────────────────────────────────────────────────────
interface ShareModalProps {
  article: Article;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ article, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Build a shareable URL — uses current origin + hash-based slug
  const shareUrl = `${window.location.origin}${window.location.pathname}#articles/${article.slug}`;
  const shareText = `${article.title} — AZEXBUY Trade Platform`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const platforms = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: 'fa-brands fa-whatsapp',
      color: 'bg-[#25D366] hover:bg-[#1ebe5d]',
      href: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: 'fa-brands fa-linkedin-in',
      color: 'bg-[#0A66C2] hover:bg-[#0958a8]',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      id: 'twitter',
      label: 'X / Twitter',
      icon: 'fa-brands fa-x-twitter',
      color: 'bg-black hover:bg-gray-900',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: 'fa-brands fa-telegram',
      color: 'bg-[#229ED9] hover:bg-[#1a8bbf]',
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      id: 'email',
      label: 'Email',
      icon: 'fa-solid fa-envelope',
      color: 'bg-slate-600 hover:bg-slate-700',
      href: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent('Read this article on AZEXBUY:\n\n' + shareUrl)}`,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: 'fa-brands fa-facebook-f',
      color: 'bg-[#1877F2] hover:bg-[#1565d0]',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
  ];

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape & Lock body scroll
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-brandNavy/10 flex items-center justify-center">
              <i className="fa-solid fa-share-nodes text-brandNavy text-sm"></i>
            </div>
            <h2 className="text-base font-extrabold text-gray-900">Share Article</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Article Preview */}
        <div className="flex gap-3 p-3 bg-slate-50 rounded-xl mb-5 border border-slate-200">
          {article.coverImage && (
            <img
              src={article.coverImage}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brandGreen">{article.category}</span>
            <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">{article.title}</p>
            <span className="text-[10px] text-slate-400">{article.author}</span>
          </div>
        </div>

        {/* Platform Buttons */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {platforms.map((p) => (
            <a
              key={p.id}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${p.color} text-white rounded-xl py-3 flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer`}
            >
              <i className={`${p.icon} text-lg`}></i>
              <span className="text-[10px] font-bold">{p.label}</span>
            </a>
          ))}
        </div>

        {/* Copy Link */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
          <div className="flex-1 min-w-0">
            <span className="block text-[10px] text-slate-400 font-medium mb-0.5">Article Link</span>
            <span className="block text-xs text-slate-700 font-medium truncate">{shareUrl}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              copied
                ? 'bg-brandGreen text-white'
                : 'bg-brandNavy hover:bg-brandNavyDark text-white'
            }`}
          >
            <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'} text-xs`}></i>
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
          >
            <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'} text-xs`}></i>
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Article Detail ─────────────────────────────────────────────────────────────
interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  onShare: (article: Article) => void;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onBack, onShare }) => {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Render markdown & BBCode content
  const renderContent = (text: string) => {
    return <MarkdownRenderer content={text} />;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-brandNavy hover:text-brandGreen mb-6 cursor-pointer transition-colors"
      >
        <i className="fa-solid fa-arrow-left text-xs"></i>
        <span>Back to Articles</span>
      </button>

      {/* Cover */}
      {article.coverImage && (
        <div className="rounded-2xl overflow-hidden h-64 sm:h-80 mb-6">
          <img
            src={article.coverImage}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-brandGreen bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
          {article.category}
        </span>
        {article.tags.map((tag) => (
          <span key={tag} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-brandNavy leading-tight mb-3">
        {article.title}
      </h1>

      <p className="text-sm text-gray-500 mb-2">
        <i className="fa-solid fa-user text-xs mr-1.5"></i>
        <span className="font-semibold text-gray-700">{article.author}</span>
        <span className="mx-2 text-gray-300">·</span>
        <i className="fa-regular fa-calendar text-xs mr-1.5"></i>
        {formatDate(article.createdAt)}
        <span className="mx-2 text-gray-300">·</span>
        <i className="fa-regular fa-eye text-xs mr-1.5"></i>
        {article.viewCount.toLocaleString()} views
      </p>

      <p className="text-base text-gray-600 font-medium leading-relaxed border-l-4 border-brandNavy pl-4 mb-6 italic">
        {article.summary}
      </p>

      {/* Share button */}
      <button
        type="button"
        onClick={() => onShare(article)}
        className="mb-8 inline-flex items-center gap-2 bg-brandNavy hover:bg-brandNavyDark text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer shadow-sm"
      >
        <i className="fa-solid fa-share-nodes"></i>
        <span>Share this Article</span>
      </button>

      {/* Content */}
      <div className="prose-custom">
        {renderContent(article.content)}
      </div>

      {/* Bottom share */}
      <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between">
        <span className="text-xs text-gray-400">Found this useful? Share it with your trade partners.</span>
        <button
          type="button"
          onClick={() => onShare(article)}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-brandNavy text-brandNavy text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer"
        >
          <i className="fa-solid fa-share-nodes text-xs"></i>
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

// ─── Article Card ────────────────────────────────────────────────────────────────
interface ArticleCardProps {
  article: Article;
  onRead: (article: Article) => void;
  onShare: (article: Article) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onRead, onShare }) => {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group flex flex-col">
      {/* Cover Image */}
      {article.coverImage ? (
        <div
          className="h-44 overflow-hidden cursor-pointer"
          onClick={() => onRead(article)}
        >
          <img
            src={article.coverImage}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div
          className="h-44 bg-gradient-to-br from-brandNavy to-blue-800 flex items-center justify-center cursor-pointer"
          onClick={() => onRead(article)}
        >
          <i className="fa-solid fa-newspaper text-4xl text-white/40"></i>
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-brandGreen bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            {article.category}
          </span>
          <span className="text-[10px] text-slate-400 ml-auto">{formatDate(article.createdAt)}</span>
        </div>

        <h3
          className="text-sm font-extrabold text-gray-900 leading-snug mb-2 cursor-pointer hover:text-brandNavy transition-colors line-clamp-2"
          onClick={() => onRead(article)}
        >
          {article.title}
        </h3>

        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1 mb-4">
          {article.summary}
        </p>

        <div className="flex items-center gap-2 mt-auto">
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <i className="fa-regular fa-eye"></i>
            <span>{article.viewCount.toLocaleString()}</span>
          </div>
          <div className="flex-1"></div>

          {/* Share Button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onShare(article); }}
            className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-brandNavy border border-slate-200 hover:border-brandNavy px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
          >
            <i className="fa-solid fa-share-nodes text-[10px]"></i>
            <span>Share</span>
          </button>

          {/* Read Button */}
          <button
            type="button"
            onClick={() => onRead(article)}
            className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-brandNavy hover:bg-brandNavyDark px-3 py-1.5 rounded-full transition-all cursor-pointer"
          >
            <span>Read</span>
            <i className="fa-solid fa-arrow-right text-[8px]"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ArticlesView ───────────────────────────────────────────────────────────
interface ArticlesViewProps {
  locale: Locale;
}

export const ArticlesView: React.FC<ArticlesViewProps> = ({ locale: _locale }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [shareTarget, setShareTarget] = useState<Article | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND}/api/articles`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: Article[] = await res.json();
      setArticles(data);
    } catch (err) {
      setError('Could not load articles. Make sure the backend is running on port 3500.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const categories = ['all', ...Array.from(new Set(articles.map((a) => a.category)))];

  const filtered = articles.filter((a) => {
    const matchesCat = categoryFilter === 'all' || a.category === categoryFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const handleRead = async (article: Article) => {
    // Fetch full article (also increments viewCount on backend)
    try {
      const res = await fetch(`${BACKEND}/api/articles/${article.slug}`);
      if (res.ok) {
        const full: Article = await res.json();
        setSelectedArticle(full);
      } else {
        setSelectedArticle(article);
      }
    } catch {
      setSelectedArticle(article);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedArticle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-8 bg-slate-50/60 min-h-[70vh]">
      <div className="custom-container space-y-6">

        {/* Detail View */}
        {selectedArticle ? (
          <ArticleDetail
            article={selectedArticle}
            onBack={handleBack}
            onShare={setShareTarget}
          />
        ) : (
          <>
            {/* Top Banner */}
            <div className="bg-brandNavy text-white rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Articles & Trade Insights
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
                  Market reports, commodity guides, export compliance, and Middle Corridor updates from the AZEXBUY editorial team.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold text-amber-300 tabular-nums">{articles.length}</span>
                <span className="text-xs text-slate-300">Published Articles</span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics, tags..."
                  className="w-full pl-8 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brandNavy/20 focus:border-brandNavy transition-colors"
                />
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      categoryFilter === cat
                        ? 'bg-brandNavy text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-brandNavy hover:text-brandNavy'
                    }`}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-3 text-slate-500">
                  <i className="fa-solid fa-spinner fa-spin text-brandNavy text-xl"></i>
                  <span className="text-sm font-medium">Loading articles...</span>
                </div>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <i className="fa-solid fa-triangle-exclamation text-red-400 text-2xl mb-2"></i>
                <p className="text-sm text-red-700 font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={fetchArticles}
                  className="mt-3 text-xs font-bold text-brandNavy hover:underline cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <i className="fa-solid fa-newspaper text-4xl mb-3"></i>
                <p className="text-sm font-medium">No articles found for this filter.</p>
              </div>
            )}

            {/* Grid */}
            {!loading && !error && filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onRead={handleRead}
                    onShare={setShareTarget}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Share Modal */}
      {shareTarget && (
        <ShareModal
          article={shareTarget}
          onClose={() => setShareTarget(null)}
        />
      )}
    </section>
  );
};
