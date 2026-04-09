import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ja from './ja'
import ko from './ko'
import en from './en'

export const LANGUAGE_STORAGE_KEY = 'app_language'
export const SUPPORTED_LANGUAGES = ['ja', 'ko', 'en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  ja: '日本語',
  ko: '한국어',
  en: 'English',
}

function getDeviceLanguage(): SupportedLanguage {
  const code = Localization.getLocales()[0]?.languageCode ?? 'en'
  if (code === 'ja') return 'ja'
  if (code === 'ko') return 'ko'
  return 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    ja: { translation: ja },
    ko: { translation: ko },
    en: { translation: en },
  },
  lng: getDeviceLanguage(),
  fallbackLng: 'ja',
  interpolation: { escapeValue: false },
})

export async function initLanguage(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
      await i18n.changeLanguage(stored)
    }
  } catch {
    // keep device language
  }
}

export async function changeLanguage(lang: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(lang)
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
}

export default i18n
