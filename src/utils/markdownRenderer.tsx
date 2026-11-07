import React from 'react';

// ─── Inline Token Parser ─────────────────────────────────────────────────────
export function parseInlineText(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match:
  // [url=href]label[/url] or [url]href[/url] or [label](href)
  // [color=c]text[/color]
  // **bold** or [b]bold[/b]
  // *italic* or _italic_ or [i]italic[/i]
  // [u]underline[/u]
  // [s]strike[/s]
  // `code` or [code]code[/code]
  const tokenRegex = /(\[url=[^\]]+\][\s\S]*?\[\/url\]|\[url\][\s\S]*?\[\/url\]|\[[^\]]+\]\([^\)]+\)|\[color=[^\]]+\][\s\S]*?\[\/color\]|\*\*[^*]+\*\*|\[b\][\s\S]*?\[\/b\]|\*[^*\n]+\*|_[^_\n]+_|\[i\][\s\S]*?\[\/i\]|\[u\][\s\S]*?\[\/u\]|\[s\][\s\S]*?\[\/s\]|`[^`]+`|\[code\][\s\S]*?\[\/code\])/g;

  const parts = text.split(tokenRegex);
  return parts.map((part, idx) => {
    if (!part) return null;

    // **bold** or [b]bold[/b]
    if ((part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
        (/^\[b\][\s\S]*\[\/b\]$/i.test(part))) {
      const inner = part.startsWith('**') ? part.slice(2, -2) : part.slice(3, -4);
      return <strong key={idx} className="font-bold text-[#17231D]">{parseInlineText(inner)}</strong>;
    }

    // *italic* or _italic_ or [i]italic[/i]
    if ((part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.startsWith('**')) ||
        (part.startsWith('_') && part.endsWith('_') && part.length >= 2) ||
        (/^\[i\][\s\S]*\[\/i\]$/i.test(part))) {
      const inner = (part.startsWith('*') || part.startsWith('_')) ? part.slice(1, -1) : part.slice(3, -4);
      return <em key={idx} className="italic text-[#17231D]/90">{parseInlineText(inner)}</em>;
    }

    // [u]underline[/u]
    if (/^\[u\][\s\S]*\[\/u\]$/i.test(part)) {
      return <span key={idx} className="underline">{parseInlineText(part.slice(3, -4))}</span>;
    }

    // [s]strike[/s]
    if (/^\[s\][\s\S]*\[\/s\]$/i.test(part)) {
      return <del key={idx} className="line-through text-slate-400">{parseInlineText(part.slice(3, -4))}</del>;
    }

    // `code` or [code]code[/code]
    if ((part.startsWith('`') && part.endsWith('`') && part.length >= 2) ||
        (/^\[code\][\s\S]*\[\/code\]$/i.test(part))) {
      const inner = part.startsWith('`') ? part.slice(1, -1) : part.slice(6, -7);
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-[#00382D] font-mono text-xs border border-slate-200">
          {inner}
        </code>
      );
    }

    // [color=c]text[/color]
    const colorMatch = part.match(/^\[color=([^\]]+)\]([\s\S]*)\[\/color\]$/i);
    if (colorMatch) {
      return <span key={idx} style={{ color: colorMatch[1] }}>{parseInlineText(colorMatch[2])}</span>;
    }

    // [url=href]label[/url]
    const bbUrlMatch = part.match(/^\[url=([^\]]+)\]([\s\S]*)\[\/url\]$/i);
    if (bbUrlMatch) {
      return (
        <a key={idx} href={bbUrlMatch[1]} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-medium hover:text-emerald-900 transition-colors">
          {parseInlineText(bbUrlMatch[2])}
        </a>
      );
    }

    // [url]href[/url]
    const bbPlainUrlMatch = part.match(/^\[url\]([\s\S]*)\[\/url\]$/i);
    if (bbPlainUrlMatch) {
      return (
        <a key={idx} href={bbPlainUrlMatch[1]} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-medium hover:text-emerald-900 transition-colors">
          {bbPlainUrlMatch[1]}
        </a>
      );
    }

    // [label](href)
    const mdLinkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (mdLinkMatch) {
      return (
        <a key={idx} href={mdLinkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-medium hover:text-emerald-900 transition-colors">
          {parseInlineText(mdLinkMatch[1])}
        </a>
      );
    }

    return <span key={idx}>{part}</span>;
  });
}

// ─── Block Parser ────────────────────────────────────────────────────────────
interface Block {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'hr' | 'blockquote' | 'ul' | 'ol' | 'p' | 'codeblock';
  text?: string;
  items?: { text: string; indent: number }[];
  lang?: string;
}

export function parseMarkdownBlocks(rawText: string): Block[] {
  if (!rawText) return [];

  // Normalize Windows newlines & break accidental inline list items:
  // e.g. "includes: * Item 1 * Item 2" -> "includes:\n* Item 1\n* Item 2"
  const normalized = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // If a list item marker "* " or "- " appears after a sentence or colon, ensure newline
    .replace(/([^\n])\s+(\*|\-)\s+/g, '$1\n$2 ');

  const rawLines = normalized.split('\n');
  const blocks: Block[] = [];

  let currentList: { type: 'ul' | 'ol'; items: { text: string; indent: number }[] } | null = null;
  let currentQuote: string[] = [];
  let currentCode: { lang: string; lines: string[] } | null = null;
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const pText = currentParagraph.join(' ').trim();
      if (pText) {
        blocks.push({ type: 'p', text: pText });
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      blocks.push({ type: currentList.type, items: currentList.items });
      currentList = null;
    }
  };

  const flushQuote = () => {
    if (currentQuote.length > 0) {
      blocks.push({ type: 'blockquote', text: currentQuote.join('\n').trim() });
      currentQuote = [];
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // 1. Code block fence (```)
    if (trimmed.startsWith('```')) {
      if (currentCode) {
        blocks.push({ type: 'codeblock', text: currentCode.lines.join('\n'), lang: currentCode.lang });
        currentCode = null;
      } else {
        flushParagraph();
        flushList();
        flushQuote();
        const lang = trimmed.slice(3).trim();
        currentCode = { lang, lines: [] };
      }
      continue;
    }

    if (currentCode) {
      currentCode.lines.push(line);
      continue;
    }

    // 2. Empty line
    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    // 3. Horizontal Rule: ---, ***, ___, [hr]
    if (/^(\-{3,}|\*{3,}|_{3,}|\[hr\])$/i.test(trimmed)) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push({ type: 'hr' });
      continue;
    }

    // 4. Headings
    const h1Match = trimmed.match(/^#\s+(.*)$/) || trimmed.match(/^\[h1\]([\s\S]*?)\[\/h1\]$/i);
    if (h1Match) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push({ type: 'h1', text: h1Match[1].trim() });
      continue;
    }

    const h2Match = trimmed.match(/^##\s+(.*)$/) || trimmed.match(/^\[h2\]([\s\S]*?)\[\/h2\]$/i);
    if (h2Match) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push({ type: 'h2', text: h2Match[1].trim() });
      continue;
    }

    const h3Match = trimmed.match(/^###\s+(.*)$/) || trimmed.match(/^\[h3\]([\s\S]*?)\[\/h3\]$/i);
    if (h3Match) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push({ type: 'h3', text: h3Match[1].trim() });
      continue;
    }

    const h4Match = trimmed.match(/^####\s+(.*)$/);
    if (h4Match) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push({ type: 'h4', text: h4Match[1].trim() });
      continue;
    }

    // 5. Blockquotes: > text or [quote]...[/quote]
    const quoteMatch = line.match(/^\s*>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      currentQuote.push(quoteMatch[1]);
      continue;
    }

    // 6. Unordered List Items (* or -)
    const ulMatch = line.match(/^(\s*)([\*\-])\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      flushQuote();
      const indent = ulMatch[1].length;
      const text = ulMatch[3].trim();
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push({ text, indent });
      continue;
    }

    // 7. Ordered List Items (1. or 1))
    const olMatch = line.match(/^(\s*)\d+[\.\)]\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      flushQuote();
      const indent = olMatch[1].length;
      const text = olMatch[2].trim();
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push({ text, indent });
      continue;
    }

    // 8. Normal paragraph line
    flushList();
    flushQuote();
    currentParagraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushQuote();
  if (currentCode) {
    blocks.push({ type: 'codeblock', text: currentCode.lines.join('\n'), lang: currentCode.lang });
  }

  return blocks;
}

// ─── Component: MarkdownRenderer ─────────────────────────────────────────────
interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={`prose-azexbuy ${className}`} style={{ color: '#17231D' }}>
      {blocks.map((b, idx) => {
        switch (b.type) {
          case 'h1':
            return (
              <h1
                key={idx}
                className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#17231D] mt-8 mb-4 leading-tight"
              >
                {parseInlineText(b.text || '')}
              </h1>
            );

          case 'h2':
            return (
              <h2
                key={idx}
                className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#17231D] mt-7 mb-3.5 border-b border-[#E8EAE3] pb-2 leading-snug"
              >
                {parseInlineText(b.text || '')}
              </h2>
            );

          case 'h3':
            return (
              <h3
                key={idx}
                className="text-lg sm:text-xl font-bold tracking-tight text-[#17231D] mt-6 mb-2.5 leading-snug flex items-center gap-2"
              >
                {parseInlineText(b.text || '')}
              </h3>
            );

          case 'h4':
            return (
              <h4
                key={idx}
                className="text-base font-bold tracking-tight text-[#17231D] mt-5 mb-2 leading-snug"
              >
                {parseInlineText(b.text || '')}
              </h4>
            );

          case 'hr':
            return (
              <hr
                key={idx}
                className="my-7 border-0 h-px bg-gradient-to-r from-transparent via-[#D2D7D0] to-transparent"
              />
            );

          case 'blockquote':
            return (
              <blockquote
                key={idx}
                className="my-5 border-l-4 border-emerald-600 bg-[#f4faf2] rounded-r-xl px-5 py-3.5 text-[15px] italic text-[#17231D]/90 shadow-sm"
              >
                {parseInlineText(b.text || '')}
              </blockquote>
            );

          case 'codeblock':
            return (
              <pre
                key={idx}
                className="my-5 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto shadow-inner"
              >
                <code>{b.text}</code>
              </pre>
            );

          case 'ul':
            return (
              <ul
                key={idx}
                className="my-4 space-y-2 pl-6 list-disc marker:text-emerald-700 text-[15px] text-[#17231D]/85 leading-relaxed"
              >
                {b.items?.map((it, itemIdx) => (
                  <li
                    key={itemIdx}
                    className={`pl-1 ${it.indent >= 2 ? 'ml-4 list-[circle]' : ''}`}
                  >
                    {parseInlineText(it.text)}
                  </li>
                ))}
              </ul>
            );

          case 'ol':
            return (
              <ol
                key={idx}
                className="my-4 space-y-2 pl-6 list-decimal marker:font-bold marker:text-[#00382D] text-[15px] text-[#17231D]/85 leading-relaxed"
              >
                {b.items?.map((it, itemIdx) => (
                  <li
                    key={itemIdx}
                    className={`pl-1 ${it.indent >= 2 ? 'ml-4' : ''}`}
                  >
                    {parseInlineText(it.text)}
                  </li>
                ))}
              </ol>
            );

          case 'p':
          default:
            return (
              <p
                key={idx}
                className="mb-4 text-[15px] text-[#17231D]/80 leading-[1.75] font-normal"
              >
                {parseInlineText(b.text || '')}
              </p>
            );
        }
      })}
    </div>
  );
};
