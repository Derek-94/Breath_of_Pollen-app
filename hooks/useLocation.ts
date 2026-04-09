import { useState, useEffect, useCallback } from 'react'
import * as Location from 'expo-location'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SAVED_LOCATION_KEY = 'saved_location'

interface SavedLocation {
  lat: number
  lon: number
  name?: string
}

export function useLocation() {
  const [location, setLocation] = useState<SavedLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load saved location or request GPS
  useEffect(() => {
    async function init() {
      // Check for saved location first
      try {
        const saved = await AsyncStorage.getItem(SAVED_LOCATION_KEY)
        if (saved) {
          setLocation(JSON.parse(saved))
          setLoading(false)
          return
        }
      } catch {
        // AsyncStorage not available, skip cache
      }

      // Request GPS permission
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError('位置情報の許可が必要です')
        setLoading(false)
        return
      }

      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        const loc: SavedLocation = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }
        setLocation(loc)
      } catch {
        setError('位置情報の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const setManualLocation = useCallback(async (lat: number, lon: number, name: string) => {
    const loc: SavedLocation = { lat, lon, name }
    try { await AsyncStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify(loc)) } catch {}
    setLocation(loc)
    setError(null)
  }, [])

  const clearSavedLocation = useCallback(async () => {
    try { await AsyncStorage.removeItem(SAVED_LOCATION_KEY) } catch {}
  }, [])

  return { location, loading, error, setManualLocation, clearSavedLocation }
}
