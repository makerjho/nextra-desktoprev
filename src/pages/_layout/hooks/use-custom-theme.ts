import { alpha, createTheme, Theme as MuiTheme, Shadows } from '@mui/material'
import {
  getCurrentWebviewWindow,
  WebviewWindow,
} from '@tauri-apps/api/webviewWindow'
import { Theme as TauriOsTheme } from '@tauri-apps/api/window'
import { useEffect, useMemo } from 'react'

import { useVerge } from '@/hooks/use-verge'
import { NEXTRA_FONT_BODY, SKINS, skinCss } from '@/pages/_nextra-skin'
import { skinMode, useNextraSkin } from '@/services/nextra-skin'
import { useSetThemeMode } from '@/services/states'

const CSS_INJECTION_SCOPE_ROOT = '[data-css-injection-root]'
const CSS_INJECTION_SCOPE_LIMIT =
  ':is(.monaco-editor .view-lines, .monaco-editor .view-line, .monaco-editor .margin, .monaco-editor .margin-view-overlays, .monaco-editor .view-overlays, .monaco-editor [class^="mtk"], .monaco-editor [class*=" mtk"])'
const TOP_LEVEL_AT_RULES = [
  '@charset',
  '@import',
  '@namespace',
  '@font-face',
  '@keyframes',
  '@counter-style',
  '@page',
  '@property',
  '@font-feature-values',
  '@color-profile',
]
let cssScopeSupport: boolean | null = null

const canUseCssScope = () => {
  if (cssScopeSupport !== null) {
    return cssScopeSupport
  }
  try {
    const testStyle = document.createElement('style')
    testStyle.textContent = '@scope (:root) { }'
    document.head.appendChild(testStyle)
    cssScopeSupport = !!testStyle.sheet?.cssRules?.length
    document.head.removeChild(testStyle)
  } catch {
    cssScopeSupport = false
  }
  return cssScopeSupport
}

const wrapCssInjectionWithScope = (css?: string) => {
  if (!css?.trim()) {
    return ''
  }
  const lowerCss = css.toLowerCase()
  const hasTopLevelOnlyRule = TOP_LEVEL_AT_RULES.some((rule) =>
    lowerCss.includes(rule),
  )
  if (hasTopLevelOnlyRule) {
    return null
  }
  const scopeRoot = CSS_INJECTION_SCOPE_ROOT
  const scopeLimit = `${CSS_INJECTION_SCOPE_LIMIT} > *`
  const scopedBlock = `@scope (${scopeRoot}) to (${scopeLimit}) {
${css}
}`
  return scopedBlock
}

/**
 * custom theme
 */
export const useCustomTheme = () => {
  const appWindow: WebviewWindow = useMemo(() => getCurrentWebviewWindow(), [])
  const { verge } = useVerge()
  const { theme_setting } = verge ?? {}
  // NEXTRA_SKINS_V1: the chosen skin decides light/dark; verge theme_mode is not used.
  const skin = useNextraSkin()
  const mode = skinMode(skin)
  const setMode = useSetThemeMode()
  const userBackgroundImage = theme_setting?.background_image || ''
  const hasUserBackground = !!userBackgroundImage

  useEffect(() => {
    setMode(mode)
  }, [mode, setMode])

  useEffect(() => {
    appWindow.setTheme(mode as TauriOsTheme).catch((err) => {
      console.error(`Failed to set window theme to ${mode}:`, err)
    })
  }, [mode, appWindow])

  const theme = useMemo(() => {
    const setting = theme_setting || {}
    const spec = SKINS[skin]
    const p = spec.palette
    let muiTheme: MuiTheme

    try {
      muiTheme = createTheme({
        breakpoints: {
          values: { xs: 0, sm: 650, md: 900, lg: 1200, xl: 1536 },
        },
        palette: {
          mode,
          primary: { main: p.primary },
          secondary: { main: p.secondary },
          info: { main: p.primary },
          error: { main: p.error },
          warning: { main: p.warning },
          success: { main: p.success },
          text: { primary: p.text, secondary: p.textSecondary },
          background: { paper: p.paper, default: spec.vars['--nx-bg-color'] },
          divider: spec.vars['--nx-border'],
        },
        shape: { borderRadius: 12 },
        shadows: Array(25).fill('none') as Shadows,
        typography: { fontFamily: NEXTRA_FONT_BODY },
      })
    } catch (e) {
      console.error('Error creating MUI theme, falling back to defaults:', e)
      muiTheme = createTheme({ palette: { mode } })
    }

    const rootEle = document.documentElement
    if (rootEle) {
      for (const [key, value] of Object.entries(spec.vars)) {
        rootEle.style.setProperty(key, value)
      }
      rootEle.setAttribute('data-nx-skin', skin)
      rootEle.style.setProperty('--divider-color', spec.vars['--nx-border'])
      rootEle.style.setProperty('--background-color', spec.vars['--nx-bg-color'])
      rootEle.style.setProperty('--selection-color', spec.vars['--nx-accent-soft'])
      rootEle.style.setProperty('--scroller-color', spec.vars['--nx-scroll'])
      rootEle.style.setProperty('--primary-main', muiTheme.palette.primary.main)
      rootEle.style.setProperty(
        '--background-color-alpha',
        alpha(muiTheme.palette.primary.main, 0.1),
      )
      rootEle.style.setProperty('--window-border-color', spec.vars['--nx-border'])
      rootEle.style.setProperty('--scrollbar-bg', 'transparent')
      rootEle.style.setProperty('--scrollbar-thumb', spec.vars['--nx-scroll'])
      rootEle.style.setProperty(
        '--user-background-image',
        hasUserBackground ? `url('${userBackgroundImage}')` : 'none',
      )
      rootEle.style.setProperty(
        '--background-blend-mode',
        setting.background_blend_mode || 'normal',
      )
      rootEle.style.setProperty(
        '--background-opacity',
        setting.background_opacity !== undefined
          ? String(setting.background_opacity)
          : '1',
      )
      rootEle.setAttribute('data-css-injection-root', 'true')
    }

    let styleElement = document.querySelector('style#verge-theme')
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = 'verge-theme'
      document.head.appendChild(styleElement!)
    }

    if (styleElement) {
      let scopedCss: string | null = null
      if (canUseCssScope() && setting.css_injection) {
        scopedCss = wrapCssInjectionWithScope(setting.css_injection)
      }
      const effectiveInjectedCss = scopedCss ?? setting.css_injection ?? ''
      const globalStyles = `
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-thumb {
          border-radius: 4px;
        }

        .MuiPaper-root {
          border-color: var(--window-border-color) !important;
        }

        * {
          outline: none !important;
        }
        *:not([data-nx-glow]) {
          box-shadow: none !important;
        }
      `

      styleElement.innerHTML =
        effectiveInjectedCss + globalStyles + skinCss(skin)
    }

    return muiTheme
  }, [mode, skin, theme_setting, userBackgroundImage, hasUserBackground])

  useEffect(() => {
    const id = setTimeout(() => {
      const dom = document.querySelector('#Gradient2')
      if (dom) {
        dom.innerHTML = `
        <stop offset="0%" stop-color="${theme.palette.primary.main}" />
        <stop offset="80%" stop-color="${theme.palette.primary.dark}" />
        <stop offset="100%" stop-color="${theme.palette.primary.dark}" />
        `
      }
    }, 0)
    return () => clearTimeout(id)
  }, [theme.palette.primary.main, theme.palette.primary.dark])

  return { theme }
}
