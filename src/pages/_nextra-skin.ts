import type { NextraSkin } from '@/services/nextra-skin'

// NEXTRA_SKINS_V1: the three app looks. Colors live here; layout stays in components.
interface SkinSpec {
  mode: 'light' | 'dark'
  palette: {
    primary: string
    secondary: string
    text: string
    textSecondary: string
    paper: string
    success: string
    warning: string
    error: string
  }
  vars: Record<string, string>
}

export const NEXTRA_FONT_BODY = `"Manrope", "Segoe UI Variable Text", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", twemoji mozilla`
export const NEXTRA_FONT_DISPLAY = `"Unbounded", "Bahnschrift", "Segoe UI Variable Display", -apple-system, BlinkMacSystemFont, sans-serif`

export const SKINS: Record<NextraSkin, SkinSpec> = {
  dark: {
    mode: 'dark',
    palette: {
      primary: '#7FF5E4',
      secondary: '#C9D3D8',
      text: '#EEF2F4',
      textSecondary: '#9AA4AA',
      paper: '#0B0F11',
      success: '#7FF5E4',
      warning: '#F2C94C',
      error: '#FF6B6B',
    },
    vars: {
      '--nx-bg':
        'radial-gradient(ellipse 80% 60% at 55% 25%, #0E1316 0%, #050607 55%, #020303 100%)',
      '--nx-bg-color': '#050607',
      '--nx-content': 'transparent',
      '--nx-card': 'rgba(255, 255, 255, 0.04)',
      '--nx-card-strong':
        'linear-gradient(160deg, rgba(255,255,255,.07), rgba(255,255,255,.015) 55%, rgba(255,255,255,.04))',
      '--nx-border': 'rgba(220, 230, 236, 0.12)',
      '--nx-border-strong': 'rgba(220, 230, 236, 0.20)',
      '--nx-text': '#EEF2F4',
      '--nx-muted': '#9AA4AA',
      '--nx-accent': '#7FF5E4',
      '--nx-accent-text': '#7FF5E4',
      '--nx-accent-ink': '#04110F',
      '--nx-accent-soft': 'rgba(127, 245, 228, 0.10)',
      '--nx-glow': 'rgba(127, 245, 228, 0.30)',
      '--nx-sidebar': 'linear-gradient(180deg, rgba(255,255,255,.025), rgba(255,255,255,0))',
      '--nx-dots': 'rgba(215, 228, 234, 0.30)',
      '--nx-arc': '#FFFFFF',
      '--nx-chrome':
        'linear-gradient(180deg, #FFFFFF 0%, #D9DEE2 38%, #8A9299 62%, #F2F5F7 100%)',
      '--nx-power-bg': 'radial-gradient(circle at 50% 35%, #1B2126 0%, #07090A 70%)',
      '--nx-power-ring': '#F4F8F9',
      '--nx-power-icon': '#FFFFFF',
      '--nx-power-glow':
        '0 0 0 6px rgba(255,255,255,.06), 0 0 40px rgba(255,255,255,.55), 0 0 90px rgba(127,245,228,.30), inset 0 0 30px rgba(255,255,255,.18)',
      '--nx-power-glow-off':
        '0 0 0 6px rgba(255,255,255,.04), 0 0 24px rgba(255,255,255,.15), inset 0 0 20px rgba(255,255,255,.06)',
      '--nx-popover': '#0E1316',
      '--nx-blur': 'none',
      '--nx-scroll': 'rgba(255, 255, 255, 0.14)',
    },
  },
  light: {
    mode: 'light',
    palette: {
      primary: '#0A8F8A',
      secondary: '#55626A',
      text: '#0D1417',
      textSecondary: '#55626A',
      paper: '#FFFFFF',
      success: '#0A8F8A',
      warning: '#B7791F',
      error: '#D64545',
    },
    vars: {
      '--nx-bg':
        'radial-gradient(ellipse 85% 60% at 55% 15%, #FFFFFF 0%, #EEF5F5 55%, #E3EEEE 100%)',
      '--nx-bg-color': '#EEF5F5',
      '--nx-content': 'transparent',
      '--nx-card': '#FFFFFF',
      '--nx-card-strong': '#FFFFFF',
      '--nx-border': 'rgba(13, 20, 23, 0.08)',
      '--nx-border-strong': 'rgba(13, 20, 23, 0.14)',
      '--nx-text': '#0D1417',
      '--nx-muted': '#55626A',
      '--nx-accent': '#81D8D0',
      '--nx-accent-text': '#0A7F7A',
      '--nx-accent-ink': '#06302E',
      '--nx-accent-soft': 'rgba(129, 216, 208, 0.18)',
      '--nx-glow': 'rgba(10, 186, 181, 0.30)',
      '--nx-sidebar': 'rgba(255, 255, 255, 0.70)',
      '--nx-dots': 'rgba(13, 20, 23, 0.16)',
      '--nx-arc': '#0ABAB5',
      '--nx-chrome': 'linear-gradient(180deg, #2B3338, #6B757B 60%, #1A2023)',
      '--nx-power-bg': 'radial-gradient(circle at 50% 30%, #FFFFFF, #E4EEEE 75%)',
      '--nx-power-ring': '#FFFFFF',
      '--nx-power-icon': '#0A7F7A',
      '--nx-power-glow':
        '0 14px 36px rgba(13,20,23,.16), 0 0 0 8px rgba(10,186,181,.12), 0 0 60px rgba(10,186,181,.40)',
      '--nx-power-glow-off': '0 14px 36px rgba(13,20,23,.12), 0 0 0 8px rgba(13,20,23,.04)',
      '--nx-popover': '#FFFFFF',
      '--nx-blur': 'none',
      '--nx-scroll': 'rgba(13, 20, 23, 0.18)',
    },
  },
  glass: {
    mode: 'dark',
    palette: {
      primary: '#8CFFEF',
      secondary: '#C6D4FF',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.78)',
      paper: 'rgba(16, 32, 42, 0.92)',
      success: '#8CFFEF',
      warning: '#FFD36E',
      error: '#FF8A8A',
    },
    vars: {
      '--nx-bg':
        'radial-gradient(circle at 18% 16%, rgba(54,224,200,.75), transparent 38%), radial-gradient(circle at 86% 26%, rgba(90,120,255,.65), transparent 40%), radial-gradient(circle at 38% 88%, rgba(170,90,255,.50), transparent 42%), radial-gradient(circle at 92% 92%, rgba(40,200,255,.45), transparent 40%), #0B1A22',
      '--nx-bg-color': '#0B1A22',
      '--nx-content': 'transparent',
      '--nx-card': 'rgba(255, 255, 255, 0.12)',
      '--nx-card-strong': 'rgba(255, 255, 255, 0.16)',
      '--nx-border': 'rgba(255, 255, 255, 0.30)',
      '--nx-border-strong': 'rgba(255, 255, 255, 0.50)',
      '--nx-text': '#FFFFFF',
      '--nx-muted': 'rgba(255, 255, 255, 0.78)',
      '--nx-accent': '#8CFFEF',
      '--nx-accent-text': '#B5FFF6',
      '--nx-accent-ink': '#04211D',
      '--nx-accent-soft': 'rgba(255, 255, 255, 0.20)',
      '--nx-glow': 'rgba(54, 224, 200, 0.55)',
      '--nx-sidebar': 'rgba(255, 255, 255, 0.10)',
      '--nx-dots': 'rgba(255, 255, 255, 0.28)',
      '--nx-arc': '#FFFFFF',
      '--nx-chrome': 'linear-gradient(180deg, #FFFFFF, #E6FFFB 60%, #FFFFFF)',
      '--nx-power-bg':
        'radial-gradient(circle at 35% 25%, rgba(255,255,255,.55), rgba(255,255,255,.12) 45%, rgba(255,255,255,.06))',
      '--nx-power-ring': 'rgba(255, 255, 255, 0.70)',
      '--nx-power-icon': '#FFFFFF',
      '--nx-power-glow':
        'inset 0 2px 1px rgba(255,255,255,.7), inset 0 -14px 30px rgba(54,224,200,.40), 0 20px 50px rgba(0,0,0,.35), 0 0 60px rgba(140,255,239,.35)',
      '--nx-power-glow-off':
        'inset 0 2px 1px rgba(255,255,255,.5), 0 20px 50px rgba(0,0,0,.30)',
      '--nx-popover': 'rgba(16, 32, 42, 0.94)',
      '--nx-blur': 'blur(22px) saturate(1.7)',
      '--nx-scroll': 'rgba(255, 255, 255, 0.30)',
    },
  },
}

export const skinCss = (skin: NextraSkin) => `
@font-face { font-family: "Manrope"; src: url("/fonts/Manrope.ttf") format("truetype"); font-weight: 200 800; font-display: swap; }
@font-face { font-family: "Unbounded"; src: url("/fonts/Unbounded.ttf") format("truetype"); font-weight: 200 900; font-display: swap; }

body {
  background: var(--nx-bg) !important;
  background-color: var(--nx-bg-color) !important;
  background-attachment: fixed !important;
  color: var(--nx-text);
  font-family: ${NEXTRA_FONT_BODY};
}
.layout, .layout.MuiPaper-root { background: transparent !important; }
.layout-content__left {
  background: var(--nx-sidebar);
  backdrop-filter: var(--nx-blur);
  -webkit-backdrop-filter: var(--nx-blur);
  border-right: 1px solid var(--nx-border) !important;
}
.layout-content__left .MuiListItemButton-root { border: 1px solid transparent; }
.layout-content__left .MuiListItemButton-root.Mui-selected {
  background: linear-gradient(90deg, var(--nx-accent-soft), transparent) !important;
  border-color: var(--nx-border-strong);
}
.layout-content__left .MuiListItemButton-root.Mui-selected .MuiListItemText-primary,
.layout-content__left .MuiListItemButton-root.Mui-selected .MuiListItemIcon-root { color: var(--nx-accent-text) !important; }
.base-page > header { border-bottom: 1px solid var(--nx-border) !important; }
.base-page > header .MuiTypography-root:first-of-type { font-family: ${NEXTRA_FONT_DISPLAY}; letter-spacing: .02em; }
.nx-display { font-family: ${NEXTRA_FONT_DISPLAY} !important; }
.nx-chrome {
  background: var(--nx-chrome);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent !important;
  ${skin === 'light' ? '' : 'filter: drop-shadow(0 0 14px rgba(255,255,255,.28));'}
}
.MuiPopover-paper, .MuiMenu-paper, .MuiDialog-paper {
  background: var(--nx-popover) !important;
  border: 1px solid var(--nx-border);
  backdrop-filter: var(--nx-blur);
  -webkit-backdrop-filter: var(--nx-blur);
}
${
  skin === 'glass'
    ? `.base-content .MuiPaper-root, .base-content .MuiListItemButton-root, .nx-card {
  backdrop-filter: var(--nx-blur);
  -webkit-backdrop-filter: var(--nx-blur);
}`
    : ''
}
::-webkit-scrollbar-thumb { background-color: var(--nx-scroll) !important; }
::-webkit-scrollbar { background-color: transparent !important; }
`
