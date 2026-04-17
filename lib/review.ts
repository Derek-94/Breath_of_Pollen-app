import AsyncStorage from '@react-native-async-storage/async-storage'
import * as StoreReview from 'expo-store-review'

const OPEN_COUNT_KEY = 'app_open_count'
const FIRST_OPEN_KEY = 'app_first_open_date'
const REVIEW_REQUESTED_KEY = 'review_requested'

const REQUIRED_OPENS = 5
const REQUIRED_DAYS = 3

export async function trackAppOpen(): Promise<void> {
  const [countRaw, firstOpen] = await Promise.all([
    AsyncStorage.getItem(OPEN_COUNT_KEY),
    AsyncStorage.getItem(FIRST_OPEN_KEY),
  ])

  const count = countRaw ? parseInt(countRaw, 10) : 0
  await AsyncStorage.setItem(OPEN_COUNT_KEY, String(count + 1))

  if (!firstOpen) {
    await AsyncStorage.setItem(FIRST_OPEN_KEY, new Date().toISOString())
  }
}

export async function shouldShowReviewPrompt(): Promise<boolean> {
  const [countRaw, firstOpen, requested] = await Promise.all([
    AsyncStorage.getItem(OPEN_COUNT_KEY),
    AsyncStorage.getItem(FIRST_OPEN_KEY),
    AsyncStorage.getItem(REVIEW_REQUESTED_KEY),
  ])

  if (requested === 'true') return false

  const count = countRaw ? parseInt(countRaw, 10) : 0
  if (count < REQUIRED_OPENS) return false

  if (!firstOpen) return false
  const daysSinceFirst = (Date.now() - new Date(firstOpen).getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceFirst < REQUIRED_DAYS) return false

  return true
}

export async function markReviewRequested(): Promise<void> {
  await AsyncStorage.setItem(REVIEW_REQUESTED_KEY, 'true')
}

export async function requestReview(): Promise<void> {
  if (await StoreReview.hasAction()) {
    await StoreReview.requestReview()
  }
}
