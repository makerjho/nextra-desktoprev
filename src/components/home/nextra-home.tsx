import {
  AddRounded,
  BoltRounded,
  CloudRounded,
  LanguageRounded,
  PowerSettingsNewRounded,
  RefreshRounded,
  StarBorderRounded,
  StarRounded,
} from '@mui/icons-material'
import { Box, ButtonBase, IconButton, Typography } from '@mui/material'
import { useLockFn } from 'ahooks'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import ProxyControlSwitches from '@/components/shared/proxy-control-switches'
import { useGroupDelays } from '@/hooks/use-group-delays'
import { useProfiles } from '@/hooks/use-profiles'
import { useProxySelection } from '@/hooks/use-proxy-selection'
import { useSystemProxyState } from '@/hooks/use-system-proxy-state'
import { useSystemState } from '@/hooks/use-system-state'
import { useVerge } from '@/hooks/use-verge'
import {
  useAppRefreshers,
  useProxiesData,
} from '@/providers/app-data-context'
import delayManager from '@/services/delay'
import { showNotice } from '@/services/notice-service'
import {
  isInteractableMember,
  resolveMember,
  type InteractableProxyMember,
} from '@/types/proxy-view'
import { classifyDelay } from '@/utils/delay'
import { openExternalUrl } from '@/utils/open-external-url'

// NEXTRA_HOME_V1: main screen from the approved desktop mockup.
const TEXT = {
  ru: {
    tagline: 'твой доступ. твой ритм.',
    connect: 'Подключить VPN',
    disconnect: 'Отключить VPN',
    on: 'Подключено',
    off: 'Отключено',
    ping: 'ПИНГ',
    ipProtect: 'IP-ЗАЩИТА',
    hidden: 'Скрыто',
    noProfile:
      'Добавь подписку: Mini App NEXTRA → «Подключение» → «Открыть в NEXTRA VPN»',
    addSub: 'Добавить подписку',
    plan: '30 дней · 300',
    active: 'Активна',
    expired: 'Истекла',
    unlimited: 'Безлимит · до 5 устройств',
    used: 'Использовано',
    until: 'Истекает',
    renew: 'Продлить',
    all: 'Все локации',
    favs: 'Избранные',
    noFavs: 'Нажмите на звёздочку у страны, чтобы добавить её в избранное',
    auto: 'Авто',
    best: 'Лучшее соединение',
    refresh: 'Проверить скорость',
    favAdd: 'В избранное',
    favRemove: 'Убрать из избранного',
    hint: 'Браузер и большинство программ идут через NEXTRA. Для игр и всех программ включи TUN.',
    tun: 'TUN: весь трафик',
  },
  en: {
    tagline: 'your access. your rhythm.',
    connect: 'Connect VPN',
    disconnect: 'Disconnect VPN',
    on: 'Connected',
    off: 'Disconnected',
    ping: 'PING',
    ipProtect: 'IP PROTECTION',
    hidden: 'Hidden',
    noProfile:
      'Add your subscription: NEXTRA Mini App → “Connection” → “Open in NEXTRA VPN”',
    addSub: 'Add subscription',
    plan: '30 days · 300',
    active: 'Active',
    expired: 'Expired',
    unlimited: 'Unlimited · up to 5 devices',
    used: 'Used',
    until: 'Expires',
    renew: 'Renew',
    all: 'All locations',
    favs: 'Favorites',
    noFavs: 'Tap the star next to a country to add it to favorites',
    auto: 'Auto',
    best: 'Best connection',
    refresh: 'Check speed',
    favAdd: 'Add to favorites',
    favRemove: 'Remove from favorites',
    hint: 'Browser and most apps go through NEXTRA. Enable TUN for games and all apps.',
    tun: 'TUN: all traffic',
  },
}

const COUNTRIES = [
  {
    keys: ['sweden', 'швец'],
    ru: 'Швеция',
    en: 'Sweden',
    flag: 'linear-gradient(90deg, transparent 30%, #FECC02 30% 44%, transparent 44%), linear-gradient(180deg, #006AA7 40%, #FECC02 40% 60%, #006AA7 60%)',
  },
  {
    keys: ['finland', 'финл'],
    ru: 'Финляндия',
    en: 'Finland',
    flag: 'linear-gradient(90deg, transparent 28%, #003580 28% 44%, transparent 44%), linear-gradient(180deg, #FFFFFF 38%, #003580 38% 62%, #FFFFFF 62%)',
  },
  {
    keys: ['netherlands', 'нидерл'],
    ru: 'Нидерланды',
    en: 'Netherlands',
    flag: 'linear-gradient(180deg, #AE1C28 33.3%, #FFFFFF 33.3% 66.6%, #21468B 66.6%)',
  },
  {
    keys: ['germany', 'герман'],
    ru: 'Германия',
    en: 'Germany',
    flag: 'linear-gradient(180deg, #000000 33.3%, #DD0000 33.3% 66.6%, #FFCE00 66.6%)',
  },
  {
    keys: ['cdn', 'облак'],
    ru: 'Облако CDN',
    en: 'Cloud CDN',
    flag: 'linear-gradient(135deg, #2A3036, #11161A)',
  },
]

const FAVS_KEY = 'nextra-favs'
const CONNECTED_AT_KEY = 'nextra-connected-at'

const readFavs = (): string[] => {
  try {
    const value = JSON.parse(localStorage.getItem(FAVS_KEY) || '[]')
    return Array.isArray(value) ? value.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

const cleanName = (name: string) =>
  name
    .replace(/^NEXTRA\s*\|\s*/i, '')
    .replace(/[\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}\u{FE0F}]/gu, '')
    .trim()

const pad = (n: number) => String(n).padStart(2, '0')

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 GB'
  const gb = bytes / 1024 ** 3
  return gb >= 1024 ? `${(gb / 1024).toFixed(2)} TB` : `${gb.toFixed(1)} GB`
}

const signalBars = (delay: number, timeout: number) => {
  if (classifyDelay(delay, timeout) !== 'measured') return 0
  if (delay < 150) return 4
  if (delay < 300) return 3
  if (delay < 600) return 2
  return 1
}

const Signal = ({ bars }: { bars: number }) => (
  <svg width="22" height="18" viewBox="0 0 24 20" aria-hidden="true">
    {[0, 1, 2, 3].map((i) => (
      <rect
        key={i}
        x={1 + i * 6}
        y={13 - i * 4}
        width="4"
        height={6 + i * 4}
        rx="1"
        fill={i < bars ? 'var(--nx-accent)' : 'var(--nx-border-strong)'}
      />
    ))}
  </svg>
)

interface LocationItem {
  name: string
  label: string
  sub: string
  flag: string
  isGroup: boolean
  isCdn: boolean
  member: InteractableProxyMember
}

export const NextraHome = () => {
  const { t, i18n } = useTranslation()
  const ru = i18n.language?.startsWith('ru') ?? true
  const text = ru ? TEXT.ru : TEXT.en
  const navigate = useNavigate()
  const { verge, mutateVerge, patchVerge } = useVerge()
  const { current } = useProfiles()
  const { indicator: systemProxyOn, toggleSystemProxy } = useSystemProxyState()
  const { runState, isTunModeAvailable, isLoading } = useSystemState()
  const { proxyView } = useProxiesData()
  const { refreshProxy } = useAppRefreshers()
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState<'all' | 'fav'>('all')
  const [favs, setFavs] = useState<string[]>(readFavs)
  const [now, setNow] = useState(() => Date.now())
  const timeout = verge?.default_latency_timeout || 10000

  const tunOn = Boolean(verge?.enable_tun_mode && isTunModeAvailable)
  const connected = systemProxyOn || tunOn

  // Connection timer survives page switches; it resets when the VPN goes off.
  useEffect(() => {
    try {
      if (connected) {
        if (!localStorage.getItem(CONNECTED_AT_KEY)) {
          localStorage.setItem(CONNECTED_AT_KEY, String(Date.now()))
        }
      } else {
        localStorage.removeItem(CONNECTED_AT_KEY)
      }
    } catch {
      // timer is cosmetic
    }
    if (!connected) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [connected])

  const connectedAt = (() => {
    try {
      return Number(localStorage.getItem(CONNECTED_AT_KEY)) || now
    } catch {
      return now
    }
  })()
  const elapsed = Math.max(0, Math.floor((now - connectedAt) / 1000))
  const timer = connected
    ? `${pad(Math.floor(elapsed / 3600))}:${pad(Math.floor(elapsed / 60) % 60)}:${pad(elapsed % 60)}`
    : '00:00:00'

  const group = useMemo(() => {
    if (!proxyView) return null
    const selectable = proxyView.groups.filter(
      (g) => !g.hidden && g.type === 'Selector',
    )
    return (
      selectable.find((g) => g.name.toUpperCase().includes('NEXTRA')) ??
      selectable[0] ??
      null
    )
  }, [proxyView])

  const groupName = group?.name ?? null
  const delays = useGroupDelays(groupName)

  const locations = useMemo<LocationItem[]>(() => {
    if (!proxyView || !group) return []
    const items: LocationItem[] = []
    for (const ref of group.members) {
      const member = resolveMember(proxyView, ref)
      if (!isInteractableMember(member)) continue
      const name = member.ref.name
      if (name === 'DIRECT' || name === 'REJECT') continue
      const isGroup = member.kind === 'group'
      const lower = name.toLowerCase()
      const country = COUNTRIES.find((c) => c.keys.some((k) => lower.includes(k)))
      const isCdn = country?.keys[0] === 'cdn'
      items.push({
        name,
        isGroup,
        isCdn: Boolean(isCdn),
        member,
        label: isGroup ? text.auto : country ? (ru ? country.ru : country.en) : cleanName(name),
        sub: isGroup ? text.best : isCdn ? 'VLESS | XHTTP | TLS' : 'VLESS | TCP | Reality',
        flag: isGroup
          ? 'radial-gradient(circle at 50% 40%, #1C3B45, #0A1418)'
          : (country?.flag ?? 'linear-gradient(135deg, #2A3036, #11161A)'),
      })
    }
    return items
  }, [proxyView, group, ru, text.auto, text.best])

  const checkDelays = useLockFn(async () => {
    if (!groupName || locations.length === 0) return
    await delayManager
      .checkListDelay(
        locations.map((l) => l.member),
        groupName,
        timeout,
      )
      .catch(() => {})
    refreshProxy()
  })

  // One speed check when the list first appears.
  const locationKey = locations.map((l) => l.name).join('|')
  useEffect(() => {
    if (locationKey) void checkDelays()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationKey])

  const { changeProxy } = useProxySelection({
    onSuccess: () => refreshProxy(),
    onError: () => refreshProxy(),
  })

  const pick = useCallback(
    (name: string) => {
      if (!group || group.now === name) return
      changeProxy(group.name, name, group.now ?? undefined, group.fixed ?? undefined)
    },
    [group, changeProxy],
  )

  const toggleFav = (name: string) => {
    setFavs((prev) => {
      const next = prev.includes(name)
        ? prev.filter((x) => x !== name)
        : [...prev, name]
      try {
        localStorage.setItem(FAVS_KEY, JSON.stringify(next))
      } catch {
        // favorites stay for this session
      }
      return next
    })
  }

  const onPower = async () => {
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

  const selected = locations.find((l) => l.name === group?.now)
  const exitLabel = (() => {
    if (!connected) return text.hidden
    if (selected?.isGroup && proxyView && selected.member.kind === 'group') {
      const inner = selected.member.group.now
      const innerLoc = inner
        ? COUNTRIES.find((c) => c.keys.some((k) => inner.toLowerCase().includes(k)))
        : undefined
      return innerLoc ? (ru ? innerLoc.ru : innerLoc.en) : inner ? cleanName(inner) : text.auto
    }
    return selected?.label ?? '—'
  })()
  const selectedDelay = selected ? delays.of(selected.member) : -1
  const pingText =
    connected && classifyDelay(selectedDelay, timeout) === 'measured'
      ? `${selectedDelay} ${ru ? 'мс' : 'ms'}`
      : '—'

  const extra = current?.extra
  const expire = extra?.expire ?? 0
  const expired = expire > 0 && expire * 1000 < Date.now()
  const total = extra?.total ?? 0
  const usedBytes = (extra?.upload ?? 0) + (extra?.download ?? 0)

  const shown = tab === 'fav' ? locations.filter((l) => favs.includes(l.name)) : locations

  const renew = useLockFn(() =>
    openExternalUrl('https://t.me/nextravpn_bot').catch(showNotice.error),
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography
            className="nx-display nx-chrome"
            sx={{ fontSize: 32, fontWeight: 800, letterSpacing: '.04em', lineHeight: 1 }}
          >
            NEXTRA VPN
          </Typography>
          <Typography
            sx={{
              mt: 0.75,
              fontSize: 11,
              letterSpacing: '.42em',
              textTransform: 'uppercase',
              color: 'var(--nx-muted)',
            }}
          >
            {text.tagline}
          </Typography>
        </Box>
        <IconButton
          aria-label={text.addSub}
          title={text.addSub}
          onClick={() => navigate('/profile')}
          sx={{
            width: 46,
            height: 46,
            borderRadius: 3.5,
            border: '1px solid var(--nx-border-strong)',
            bgcolor: 'var(--nx-card)',
            color: 'var(--nx-text)',
          }}
        >
          <AddRounded />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'stretch' }}>
        {/* Hero */}
        <Box
          component="section"
          aria-label={text.connect}
          sx={{
            flex: '3 1 420px',
            minWidth: 0,
            position: 'relative',
            minHeight: 520,
            borderRadius: 5,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3.5,
            px: 3,
            py: 4,
            border: '1px solid var(--nx-border)',
            background: 'radial-gradient(ellipse 70% 60% at 50% 42%, var(--nx-accent-soft), transparent 70%)',
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'radial-gradient(var(--nx-dots) 1.1px, transparent 1.6px)',
              backgroundSize: '10px 10px',
              maskImage:
                'radial-gradient(ellipse 62% 55% at 50% 48%, #000 25%, transparent 72%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 62% 55% at 50% 48%, #000 25%, transparent 72%)',
            }}
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 800 520"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.7 }}
          >
            <defs>
              <linearGradient id="nx-arc" x1="0" x2="1">
                <stop offset="0" stopColor="var(--nx-arc)" stopOpacity="0" />
                <stop offset=".5" stopColor="var(--nx-arc)" stopOpacity=".55" />
                <stop offset="1" stopColor="var(--nx-arc)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M90 300 Q 400 40 710 260" stroke="url(#nx-arc)" strokeWidth="1.2" fill="none" />
            <path d="M140 200 Q 420 -10 690 170" stroke="url(#nx-arc)" strokeWidth="1" fill="none" />
            <path d="M60 380 Q 380 170 760 360" stroke="url(#nx-arc)" strokeWidth="1" fill="none" />
          </svg>

          <Box
            sx={{
              position: 'relative',
              width: 280,
              height: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '1px solid var(--nx-border)',
                background: connected
                  ? 'radial-gradient(circle, var(--nx-glow) 0%, transparent 68%)'
                  : 'radial-gradient(circle, var(--nx-accent-soft) 0%, transparent 62%)',
                transition: 'background .4s',
              }}
            />
            <ButtonBase
              data-nx-glow
              onClick={onPower}
              disabled={busy}
              aria-label={connected ? text.disconnect : text.connect}
              sx={{
                width: 208,
                height: 208,
                borderRadius: '50%',
                background: 'var(--nx-power-bg)',
                border: '3px solid',
                borderColor: connected ? 'var(--nx-power-ring)' : 'var(--nx-border-strong)',
                color: connected ? 'var(--nx-power-icon)' : 'var(--nx-muted)',
                boxShadow: connected ? 'var(--nx-power-glow)' : 'var(--nx-power-glow-off)',
                backdropFilter: 'var(--nx-blur)',
                transition: 'all .35s ease',
                opacity: busy ? 0.6 : 1,
                '&:hover': { transform: 'scale(1.03)' },
              }}
            >
              <PowerSettingsNewRounded sx={{ fontSize: 76 }} />
            </ButtonBase>
          </Box>

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 620,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <BoltRounded sx={{ color: 'var(--nx-text)' }} />
              <Box>
                <Typography sx={{ fontSize: 19, fontWeight: 700 }}>{pingText}</Typography>
                <Typography sx={{ fontSize: 11, letterSpacing: '.3em', color: 'var(--nx-muted)' }}>
                  {text.ping}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: 21,
                  fontWeight: 700,
                  color: connected ? 'var(--nx-accent-text)' : 'var(--nx-muted)',
                  textShadow: connected ? '0 0 18px var(--nx-glow)' : 'none',
                }}
              >
                {connected ? text.on : text.off}
              </Typography>
              <Typography
                sx={{ fontSize: 14, color: 'var(--nx-muted)', fontVariantNumeric: 'tabular-nums', mt: 0.5 }}
              >
                {timer}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'flex-end' }}>
              <LanguageRounded sx={{ color: 'var(--nx-text)' }} />
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{exitLabel}</Typography>
                <Typography sx={{ fontSize: 11, letterSpacing: '.3em', color: 'var(--nx-muted)' }}>
                  {text.ipProtect}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ position: 'relative', width: '100%', maxWidth: 520 }}>
            <ProxyControlSwitches label={t('settings.sections.system.toggles.tunMode')} noRightPadding />
            <Typography
              variant="caption"
              sx={{ display: 'block', textAlign: 'center', color: 'var(--nx-muted)', mt: 0.5 }}
            >
              {text.hint}
            </Typography>
          </Box>
        </Box>

        {/* Right panel */}
        <Box
          component="aside"
          sx={{ flex: '2 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Box
            className="nx-card"
            sx={{
              borderRadius: 4.5,
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.75,
              background: 'var(--nx-card-strong)',
              border: '1px solid var(--nx-border-strong)',
            }}
          >
            {current ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 3.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--nx-border-strong)',
                      background: 'var(--nx-accent-soft)',
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--nx-text)" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 10H5z" />
                      <path d="M5 21h14" />
                    </svg>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography className="nx-display" sx={{ fontWeight: 700, fontSize: 17 }}>
                      NEXTRA VPN
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: 'var(--nx-muted)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {text.plan}
                      <svg role="img" aria-label="Telegram Stars" width="15" height="15" viewBox="0 0 24 24" fill="#F2C94C">
                        <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7.1L12 17.3 5.8 21l1.6-7.1L2 9.2l7.1-.6z" />
                      </svg>
                    </Typography>
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 700,
                      color: expired ? 'var(--nx-text)' : 'var(--nx-accent-ink)',
                      bgcolor: expired ? 'error.main' : 'var(--nx-accent)',
                    }}
                  >
                    {expired ? text.expired : text.active}
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 14, color: 'var(--nx-muted)' }}>
                  {total > 0
                    ? `${text.used}: ${formatBytes(usedBytes)} / ${formatBytes(total)}`
                    : text.unlimited}
                </Typography>
                <Box sx={{ height: 8, borderRadius: 99, bgcolor: 'var(--nx-border)', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      width: total > 0 ? `${Math.min(100, (usedBytes / total) * 100)}%` : '100%',
                      borderRadius: 99,
                      background: 'linear-gradient(90deg, var(--nx-border-strong), var(--nx-accent))',
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: 14, color: 'var(--nx-muted)' }}>
                    {expire > 0 ? `${text.until}: ${dayjs(expire * 1000).format('DD.MM.YYYY')}` : current.name}
                  </Typography>
                  <ButtonBase
                    onClick={renew}
                    sx={{
                      px: 2.25,
                      py: 1.1,
                      borderRadius: 3,
                      fontWeight: 700,
                      fontSize: 14,
                      color: 'var(--nx-accent-ink)',
                      background: 'var(--nx-accent)',
                    }}
                  >
                    {text.renew}
                  </ButtonBase>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography sx={{ color: 'var(--nx-muted)' }}>{text.noProfile}</Typography>
                <ButtonBase
                  onClick={() => navigate('/profile')}
                  sx={{
                    alignSelf: 'flex-start',
                    px: 2.25,
                    py: 1.1,
                    borderRadius: 3,
                    fontWeight: 700,
                    color: 'var(--nx-accent-ink)',
                    background: 'var(--nx-accent)',
                  }}
                >
                  {text.addSub}
                </ButtonBase>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Box
              role="tablist"
              sx={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 0.75,
                p: 0.6,
                borderRadius: 4,
                border: '1px solid var(--nx-border)',
                background: 'var(--nx-card)',
              }}
            >
              {(['all', 'fav'] as const).map((id) => {
                const on = tab === id
                return (
                  <ButtonBase
                    key={id}
                    role="tab"
                    aria-selected={on}
                    onClick={() => setTab(id)}
                    sx={{
                      py: 1.25,
                      borderRadius: 3,
                      fontSize: 15,
                      fontWeight: 600,
                      color: on ? 'var(--nx-text)' : 'var(--nx-muted)',
                      border: '1px solid',
                      borderColor: on ? 'var(--nx-border-strong)' : 'transparent',
                      background: on ? 'var(--nx-accent-soft)' : 'transparent',
                    }}
                  >
                    {id === 'all' ? text.all : text.favs}
                  </ButtonBase>
                )
              })}
            </Box>
            <IconButton
              aria-label={text.refresh}
              title={text.refresh}
              onClick={() => void checkDelays()}
              sx={{ border: '1px solid var(--nx-border)', bgcolor: 'var(--nx-card)', color: 'var(--nx-text)' }}
            >
              <RefreshRounded />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {shown.map((l) => {
              const on = group?.now === l.name
              const delay = delays.of(l.member)
              const isFav = favs.includes(l.name)
              const measured = classifyDelay(delay, timeout) === 'measured'
              return (
                <Box
                  key={l.name}
                  className="nx-card"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 1.25,
                    pl: 1.75,
                    pr: 1,
                    borderRadius: 4.5,
                    border: '1px solid',
                    borderColor: on ? 'var(--nx-accent)' : 'var(--nx-border)',
                    background: on
                      ? 'linear-gradient(90deg, var(--nx-accent-soft), var(--nx-card))'
                      : 'var(--nx-card)',
                    transition: 'all .2s',
                    '&:hover': { borderColor: 'var(--nx-border-strong)' },
                  }}
                >
                  <ButtonBase
                    onClick={() => pick(l.name)}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      justifyContent: 'flex-start',
                      gap: 2,
                      textAlign: 'left',
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      aria-hidden="true"
                      sx={{
                        width: 44,
                        height: 32,
                        flex: '0 0 auto',
                        borderRadius: 2,
                        background: l.flag,
                        border: '1px solid var(--nx-border-strong)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                      }}
                    >
                      {l.isGroup && <BoltRounded sx={{ fontSize: 20, color: 'var(--nx-accent)' }} />}
                      {l.isCdn && <CloudRounded sx={{ fontSize: 20, color: '#E9F2F5' }} />}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 16, fontWeight: 700 }} noWrap>
                        {l.label}
                      </Typography>
                      <Typography sx={{ fontSize: 12.5, color: 'var(--nx-muted)' }} noWrap>
                        {l.sub}
                      </Typography>
                    </Box>
                  </ButtonBase>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontVariantNumeric: 'tabular-nums',
                      color: measured ? 'var(--nx-muted)' : 'error.main',
                      minWidth: 52,
                      textAlign: 'right',
                    }}
                  >
                    {measured ? `${delay} ${ru ? 'мс' : 'ms'}` : delayManager.formatDelay(delay, timeout)}
                  </Typography>
                  <Signal bars={signalBars(delay, timeout)} />
                  <IconButton
                    size="small"
                    aria-label={isFav ? text.favRemove : text.favAdd}
                    onClick={() => toggleFav(l.name)}
                    sx={{ color: isFav ? 'var(--nx-accent)' : 'var(--nx-muted)' }}
                  >
                    {isFav ? <StarRounded fontSize="small" /> : <StarBorderRounded fontSize="small" />}
                  </IconButton>
                </Box>
              )
            })}
            {tab === 'fav' && shown.length === 0 && (
              <Typography
                sx={{
                  p: 3,
                  textAlign: 'center',
                  fontSize: 14,
                  color: 'var(--nx-muted)',
                  borderRadius: 4.5,
                  border: '1px dashed var(--nx-border-strong)',
                }}
              >
                {text.noFavs}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
