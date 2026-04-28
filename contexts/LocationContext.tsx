import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import * as ExpoLocation from 'expo-location'
import AsyncStorage from '@react-native-async-storage/async-storage'
import i18n from '@/lib/i18n'

const SAVED_LOCATION_KEY = 'saved_location'

interface SavedLocation {
  lat: number
  lon: number
  name?: string
}

interface LocationContextValue {
  location: SavedLocation | null
  loading: boolean
  error: string | null
  setManualLocation: (lat: number, lon: number, name: string) => Promise<void>
  clearSavedLocation: () => Promise<void>
}

const LocationContext = createContext<LocationContextValue | null>(null)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<SavedLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const saved = await AsyncStorage.getItem(SAVED_LOCATION_KEY)
        if (saved) {
          setLocation(JSON.parse(saved))
          setLoading(false)
          return
        }
      } catch {
        // AsyncStorage not available
      }

      const { status } = await ExpoLocation.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError(i18n.t('common.locationPermission'))
        setLoading(false)
        return
      }

      try {
        const pos = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.Balanced,
        })
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude })
      } catch {
        setError(i18n.t('common.locationFailed'))
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
    setLoading(true)
    setLocation(null)
    // Re-fetch GPS
    try {
      const pos = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      })
      setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude })
    } catch {
      setError(i18n.t('common.locationFailed'))
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <LocationContext.Provider value={{ location, loading, error, setManualLocation, clearSavedLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocationContext() {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocationContext must be used within LocationProvider')
  return ctx
}
