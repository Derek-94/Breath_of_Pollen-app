const en = {
  appName: 'Pollen Breathing',

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
    rainDesc: 'Rain or snow expected – dry indoors to avoid soaking',
    bothDesc: 'High pollen + rain – indoor drying essential',
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

  infoDetail: {
    uv: {
      title: 'UV Index',
      low: { desc: 'Low UV. No special protection needed.', tip: 'Safe to be outside without protection.' },
      medium: { desc: 'Moderate UV. Some protection recommended.', tip: 'Apply SPF 30+ sunscreen and wear a hat.' },
      high: { desc: 'High UV. Protection essential.', tip: 'Wear SPF 50+, sunglasses, and avoid midday sun.' },
    },
    pm25: {
      title: 'Fine Dust (PM2.5)',
      low: { desc: 'Air quality is good.', tip: 'Great conditions for outdoor activities.' },
      medium: { desc: 'Acceptable air quality.', tip: 'Sensitive groups (asthma, allergies) may want to limit prolonged outdoor time.' },
      high: { desc: 'Poor air quality.', tip: 'Wear a mask outdoors. Avoid strenuous exercise outside.' },
    },
    humidity: {
      title: 'Humidity',
      low: { desc: 'Dry air conditions.', tip: 'Pollen spreads more easily. Stay hydrated and moisturize.' },
      medium: { desc: 'Comfortable humidity.', tip: 'Moderate humidity helps keep pollen levels lower.' },
      high: { desc: 'High humidity.', tip: 'Pollen tends to stay grounded. Watch out for mold spores instead.' },
    },
  },

  pollenDetail: {
    title: '🌿 Pollen Detail',
    todaySection: "Today's Pollen",
    weeklySection: 'This Week',
    tip: {
      1: 'Pollen count is low. No special precautions needed.',
      2: 'Pollen is slightly elevated. Keep a mask handy if you have allergies.',
      3: 'Pollen count is high. Wear a mask when going outside.',
      4: 'Pollen count is very high. Wear a mask and protective eyewear, and wash your face after returning home.',
      5: 'Pollen count is extreme. Minimize outings and keep windows closed.',
    },
  },

  weekly: {
    header: 'Weekly Forecast',
    krPollenDisclaimer: '* Pollen data is only available for 3 days in Korea.',
    dayCol: 'Date',
    weatherCol: 'Sky',
    pollenCol: '🌿',
    tempRange: 'Weekly Temp',
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
    notification: 'Notifications',
    notifToggle: 'Evening pollen alert',
    notifTime: 'Alert time',
    notifSaved: '✓ Saved',
    notifTest: 'Send test notification now',
    notifPermissionDenied: 'Please enable notifications in the Settings app',
    appInfo: 'App Info',
    appName: 'Pollen Breathing',
    version: 'Version',
    dataProvider: 'Data',
    dataProviderKR: 'Korea Pollen (KMA)',
    sourceCode: 'Source Code',
    footer: 'Made with ❤️ for allergy sufferers',
  },

  review: {
    title: 'Enjoying the app? 🌿',
    body: 'A quick rating helps others discover the app and keeps us motivated.',
    confirm: 'Rate us ⭐',
    dismiss: 'Later',
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

  whatsNew: {
    title: "What's New 🎉",
    confirm: 'Got it',
    v110: {
      notif: { title: 'Pollen Alert', desc: 'Get tomorrow\'s pollen forecast every evening' },
      onboarding: { title: 'Onboarding Screen', desc: 'App intro and notification setup on first launch' },
    },
  },

  onboarding: {
    intro: {
      title: 'Pollen & Weather at a Glance 🌿',
      body: "Today's pollen level, weather, and outfit tips—\nget ready smarter every day.",
      next: "Let's Start",
    },
    notif: {
      title: 'Notification Setup',
      body: "We'll send you tomorrow's pollen\nand weather info at your chosen time 🙋‍♂️",
      enable: 'Enable Notifications 🔔',
      skip: 'Later',
    },
  },
} as const

export default en
