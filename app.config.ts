import { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: '花粉の呼吸',
  slug: 'pollen-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'pollenapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.breathofpollen.app',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: '現在地の天気・花粉情報を取得するために位置情報を使用します。',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.breathofpollen.app',
  },
  plugins: [
    'expo-router',
    'expo-localization',
    [
      'expo-location',
      {
        locationWhenInUsePermission: '現在地の天気・花粉情報を取得するために位置情報を使用します。',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://breath-of-pollen.vercel.app',
  },
})
