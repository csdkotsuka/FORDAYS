export interface ColorTheme {
  id: string;
  name: string;
  hex: string;
  bgLight: string;
  textDark: string;
  border: string;
  dot: string;
}

export const EVENT_COLORS: ColorTheme[] = [
  {
    id: 'sky',
    name: 'スカイブルー',
    hex: '#0284c7',
    bgLight: '#f0f9ff',
    textDark: '#0369a1',
    border: '#bae6fd',
    dot: '#0284c7',
  },
  {
    id: 'emerald',
    name: 'エメラルド',
    hex: '#10b981',
    bgLight: '#ecfdf5',
    textDark: '#047857',
    border: '#a7f3d0',
    dot: '#10b981',
  },
  {
    id: 'amber',
    name: 'オレンジ',
    hex: '#f59e0b',
    bgLight: '#fffbeb',
    textDark: '#b45309',
    border: '#fde68a',
    dot: '#f59e0b',
  },
  {
    id: 'rose',
    name: 'ローズ',
    hex: '#f43f5e',
    bgLight: '#fff1f2',
    textDark: '#be123c',
    border: '#fecdd3',
    dot: '#f43f5e',
  },
  {
    id: 'purple',
    name: 'パープル',
    hex: '#a855f7',
    bgLight: '#faf5ff',
    textDark: '#7e22ce',
    border: '#e9d5ff',
    dot: '#a855f7',
  },
  {
    id: 'indigo',
    name: 'インディゴ',
    hex: '#6366f1',
    bgLight: '#eef2ff',
    textDark: '#4338ca',
    border: '#c7d2fe',
    dot: '#6366f1',
  },
  {
    id: 'teal',
    name: 'ティール',
    hex: '#14b8a6',
    bgLight: '#f0fdfa',
    textDark: '#0f766e',
    border: '#99f6e4',
    dot: '#14b8a6',
  },
  {
    id: 'slate',
    name: 'グレー',
    hex: '#64748b',
    bgLight: '#f8fafc',
    textDark: '#334155',
    border: '#cbd5e1',
    dot: '#64748b',
  },
];

export const DEFAULT_COLOR_ID = 'sky';

export function getColorTheme(colorId?: string): ColorTheme {
  const found = EVENT_COLORS.find((c) => c.id === colorId);
  return found || EVENT_COLORS[0];
}
