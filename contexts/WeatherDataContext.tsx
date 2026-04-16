import { createContext, useContext, type ReactNode } from 'react'
import { useWeatherData, type AppData } from '@/hooks/useWeatherData'
import { useLocationContext } from '@/contexts/LocationContext'

interface WeatherDataContextValue {
  data: AppData | null
  loading: boolean
  error: string | null
  pollenUnavailable: boolean
  refetch: () => Promise<void>
}

const WeatherDataContext = createContext<WeatherDataContextValue | null>(null)

export function WeatherDataProvider({ children }: { children: ReactNode }) {
  const { location } = useLocationContext()
  const weatherData = useWeatherData(
    location?.lat ?? null,
    location?.lon ?? null,
    location?.name,
  )
  return (
    <WeatherDataContext.Provider value={weatherData}>
      {children}
    </WeatherDataContext.Provider>
  )
}

export function useWeatherDataContext() {
  const ctx = useContext(WeatherDataContext)
  if (!ctx) throw new Error('useWeatherDataContext must be used within WeatherDataProvider')
  return ctx
}
