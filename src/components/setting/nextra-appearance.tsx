import { PowerSettingsNewRounded } from '@mui/icons-material'
import { Box, ButtonBase, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { SKINS } from '@/pages/_nextra-skin'
import {
  NEXTRA_SKINS,
  type NextraSkin,
  setNextraSkin,
  useNextraSkin,
} from '@/services/nextra-skin'

const TEXT = {
  ru: {
    title: 'Оформление',
    hint: 'Тема меняет только внешний вид, настройки подключения не трогает.',
    names: { dark: 'Тёмная', light: 'Светлая', glass: 'Стекло' },
    descs: {
      dark: 'Чёрный, серебро и бирюзовое свечение',
      light: 'Белый и бирюза Tiffany',
      glass: 'Полупрозрачные панели и блики',
    },
    selected: 'Выбрана',
  },
  en: {
    title: 'Appearance',
    hint: 'A theme only changes the look; connection settings stay as they are.',
    names: { dark: 'Dark', light: 'Light', glass: 'Glass' },
    descs: {
      dark: 'Black, silver and a turquoise glow',
      light: 'White and Tiffany turquoise',
      glass: 'Translucent panels and highlights',
    },
    selected: 'Selected',
  },
}

const Preview = ({ skin }: { skin: NextraSkin }) => {
  const v = SKINS[skin].vars
  return (
    <Box
      sx={{
        position: 'relative',
        height: 120,
        borderRadius: 2,
        overflow: 'hidden',
        background: v['--nx-bg'],
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
      }}
    >
      <Box
        data-nx-glow
        sx={{
          width: 64,
          height: 64,
          flex: '0 0 auto',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: v['--nx-power-bg'],
          border: `2px solid ${v['--nx-power-ring']}`,
          color: v['--nx-power-icon'],
          boxShadow: v['--nx-power-glow'],
        }}
      >
        <PowerSettingsNewRounded />
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {[0, 1].map((i) => (
          <Box
            key={i}
            sx={{
              height: 26,
              borderRadius: 1.5,
              background: v['--nx-card-strong'],
              border: `1px solid ${i === 0 ? v['--nx-accent'] : v['--nx-border']}`,
              backdropFilter: v['--nx-blur'],
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

export const NextraAppearance = () => {
  const { i18n } = useTranslation()
  const text = i18n.language?.startsWith('ru') ? TEXT.ru : TEXT.en
  const skin = useNextraSkin()

  return (
    <Box sx={{ p: 2 }}>
      <Typography className="nx-display" sx={{ fontSize: 18, fontWeight: 700 }}>
        {text.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {text.hint}
      </Typography>
      <Box
        role="radiogroup"
        aria-label={text.title}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 1.5,
        }}
      >
        {NEXTRA_SKINS.map((id) => {
          const on = id === skin
          return (
            <ButtonBase
              key={id}
              role="radio"
              aria-checked={on}
              onClick={() => setNextraSkin(id)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 1,
                p: 1,
                borderRadius: 2.5,
                textAlign: 'left',
                border: '2px solid',
                borderColor: on ? 'primary.main' : 'transparent',
                background: 'var(--nx-card)',
              }}
            >
              <Preview skin={id} />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  px: 0.5,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{text.names[id]}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {text.descs[id]}
                  </Typography>
                </Box>
                {on && (
                  <Typography
                    variant="caption"
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 99,
                      fontWeight: 700,
                      color: 'var(--nx-accent-ink)',
                      bgcolor: 'var(--nx-accent)',
                    }}
                  >
                    {text.selected}
                  </Typography>
                )}
              </Box>
            </ButtonBase>
          )
        })}
      </Box>
    </Box>
  )
}
