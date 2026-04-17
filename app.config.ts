import { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: '花粉の呼吸',
  slug: 'pollen-app',
  version: '1.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'pollenapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#fdfdfd',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.pollenbreathing.app',
    buildNumber: '2',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: '現在地の天気・花粉情報を取得するために位置情報を使用します。',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.pollenbreathing.app',
  },
  plugins: [
    './plugins/withLocalizedAppName',
    'expo-router',
    'expo-localization',
    'expo-font',
    'expo-secure-store',
    'expo-web-browser',
    [
      'expo-location',
      {
        locationWhenInUsePermission: '現在地の天気・花粉情報を取得するために位置情報を使用します。',
      },
    ],
    [
      'expo-notifications',
      {
        color: '#f87171',
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
