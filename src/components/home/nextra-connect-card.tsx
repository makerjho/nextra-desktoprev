import { PowerSettingsNewRounded } from '@mui/icons-material'
import { Box, ButtonBase, Paper, Typography, alpha, useTheme } from '@mui/material'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import ProxyControlSwitches from '@/components/shared/proxy-control-switches'
import { useProfiles } from '@/hooks/use-profiles'
import { useSystemProxyState } from '@/hooks/use-system-proxy-state'
import { useSystemState } from '@/hooks/use-system-state'
import { useVerge } from '@/hooks/use-verge'
import { showNotice } from '@/services/notice-service'

const TEXT = {
  ru: {
    connect: 'Подключить',
    disconnect: 'Отключить',
    on: 'Подключено',
    off: 'Не подключено',
    noProfile: 'Добавь подписку: Mini App NEXTRA → «Подключение» → «Открыть в NEXTRA VPN»',
    until: 'Подписка до',
    hint: 'Браузер и большинство программ идут через NEXTRA. Для игр и всех программ включи TUN ниже.',
  },
  en: {
    connect: 'Connect',
    disconnect: 'Disconnect',
    on: 'Connected',
    off: 'Not connected',
    noProfile: 'Add your subscription: NEXTRA Mini App → “Connection” → “Open in NEXTRA VPN”',
    until: 'Subscription until',
    hint: 'Browser and most apps go through NEXTRA. Enable TUN below for games and all apps.',
  },
}

export const NextraConnectCard = () => {
  const theme = useTheme()
  const { t, i18n } = useTranslation()
  const text = i18n.language?.startsWith('ru') ? TEXT.ru : TEXT.en
  const { verge, mutateVerge, patchVerge } = useVerge()
  const { current } = useProfiles()
  const { indicator: systemProxyOn, toggleSystemProxy } = useSystemProxyState()
  const { runState, isTunModeAvailable, isLoading } = useSystemState()
  const [busy, setBusy] = useState(false)

  const tunOn = Boolean(verge?.enable_tun_mode && isTunModeAvailable)
  const connected = systemProxyOn || tunOn
  const expire = current?.extra?.expire ?? 0

  const onClick = async () => {
    if (busy) return
    if (!current) {
      showNotice.info(text.noProfile)
      return
    }
    setBusy(true)
    try {
      if (connected) {
        if (systemProxyOn) await toggleSystemProxy(false)
        if (verge?.enable_tun_mode) {
          mutateVerge({ ...verge, enable_tun_mode: false }, false)
          await patchVerge({ enable_tun_mode: false })
        }
      } else {
        if (!isLoading && runState.mode === 'NotRunning') {
          showNotice.error('settings.feedback.errors.sysproxy.coreNotReady')
          return
        }
        await toggleSystemProxy(true)
      }
    } catch (err) {
      showNotice.error(err)
    } finally {
      setBusy(false)
    }
  }

  const ring = connected ? theme.palette.success.main : theme.palette.text.disabled

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
        background: `linear-gradient(150deg, ${alpha(theme.palette.background.paper, 0.9)}, ${theme.palette.background.default})`,
      }}
    >
      <ButtonBase
        onClick={onClick}
        disabled={busy}
        aria-label={connected ? text.disconnect : text.connect}
        sx={{
          width: 168,
          height: 168,
          borderRadius: '50%',
          flexDirection: 'column',
          gap: 1,
          color: connected ? 'success.main' : 'text.primary',
          border: `3px solid ${ring}`,
          boxShadow: connected ? `0 0 0 10px ${alpha(ring, 0.12)}, 0 0 40px ${alpha(ring, 0.35)}` : `0 0 0 10px ${alpha(ring, 0.08)}`,
          transition: 'all .25s ease',
          opacity: busy ? 0.6 : 1,
          '&:hover': { transform: 'scale(1.03)' },
        }}
      >
        <PowerSettingsNewRounded sx={{ fontSize: 56 }} />
        <Typography sx={{ fontWeight: 700, letterSpacing: '.02em' }}>
          {connected ? text.disconnect : text.connect}
        </Typography>
      </ButtonBase>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: connected ? 'success.main' : 'text.secondary' }}>
          {connected ? text.on : text.off}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {!current
            ? text.noProfile
            : expire > 0
              ? `${text.until} ${dayjs(expire * 1000).format('DD.MM.YYYY')}`
              : current.name}
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 520 }}>
        {text.hint}
      </Typography>
      <Box sx={{ width: '100%', maxWidth: 520 }}>
        <ProxyControlSwitches label={t('settings.sections.system.toggles.tunMode')} noRightPadding />
      </Box>
    </Paper>
  )
}
