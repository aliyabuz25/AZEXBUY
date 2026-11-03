export interface ColorTheme {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  mode: 'light' | 'dark';
  tag: string;
  colors: {
    bg: string;
    surface: string;
    surfaceSubtle: string;
    accent: string;
    accentGlow: string;
    border: string;
    text: string;
    textMuted: string;
    badgeBg: string;
    badgeText: string;
  };
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'zinc',
    name: 'Titanium Studio',
    subtitle: 'Apple Pro & Vercel Minimalizm',
    description: 'Sade, monoxrom və ultra-təmiz iş mühiti. Yüksək kontrastlı qrafit və alüminium çərçivələr.',
    mode: 'light',
    tag: 'Studio Standart',
    colors: {
      bg: '#f8fafc',
      surface: '#ffffff',
      surfaceSubtle: '#f1f5f9',
      accent: '#0f172a',
      accentGlow: 'rgba(15, 23, 42, 0.15)',
      border: '#e2e8f0',
      text: '#0f172a',
      textMuted: '#64748b',
      badgeBg: '#f1f5f9',
      badgeText: '#334155'
    }
  },
  {
    id: 'obsidian',
    name: 'Midnight OLED',
    subtitle: 'True Dark & Elektrik İndiqo',
    description: 'Dərin gecə qaranlığı və parlaq göy/indiqo vurğuları. OLED panellər üçün mükəmməl sıfır göz yorğunluğu.',
    mode: 'dark',
    tag: 'OLED Pro',
    colors: {
      bg: '#05070c',
      surface: '#0d111a',
      surfaceSubtle: '#151b27',
      accent: '#6366f1',
      accentGlow: 'rgba(99, 102, 241, 0.3)',
      border: '#1c2436',
      text: '#f8fafc',
      textMuted: '#94a3b8',
      badgeBg: '#1e2638',
      badgeText: '#a5b4fc'
    }
  },
  {
    id: 'nordic',
    name: 'Nordic Glacier',
    subtitle: 'Arktik Buz & Şimal Şəffaflığı',
    description: 'Şimal dənizlərinin sərin mavisi və təmiz qrafit tonları. Kristal aydınlıq və geniş nəfəs sahəsi.',
    mode: 'light',
    tag: 'Arktik Aydınlıq',
    colors: {
      bg: '#f0f5fa',
      surface: '#ffffff',
      surfaceSubtle: '#e2edf7',
      accent: '#0284c7',
      accentGlow: 'rgba(2, 132, 199, 0.2)',
      border: '#cbdceb',
      text: '#0f172a',
      textMuted: '#475569',
      badgeBg: '#e0f2fe',
      badgeText: '#0369a1'
    }
  },
  {
    id: 'emerald',
    name: 'Emerald Sovereign',
    subtitle: 'Britaniya Zümrüdü & Lüks Bankçılıq',
    description: 'Zəngin meşə yaşılı, təzə nanə və zərif qızılı/adaçayı detallar. Korporativ və maliyyə elitizmi.',
    mode: 'light',
    tag: 'Fintech Lüks',
    colors: {
      bg: '#f0f7f3',
      surface: '#ffffff',
      surfaceSubtle: '#e1efe7',
      accent: '#059669',
      accentGlow: 'rgba(5, 150, 105, 0.2)',
      border: '#c8dfd3',
      text: '#064e3b',
      textMuted: '#2d6a4f',
      badgeBg: '#ecfdf5',
      badgeText: '#047857'
    }
  },
  {
    id: 'cyber',
    name: 'Tokyo Cyberpunk',
    subtitle: 'Neon Bənövşəyi & Kiber Gecə',
    description: 'Tokio gecələrinin neon estetikası — parlaq bənövşəyi, ultrabənövşəyi və elektrik qaranlıq.',
    mode: 'dark',
    tag: 'Kiberpunk',
    colors: {
      bg: '#080614',
      surface: '#120d26',
      surfaceSubtle: '#1d153d',
      accent: '#a855f7',
      accentGlow: 'rgba(168, 85, 247, 0.35)',
      border: '#2c1f54',
      text: '#faf5ff',
      textMuted: '#c084fc',
      badgeBg: '#2a174f',
      badgeText: '#e9d5ff'
    }
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    subtitle: 'Şampan Qürubu & İsti Bürünc',
    description: 'İsti kəhrəba, kofein və titan daş tonları. Zərif premium redaksiya və jurnal havası.',
    mode: 'light',
    tag: 'Kəhrəba Qürubu',
    colors: {
      bg: '#fcf8f5',
      surface: '#ffffff',
      surfaceSubtle: '#f5ebe1',
      accent: '#d97706',
      accentGlow: 'rgba(217, 119, 6, 0.2)',
      border: '#e8dbce',
      text: '#292524',
      textMuted: '#78716c',
      badgeBg: '#fef3c7',
      badgeText: '#b45309'
    }
  },
  {
    id: 'crimson',
    name: 'Crimson Dynasty',
    subtitle: 'Məxmər Yaqut & İntensiv Güc',
    description: 'Dərin tünd şokolad və məxmər qırmızı fon. Yüksək səlahiyyətli icraçı idarəetmə hissi.',
    mode: 'dark',
    tag: 'İcraçı Qırmızı',
    colors: {
      bg: '#0e080b',
      surface: '#1a0f15',
      surfaceSubtle: '#2a1622',
      accent: '#f43f5e',
      accentGlow: 'rgba(244, 63, 94, 0.35)',
      border: '#381c2b',
      text: '#fff1f2',
      textMuted: '#fda4af',
      badgeBg: '#36111f',
      badgeText: '#fecdd3'
    }
  },
  {
    id: 'ocean',
    name: 'Abyssal Ocean',
    subtitle: 'Dərin Okean & Biolüminessent Firuzə',
    description: 'Dəniz dibinin sirli tünd göyü və parıldayan akvamarin mavi çalarları.',
    mode: 'dark',
    tag: 'Okean Dərinliyi',
    colors: {
      bg: '#050c14',
      surface: '#0a1624',
      surfaceSubtle: '#112236',
      accent: '#06b6d4',
      accentGlow: 'rgba(6, 182, 212, 0.35)',
      border: '#172f4a',
      text: '#ecfeff',
      textMuted: '#67e8f9',
      badgeBg: '#0e2b40',
      badgeText: '#a5f3fc'
    }
  }
];

export const THEME_STORAGE_KEY = 'octotech_admin_theme';

export function getInitialTheme(): string {
  if (typeof window === 'undefined') return 'zinc';
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved && COLOR_THEMES.some(t => t.id === saved)) {
    return saved;
  }
  return 'zinc';
}

export function applyTheme(themeId: string): void {
  if (typeof document === 'undefined') return;
  const theme = COLOR_THEMES.find(t => t.id === themeId) || COLOR_THEMES[0];
  const root = document.documentElement;
  
  root.setAttribute('data-theme', theme.id);
  if (theme.mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Inject all theme variables directly on root element
  root.style.setProperty('--theme-bg', theme.colors.bg);
  root.style.setProperty('--theme-surface', theme.colors.surface);
  root.style.setProperty('--theme-surface-subtle', theme.colors.surfaceSubtle);
  root.style.setProperty('--theme-accent', theme.colors.accent);
  root.style.setProperty('--theme-accent-glow', theme.colors.accentGlow);
  root.style.setProperty('--theme-border', theme.colors.border);
  root.style.setProperty('--theme-text', theme.colors.text);
  root.style.setProperty('--theme-text-muted', theme.colors.textMuted);
  root.style.setProperty('--theme-badge-bg', theme.colors.badgeBg);
  root.style.setProperty('--theme-badge-text', theme.colors.badgeText);

  localStorage.setItem(THEME_STORAGE_KEY, theme.id);
}
