import React, { useState, useRef, useCallback } from 'react';

// ─── BBCode → HTML ────────────────────────────────────────────────────────────
export function bbcodeToHtml(input: string): string {
  if (!input) return '';
  let html = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headings (BBCode & Markdown)
    .replace(/\[h1\]([\s\S]*?)\[\/h1\]/gi, '<h1 style="font-size:1.8em;font-weight:700;margin:.6em 0;line-height:1.2">$1</h1>')
    .replace(/\[h2\]([\s\S]*?)\[\/h2\]/gi, '<h2 style="font-size:1.4em;font-weight:700;margin:.5em 0;line-height:1.2">$1</h2>')
    .replace(/\[h3\]([\s\S]*?)\[\/h3\]/gi, '<h3 style="font-size:1.15em;font-weight:700;margin:.4em 0;line-height:1.2">$1</h3>')
    .replace(/^### (.*$)/gim, '<h3 style="font-size:1.15em;font-weight:700;margin:.4em 0;line-height:1.2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size:1.4em;font-weight:700;margin:.5em 0;line-height:1.2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size:1.8em;font-weight:700;margin:.6em 0;line-height:1.2">$1</h1>')
    // Basic (BBCode & Markdown)
    .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong>$1</strong>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em>$1</em>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '<span style="text-decoration:underline">$1</span>')
    .replace(/\[s\]([\s\S]*?)\[\/s\]/gi, '<span style="text-decoration:line-through">$1</span>')
    // HR (BBCode & Markdown)
    .replace(/\[hr\]/gi, '<hr style="border:none;border-top:1px solid #e2e8f0;margin:1em 0">')
    .replace(/^(\-{3,}|\*{3,}|_{3,})$/gim, '<hr style="border:none;border-top:1px solid #e2e8f0;margin:1em 0">')
    // Color & size
    .replace(/\[color=(#?[a-zA-Z0-9]+)\]([\s\S]*?)\[\/color\]/gi, '<span style="color:$1">$2</span>')
    .replace(/\[size=(\d+)\]([\s\S]*?)\[\/size\]/gi, '<span style="font-size:$1px">$2</span>')
    // Align
    .replace(/\[left\]([\s\S]*?)\[\/left\]/gi, '<div style="text-align:left">$1</div>')
    .replace(/\[center\]([\s\S]*?)\[\/center\]/gi, '<div style="text-align:center">$1</div>')
    .replace(/\[right\]([\s\S]*?)\[\/right\]/gi, '<div style="text-align:right">$1</div>')
    // URL
    .replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline">$2</a>')
    .replace(/\[url\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline">$1</a>')
    // Table
    .replace(/\[table\]([\s\S]*?)\[\/table\]/gi, '<table style="border-collapse:collapse;width:100%;margin:1em 0;border:1px solid #cbd5e1;font-size:0.9em">$1</table>')
    .replace(/\[tr\]([\s\S]*?)\[\/tr\]/gi, '<tr>$1</tr>')
    .replace(/\[th\]([\s\S]*?)\[\/th\]/gi, '<th style="border:1px solid #cbd5e1;padding:6px 10px;background:#f8fafc;text-align:left;font-weight:700">$1</th>')
    .replace(/\[td\]([\s\S]*?)\[\/td\]/gi, '<td style="border:1px solid #cbd5e1;padding:6px 10px">$1</td>')
    // Image
    .replace(/\[img\]([\s\S]*?)\[\/img\]/gi, '<img src="$1" alt="" style="max-width:100%;height:auto;object-fit:contain;border-radius:4px;display:block;margin:0.5em 0" />')
    .replace(/\[img=(\d+)x(\d+)\]([\s\S]*?)\[\/img\]/gi, '<img src="$3" width="$1" height="$2" alt="" style="max-width:100%;height:auto;object-fit:contain;border-radius:4px;display:block;margin:0.5em 0" />')
    // Quote
    .replace(/\[quote=([^\]]+)\]([\s\S]*?)\[\/quote\]/gi, '<blockquote style="border-left:4px solid #94a3b8;margin:1em 0;padding:.5em 1em;background:#f8fafc;border-radius:0 4px 4px 0"><strong style="display:block;margin-bottom:.3em">$1:</strong>$2</blockquote>')
    .replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, '<blockquote style="border-left:4px solid #94a3b8;margin:1em 0;padding:.5em 1em;background:#f8fafc;border-radius:0 4px 4px 0">$1</blockquote>')
    // Code
    .replace(/\[code\]([\s\S]*?)\[\/code\]/gi, '<pre style="background:#1e293b;color:#e2e8f0;border-radius:6px;padding:1em;overflow-x:auto;font-family:monospace;font-size:.88em;margin:.8em 0"><code>$1</code></pre>')
    // Spoiler
    .replace(/\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi, '<details style="margin:.5em 0;border:1px solid #e2e8f0;border-radius:4px;padding:.4em .8em"><summary style="cursor:pointer;color:#64748b;font-size:.9em">Spoiler</summary><div style="padding:.5em 0">$1</div></details>')
    // HR
    .replace(/\[hr\]/gi, '<hr style="border:none;border-top:1px solid #e2e8f0;margin:1em 0">')
    // Newlines → <br> (but not inside block elements)
    .replace(/\n/g, '<br>');

  // Lists (after newline conversion, so handle specially)
  html = html.replace(/\[list=1\]([\s\S]*?)\[\/list\]/gi, (_: string, inner: string) => {
    const items = inner.split(/\[\*\]/).filter((s: string) => s.replace(/<br>/g, '').trim());
    return '<ol style="margin:.5em 0;padding-left:1.6em">' + items.map((item: string) => `<li>${item.replace(/^<br>/, '').trim()}</li>`).join('') + '</ol>';
  });
  html = html.replace(/\[list\]([\s\S]*?)\[\/list\]/gi, (_: string, inner: string) => {
    const items = inner.split(/\[\*\]/).filter((s: string) => s.replace(/<br>/g, '').trim());
    return '<ul style="margin:.5em 0;padding-left:1.6em">' + items.map((item: string) => `<li>${item.replace(/^<br>/, '').trim()}</li>`).join('') + '</ul>';
  });

  return html;
}

// ─── BBCodeRenderer ───────────────────────────────────────────────────────────
export const BBCodeRenderer: React.FC<{ content: string; className?: string }> = ({ content, className }) => (
  <div
    className={className}
    style={{ lineHeight: 1.7, wordBreak: 'break-word' }}
    dangerouslySetInnerHTML={{ __html: bbcodeToHtml(content) }}
  />
);

// ─── Toolbar config ───────────────────────────────────────────────────────────
interface Btn { label: string; tag: string; icon: string; hasPrompt?: boolean; promptMsg?: string; promptDefault?: string }

const BUTTONS: Btn[] = [
  { label: 'Kalın',       tag: 'b',     icon: 'B' },
  { label: 'İtalik',      tag: 'i',     icon: 'I' },
  { label: 'Altı Çizili', tag: 'u',     icon: 'U' },
  { label: 'Üstü Çizili', tag: 's',     icon: 'S' },
  { label: 'Alıntı',      tag: 'quote', icon: '❝' },
  { label: 'Kod',         tag: 'code',  icon: '</>' },
  { label: 'URL', tag: 'url', icon: '🔗', hasPrompt: true, promptMsg: 'URL girin:', promptDefault: 'https://' },
  { label: 'Resim',       tag: 'img',   icon: '🖼' },
  { label: 'Tablo Əlavə Et', tag: 'table', icon: '⊞ Tablo' },
  { label: 'İnfoqrafik',  tag: 'infographic', icon: '📊 İnfoqrafik' },
  { label: 'H1',          tag: 'h1',    icon: 'H1' },
  { label: 'H2',          tag: 'h2',    icon: 'H2' },
  { label: 'H3',          tag: 'h3',    icon: 'H3' },
  { label: 'Yatay Çizgi', tag: 'hr',    icon: '—' },
];

const SIZES = ['10', '12', '14', '16', '18', '20', '24', '28', '32'];
const COLORS = ['#000000', '#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#06b6d4', '#f97316', '#64748b', '#374151', '#9ca3af'];

// ─── BBCodeEditor ─────────────────────────────────────────────────────────────
interface BBCodeEditorProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export const BBCodeEditor: React.FC<BBCodeEditorProps> = ({
  value, onChange, placeholder = 'BBCode ile içerik yazın...', minHeight = 300,
}) => {
  const [preview, setPreview] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [showSize, setShowSize] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const insert = useCallback((open: string, close: string) => {
    const ta = ref.current;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = value.substring(s, e);
    onChange(value.substring(0, s) + open + sel + close + value.substring(e));
    setTimeout(() => {
      ta.focus();
      const pos = sel ? s + open.length + sel.length + close.length : s + open.length;
      ta.setSelectionRange(sel ? pos : s + open.length, sel ? pos : s + open.length);
    }, 0);
  }, [value, onChange]);

  const handleBtn = useCallback((btn: Btn) => {
    if (btn.tag === 'hr') { insert('[hr]', ''); return; }
    if (btn.tag === 'table') {
      insert('[table]\n[tr][th]Parametr[/th][th]Dəyər[/th][th]Qeyd[/th][/tr]\n[tr][td]Məhsul[/td][td]100 Ton[/td][td]Yüksək Keyfiyyət[/td][/tr]\n[/table]\n', '');
      return;
    }
    if (btn.tag === 'infographic') {
      const val = prompt('İnfoqrafika / Şəkil URL-i daxil edin:', 'https://');
      if (!val) return;
      insert(`\n[center][img]${val}[/img]\n[size=12][color=#64748b]İnfoqrafika: İxrac Göstəriciləri[/color][/size][/center]\n`, '');
      return;
    }
    if (btn.tag === 'list') { insert('[list]\n[*]', '\n[/list]'); return; }
    if (btn.tag === '*') { insert('[*]', ''); return; }
    if (btn.hasPrompt) {
      const val = prompt(btn.promptMsg!, btn.promptDefault!);
      if (!val) return;
      insert(`[url=${val}]`, '[/url]');
      return;
    }
    insert(`[${btn.tag}]`, `[/${btn.tag}]`);
  }, [insert]);

  const btnStyle = {
    padding: '3px 8px', background: '#374151', color: '#d1d5db',
    border: '1px solid #4b5563', borderRadius: '3px', cursor: 'pointer',
    fontSize: '12px', lineHeight: '20px',
  } as React.CSSProperties;

  return (
    <div style={{ border: '1px solid #374151', borderRadius: '6px', overflow: 'visible', background: '#111827' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', padding: '6px 8px', background: '#1f2937', borderBottom: '1px solid #374151', alignItems: 'center' }}>
        {BUTTONS.map(btn => (
          <button key={btn.tag} type="button" title={btn.label} onClick={() => handleBtn(btn)} style={{
            ...btnStyle,
            fontWeight: btn.tag === 'b' ? 'bold' : undefined,
            fontStyle: btn.tag === 'i' ? 'italic' : undefined,
            textDecoration: btn.tag === 'u' ? 'underline' : btn.tag === 's' ? 'line-through' : undefined,
          }}>{btn.icon}</button>
        ))}

        <span style={{ width: 1, height: 20, background: '#4b5563', margin: '0 3px' }} />

        {/* List */}
        <button type="button" title="Liste" onClick={() => insert('[list]\n[*]', '\n[/list]')} style={btnStyle}>☰</button>
        <button type="button" title="Madde" onClick={() => insert('[*]', '')} style={btnStyle}>•</button>
        <button type="button" title="Numaralı Liste" onClick={() => insert('[list=1]\n[*]', '\n[/list]')} style={btnStyle}>1.</button>

        <span style={{ width: 1, height: 20, background: '#4b5563', margin: '0 3px' }} />

        {/* Align */}
        {['left', 'center', 'right'].map(a => (
          <button key={a} type="button" title={a} onClick={() => insert(`[${a}]`, `[/${a}]`)} style={btnStyle}>
            {a === 'left' ? '⬛◀' : a === 'center' ? '■' : '▶⬛'}
          </button>
        ))}

        <span style={{ width: 1, height: 20, background: '#4b5563', margin: '0 3px' }} />

        {/* Color */}
        <div style={{ position: 'relative' }}>
          <button type="button" onClick={() => { setShowColor(v => !v); setShowSize(false); }} style={btnStyle}>🎨 Renk</button>
          {showColor && (
            <div style={{ position: 'absolute', top: 28, left: 0, zIndex: 200, background: '#1f2937', border: '1px solid #4b5563', borderRadius: 6, padding: 8, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 4, width: 160 }}>
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => { insert(`[color=${c}]`, '[/color]'); setShowColor(false); }}
                  style={{ width: 20, height: 20, background: c, border: '1px solid #6b7280', borderRadius: 3, cursor: 'pointer' }} title={c} />
              ))}
            </div>
          )}
        </div>

        {/* Size */}
        <div style={{ position: 'relative' }}>
          <button type="button" onClick={() => { setShowSize(v => !v); setShowColor(false); }} style={btnStyle}>🔤 Boyut</button>
          {showSize && (
            <div style={{ position: 'absolute', top: 28, left: 0, zIndex: 200, background: '#1f2937', border: '1px solid #4b5563', borderRadius: 6, padding: 4, minWidth: 80 }}>
              {SIZES.map(s => (
                <button key={s} type="button" onClick={() => { insert(`[size=${s}]`, '[/size]'); setShowSize(false); }}
                  style={{ display: 'block', width: '100%', padding: '2px 10px', background: 'transparent', color: '#d1d5db', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: `${Math.min(parseInt(s), 16)}px` }}>
                  {s}px
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Preview toggle */}
        <button type="button" onClick={() => setPreview(v => !v)} style={{ ...btnStyle, background: preview ? '#1d4ed8' : '#374151' }}>
          {preview ? '✏️ Düzenle' : '👁 Önizle'}
        </button>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div style={{ minHeight, padding: '12px 16px', background: '#111827', color: '#e5e7eb' }}>
          <BBCodeRenderer content={value} />
        </div>
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', minHeight, padding: '10px 12px',
            background: '#111827', color: '#e5e7eb',
            border: 'none', outline: 'none',
            fontFamily: '"Fira Code", "Courier New", monospace',
            fontSize: 13, lineHeight: 1.6, resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      )}

      {/* Hint */}
      <div style={{ padding: '4px 10px', background: '#1f2937', borderTop: '1px solid #374151', fontSize: 10, color: '#6b7280' }}>
        BBCode: [b]kalın[/b] · [i]italik[/i] · [url=https://...]metin[/url] · [img]url[/img] · [quote]alıntı[/quote] · [code]kod[/code] · [list][*]madde[/list] · [color=red]renkli[/color] · [size=14]boyut[/size]
      </div>
    </div>
  );
};
