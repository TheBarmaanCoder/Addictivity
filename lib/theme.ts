export interface ThemeToken {
  main: string;
  interactive: string;
  secondary: string;
  ternary: string;
  background: string;
  surface: string;
  title: string;
  subtitle: string;
  textPrimary: string;
  textOnMain: string;
  border: string;
}

export interface Theme {
  id: string;
  name: string;
  tokens: ThemeToken;
}

export const THEMES: Theme[] = [
  {
    id: 'p1',
    name: 'Classic Forest',
    tokens: {
      main: '#327039',
      interactive: '#E89635',
      secondary: '#EB9C35',
      ternary: '#F5834F',
      background: '#FFFFFF',
      surface: '#FFFFFF',
      title: '#133020',
      subtitle: '#C4501B',
      textPrimary: '#133020',
      textOnMain: '#FFFFFF',
      border: '#13302033',
    },
  },
  {
    id: 'p2',
    name: 'Violet Dusk',
    tokens: {
      main: '#71557A',
      interactive: '#F3C8DD',
      secondary: '#F3C8DD',
      ternary: '#D183A9',
      background: '#FFFFFF',
      surface: '#FFFFFF',
      title: '#3A345B',
      subtitle: '#A63446',
      textPrimary: '#3A345B',
      textOnMain: '#FFFFFF',
      border: '#3A345B33',
    },
  },
];

export function applyTheme(themeId: string): void {
  // Migrate removed Ember (p3) to Classic Forest
  const safeId = themeId === 'p3' ? 'p1' : themeId;
  const theme = THEMES.find((t) => t.id === safeId) || THEMES[0];
  const root = document.documentElement;
  const t = theme.tokens;

  root.style.setProperty('--main', t.main);
  root.style.setProperty('--interactive', t.interactive);
  root.style.setProperty('--secondary', t.secondary);
  root.style.setProperty('--ternary', t.ternary);
  root.style.setProperty('--background', t.background);
  root.style.setProperty('--surface', t.surface);
  root.style.setProperty('--title', t.title);
  root.style.setProperty('--subtitle', t.subtitle);
  root.style.setProperty('--textPrimary', t.textPrimary);
  root.style.setProperty('--textOnMain', t.textOnMain);
  root.style.setProperty('--border', t.border);
}
