const en = {
  appName: 'Breath of Pollen',

  tabs: {
    today: 'Today',
    weekly: 'Weekly',
    settings: 'Settings',
  },

  common: {
    loading: 'Loading weather data...',
    error: 'Failed to load data',
    retry: 'Retry',
    today: 'Today',
    back: '← Back',
    autoDetect: 'Auto Detect',
    selectPrefecture: 'Select by prefecture',
  },

  pollen: {
    title: '🌿 Pollen',
    veryLow: 'Very Low',
    slightlyHigh: 'Slightly High',
    high: 'High',
    veryHigh: 'Very High',
    extreme: 'Extreme',
    offSeason: 'No pollen season right now',
    offSeasonShort: 'Off-Season',
  },

  plant: {
    cedar: 'Japanese Cedar',
    cypress: 'Japanese Cypress',
    pine: 'Pine',
    oak: 'Oak',
    weeds: 'Weeds',
  },

  weather: {
    sunny: 'Clear',
    partlyCloudy: 'Partly Cloudy',
    cloudy: 'Cloudy',
    foggy: 'Foggy',
    rainy: 'Rainy',
    snowy: 'Snowy',
    showers: 'Showers',
    thunderstorm: 'Thunderstorm',
    bringUmbrella: 'Bring an umbrella',
  },

  day: {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
  },

  hourly: {
    title: '⏰ Hourly',
    hourFormat: '{{h}}:00',
  },

  outfit: {
    cardTitle: '👔 Outfit',
    tapHint: 'Tap for details →',
    detailTitle: "Today's Outfit",
    pollenLabel: 'Pollen: {{level}}',
    recommended: 'Rec.',
    optional: 'Opt.',
    close: 'Close',
    tshirt: 'T-Shirt',
    shorts: 'Shorts',
    sunscreen: 'Sunscreen',
    pants: 'Pants',
    lightLayer: 'Light Layer',
    longSleeveShirt: 'Long Sleeve',
    lightJacket: 'Light Jacket',
    jacket: 'Jacket',
    coat: 'Coat',
    sweater: 'Sweater',
    heavyCoat: 'Heavy Coat',
    scarf: 'Scarf',
    gloves: 'Gloves',
    mask: 'Mask',
    sunglasses: 'Sunglasses',
    sunProtection: 'UV protection',
    pollenProtection: 'Pollen protection',
    warmthNeeded: 'Keep warm',
    warmthEssential: 'Warmth essential',
    tempOptimal: 'Perfect for {{temp}}°C',
  },

  outfitSummary: {
    hot: '{{temp}}°C – Hot, dress light',
    warm: '{{temp}}°C – Comfortable, light clothes',
    mild: '{{temp}}°C – Mild, long sleeves recommended',
    cool: '{{temp}}°C – Cool, light jacket recommended',
    cold: '{{temp}}°C – Cold, coat needed',
    veryCold: '{{temp}}°C – Very cold, bundle up',
    maskSuffixHigh: ' + Mask required (high pollen)',
    maskSuffixExtreme: ' + Mask required (extreme pollen)',
  },

  laundry: {
    ok: 'Outdoor OK',
    indoor: 'Dry Indoors',
    label: 'Laundry: {{status}}',
    okDesc: 'Low pollen & clear skies – safe to hang outside',
    indoorDesc: 'High pollen – drying indoors recommended',
  },

  uv: {
    label: 'UV Index',
    low: 'Low',
    medium: 'Moderate',
    high: 'High',
  },

  pm25: {
    label: 'Fine Dust',
    good: 'Good',
    moderate: 'Moderate',
    bad: 'Bad',
    unavailable: '-',
  },

  humidity: {
    label: 'Humidity',
  },

  weekly: {
    header: 'Weekly Forecast',
    krPollenDisclaimer: '* Pollen data is only available for 3 days in Korea.',
    dayCol: 'Date',
    weatherCol: 'Sky',
    pollenCol: '🌿',
    tempRange: '── Weekly Temp ──',
    pollenLegend: 'Pollen Level',
    dayFormat: '{{day}}',
  },

  settings: {
    header: 'Settings',
    location: 'Location',
    currentLocation: 'Current Location',
    changeLocation: 'Change Location',
    resetLocation: 'Reset to GPS',
    theme: 'Theme',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Language',
    appInfo: 'App Info',
    appName: 'Breath of Pollen',
    version: 'Version',
    dataProvider: 'Data',
    dataProviderKR: 'Korea Pollen (KMA)',
    sourceCode: 'Source Code',
    footer: 'Made with ❤️ for allergy sufferers',
  },

  comparison: {
    label: 'vs. Yesterday',
    tempColder: '{{diff}}°C colder',
    tempWarmer: '{{diff}}°C warmer',
    tempSimilar: 'Similar temp',
    pollenWorse: 'More pollen',
    pollenBetter: 'Less pollen',
    pollenSimilar: 'Similar pollen',
  },

  locationPicker: {
    heading: '📍 Select Region',
    subheading: 'Choose a region to display pollen and weather info',
    warning: '⚠️ Pollen data is unavailable for your current location. Please select a region.',
    japan: '🇯🇵 Japan',
    korea: '🇰🇷 Korea',
    confirmTitle: 'Change Region',
    confirmMessage: 'Set location to {{name}}?',
    confirmOk: 'Change',
    confirmCancel: 'Cancel',
  },
} as const

export default en
