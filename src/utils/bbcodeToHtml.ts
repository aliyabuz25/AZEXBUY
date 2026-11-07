export function bbcodeToHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Headings
    .replace(/\[h1\]([\s\S]*?)\[\/h1\]/gi, '<h1 style="font-size:2em;font-weight:800;line-height:1.2;margin:.6em 0 .3em">$1</h1>')
    .replace(/\[h2\]([\s\S]*?)\[\/h2\]/gi, '<h2 style="font-size:1.5em;font-weight:700;line-height:1.3;margin:.5em 0 .25em">$1</h2>')
    .replace(/\[h3\]([\s\S]*?)\[\/h3\]/gi, '<h3 style="font-size:1.2em;font-weight:700;margin:.4em 0 .2em">$1</h3>')
    // Basic
    .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong>$1</strong>')
    .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em>$1</em>')
    .replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '<span style="text-decoration:underline">$1</span>')
    .replace(/\[s\]([\s\S]*?)\[\/s\]/gi, '<span style="text-decoration:line-through">$1</span>')
    // Color & size
    .replace(/\[color=([#\w]+)\]([\s\S]*?)\[\/color\]/gi, '<span style="color:$1">$2</span>')
    .replace(/\[size=(\d+)\]([\s\S]*?)\[\/size\]/gi, '<span style="font-size:$1px">$2</span>')
    // Align
    .replace(/\[left\]([\s\S]*?)\[\/left\]/gi,     '<div style="text-align:left">$1</div>')
    .replace(/\[center\]([\s\S]*?)\[\/center\]/gi, '<div style="text-align:center">$1</div>')
    .replace(/\[right\]([\s\S]*?)\[\/right\]/gi,   '<div style="text-align:right">$1</div>')
    // URL
    .replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;font-weight:500">$2</a>')
    .replace(/\[url\]([\s\S]*?)\[\/url\]/gi,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;font-weight:500">$1</a>')
    // Image
    .replace(/\[img\]([\s\S]*?)\[\/img\]/gi,
      '<img src="$1" alt="" style="max-width:100%;height:auto;border-radius:6px;margin:.4em 0;display:block" />')
    // Quote
    .replace(/\[quote=([^\]]+)\]([\s\S]*?)\[\/quote\]/gi,
      '<blockquote style="border-left:4px solid #0f3156;margin:1em 0;padding:.6em 1em;background:#eff6ff;border-radius:0 6px 6px 0;color:#1e3a5f"><strong>$1:</strong><br>$2</blockquote>')
    .replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi,
      '<blockquote style="border-left:4px solid #0f3156;margin:1em 0;padding:.6em 1em;background:#eff6ff;border-radius:0 6px 6px 0;color:#1e3a5f">$1</blockquote>')
    // Code
    .replace(/\[code\]([\s\S]*?)\[\/code\]/gi,
      '<pre style="background:#0f172a;color:#e2e8f0;border-radius:8px;padding:1em;overflow-x:auto;font-family:\'Fira Code\',\'Courier New\',monospace;font-size:.88em;margin:.6em 0"><code>$1</code></pre>')
    // Lists
    .replace(/\[list=1\]([\s\S]*?)\[\/list\]/gi, (_: string, inner: string) =>
      '<ol style="margin:.5em 0;padding-left:1.6em;line-height:1.8">' +
      inner.split(/\[\*\]/).filter((s: string) => s.trim()).map((s: string) => `<li>${s.trim()}</li>`).join('') +
      '</ol>')
    .replace(/\[list\]([\s\S]*?)\[\/list\]/gi, (_: string, inner: string) =>
      '<ul style="margin:.5em 0;padding-left:1.6em;line-height:1.8">' +
      inner.split(/\[\*\]/).filter((s: string) => s.trim()).map((s: string) => `<li>${s.trim()}</li>`).join('') +
      '</ul>')
    // HR
    .replace(/\[hr\]/gi, '<hr style="border:none;border-top:1px solid #e2e8f0;margin:1.2em 0">')
    // Spoiler
    .replace(/\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi,
      '<details style="margin:.6em 0;border:1px solid #e2e8f0;border-radius:6px;padding:.5em .8em"><summary style="cursor:pointer;font-weight:600;color:#64748b;user-select:none">Spoiler göster</summary><div style="padding:.5em 0">$1</div></details>')
    // Newlines → <br>
    .replace(/\n/g, '<br>');
}
