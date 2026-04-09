import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useColorScheme as useSystemColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const THEME_KEY = 'app_theme'

export type ThemeMode = 'system' | 'light' | 'dark'

interface ThemeContextValue {
  themeMode: ThemeMode
  isDark: boolean
  setThemeMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system')

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') setThemeModeState(saved)
    }).catch(() => {})
  }, [])

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode)
    AsyncStorage.setItem(THEME_KEY, mode).catch(() => {})
  }, [])

  const isDark =
    themeMode === 'dark' ? true
    : themeMode === 'light' ? false
    : systemScheme === 'dark'

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
