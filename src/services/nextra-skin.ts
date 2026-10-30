import { useSyncExternalStore } from 'react'

export type NextraSkin = 'dark' | 'light' | 'glass'

export const NEXTRA_SKINS: readonly NextraSkin[] = ['dark', 'light', 'glass']

const STORAGE_KEY = 'nextra-skin'
const listeners = new Set<() => void>()

const read = (): NextraSkin => {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'dark' || value === 'light' || value === 'glass') return value
  } catch {
    // storage unavailable: fall back to the default skin
  }
  return 'dark'
}

let current: NextraSkin = read()

export const getNextraSkin = () => current

export const setNextraSkin = (skin: NextraSkin) => {
  current = skin
  try {
    localStorage.setItem(STORAGE_KEY, skin)
  } catch {
    // the choice still applies for this session
  }
  for (const listener of listeners) listener()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useNextraSkin = () =>
  useSyncExternalStore(subscribe, getNextraSkin, getNextraSkin)

export const skinMode = (skin: NextraSkin): 'light' | 'dark' =>
  skin === 'light' ? 'light' : 'dark'
