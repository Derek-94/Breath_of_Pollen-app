const ko = {
  appName: '꽃가루의 호흡',

  common: {
    loading: '날씨 정보를 불러오는 중...',
    error: '데이터를 불러오지 못했습니다',
    retry: '다시 시도',
    today: '오늘',
    back: '← 뒤로',
    autoDetect: '자동 감지',
    selectPrefecture: '도도부현에서 선택',
    locationPermission: '위치 권한이 필요합니다',
    locationFailed: '위치 정보를 가져오지 못했습니다',
  },

  tabs: {
    today: '오늘',
    weekly: '주간',
    settings: '설정',
  },

  pollen: {
    title: '🌿 꽃가루',
    veryLow: '매우 낮음',
    slightlyHigh: '약간 높음',
    high: '높음',
    veryHigh: '매우 높음',
    extreme: '극히 많음',
    offSeason: '현재 꽃가루 시즌이 아닙니다',
    offSeasonShort: '시즌 아님',
  },

  plant: {
    cedar: '삼나무',
    cypress: '편백나무',
    pine: '소나무',
    oak: '참나무',
    weeds: '잡초류',
  },

  weather: {
    sunny: '맑음',
    partlyCloudy: '구름 조금',
    cloudy: '흐림',
    foggy: '안개',
    rainy: '비',
    snowy: '눈',
    showers: '소나기',
    thunderstorm: '뇌우',
    bringUmbrella: '우산 챙기세요',
  },

  day: {
    0: '일',
    1: '월',
    2: '화',
    3: '수',
    4: '목',
    5: '금',
    6: '토',
  },

  hourly: {
    title: '⏰ 시간별',
    hourFormat: '{{h}}시',
  },

  outfit: {
    cardTitle: '👔 추천 코디',
    tapHint: '탭하여 자세히 보기 →',
    detailTitle: '오늘의 추천 코디',
    pollenLabel: '꽃가루: {{level}}',
    recommended: '추천',
    optional: '선택',
    close: '닫기',
    tshirt: '티셔츠',
    shorts: '반바지',
    sunscreen: '선크림',
    pants: '바지',
    lightLayer: '얇은 겉옷',
    longSleeveShirt: '긴팔 셔츠',
    lightJacket: '얇은 재킷',
    jacket: '라이트 재킷',
    coat: '코트',
    sweater: '스웨터',
    heavyCoat: '두꺼운 코트',
    scarf: '목도리',
    gloves: '장갑',
    mask: '마스크',
    sunglasses: '선글라스',
    sunProtection: '자외선 차단',
    pollenProtection: '꽃가루 대비',
    warmthNeeded: '방한 필요',
    warmthEssential: '방한 필수',
    tempOptimal: '{{temp}}°C에 딱 맞음',
  },

  outfitSummary: {
    hot: '{{temp}}°C로 더움 → 가볍게 입으세요',
    warm: '{{temp}}°C로 쾌적 → 얇은 옷차림으로',
    mild: '{{temp}}°C로 약간 서늘 → 긴팔 추천',
    cool: '{{temp}}°C로 쌀쌀 → 라이트 재킷 추천',
    cold: '{{temp}}°C로 추움 → 코트 필요',
    veryCold: '{{temp}}°C로 매우 추움 → 완전 방한을',
    maskSuffixHigh: '+마스크 필수 (꽃가루 많음)',
    maskSuffixExtreme: '+마스크 필수 (꽃가루 극히 많음)',
  },

  laundry: {
    ok: '야외 건조 OK',
    indoor: '실내 건조 권장!',
    label: '빨래: {{status}}',
    okDesc: '꽃가루 적고 맑은 예보로 안심하세요!',
    indoorDesc: '꽃가루가 많아 실내 건조를 권장합니다.',
    rainDesc: '비/눈 예보가 있어 빨래가 젖을 수 있어요. 실내 건조를 권장합니다.',
    bothDesc: '꽃가루도 많고 비도 와요. 실내 건조 필수!',
  },

  uv: {
    label: 'UV 지수',
    low: '약함',
    medium: '보통',
    high: '강함',
  },

  pm25: {
    label: '미세먼지',
    good: '좋음',
    moderate: '보통',
    bad: '나쁨',
    unavailable: '-',
  },

  humidity: {
    label: '습도',
  },

  infoDetail: {
    uv: {
      title: 'UV 지수',
      low: { desc: 'UV 낮음. 특별한 차단이 필요 없습니다.', tip: '자외선 걱정 없이 외출하세요.' },
      medium: { desc: 'UV 보통. 일부 차단을 권장합니다.', tip: 'SPF 30 이상 선크림과 모자를 착용하세요.' },
      high: { desc: 'UV 강함. 자외선 차단 필수.', tip: 'SPF 50+ 선크림·선글라스 착용 후 한낮 야외 활동을 자제하세요.' },
    },
    pm25: {
      title: '미세먼지 (PM2.5)',
      low: { desc: '공기질이 좋습니다.', tip: '야외 활동하기 좋은 날입니다.' },
      medium: { desc: '공기질이 보통입니다.', tip: '민감군(천식, 알레르기)은 장시간 야외 활동을 줄이는 게 좋아요.' },
      high: { desc: '공기질이 나쁩니다.', tip: '외출 시 마스크 착용 필수. 격한 야외 운동을 피하세요.' },
    },
    humidity: {
      title: '습도',
      low: { desc: '건조한 날씨입니다.', tip: '꽃가루가 쉽게 날립니다. 수분 보충과 보습에 신경 쓰세요.' },
      medium: { desc: '쾌적한 습도입니다.', tip: '적당한 습도는 꽃가루 확산을 줄여줍니다.' },
      high: { desc: '습도가 높습니다.', tip: '꽃가루는 상대적으로 덜 날리지만 곰팡이 포자에 주의하세요.' },
    },
  },

  pollenDetail: {
    title: '🌿 꽃가루 상세',
    todaySection: '오늘의 꽃가루',
    weeklySection: '이번 주 예보',
    tip: {
      1: '꽃가루 농도가 낮습니다. 평소처럼 외출하셔도 됩니다.',
      2: '꽃가루가 약간 있어요. 알레르기가 있다면 가벼운 마스크를 챙기세요.',
      3: '꽃가루가 많습니다. 외출 시 마스크 착용을 권장합니다.',
      4: '꽃가루가 매우 많습니다. KF94 마스크와 보호 안경을 착용하고 귀가 후 세안하세요.',
      5: '꽃가루가 극히 많습니다. 외출을 최소화하고, 환기도 자제하세요.',
    },
  },

  weekly: {
    header: '주간 예보',
    krPollenDisclaimer: '* 한국 꽃가루 데이터는 3일치만 제공됩니다.',
    dayCol: '날짜',
    weatherCol: '날씨',
    pollenCol: '🌿',
    tempRange: '이번 주 기온',
    pollenLegend: '꽃가루 레벨',
    dayFormat: '{{day}}',
  },

  settings: {
    header: '설정',
    location: '지역',
    currentLocation: '현재 지역',
    changeLocation: '위치 변경',
    resetLocation: 'GPS 자동 감지로 돌아가기',
    theme: '테마',
    themeSystem: '시스템',
    themeLight: '라이트',
    themeDark: '다크',
    language: '언어',
    notification: '알림',
    notifToggle: '저녁 꽃가루 알림',
    notifMorningToggle: '아침 꽃가루 알림',
    notifTime: '알림 시간',
    notifSaved: '✓ 저장됨',
    notifTest: '지금 테스트 알림 보내기',
    notifPermissionDenied: '설정 앱에서 알림 권한을 허용해주세요',
    appInfo: '앱 정보',
    appName: '꽃가루의 호흡',
    version: '버전',
    dataProvider: '데이터 제공',
    dataProviderKR: '한국 꽃가루 (기상청)',
    sourceCode: '소스코드',
    footer: 'Made with ❤️ for allergy sufferers',
  },

  review: {
    title: '앱이 도움이 되고 있나요? 🌿',
    body: '좋은 평가는 더 많은 사람들에게 앱을 알리는 데 큰 힘이 돼요.',
    confirm: '네, 별점 남길게요 ⭐',
    dismiss: '나중에',
  },

  comparison: {
    label: '어제 대비',
    tempColder: '{{diff}}°C 더 추워요',
    tempWarmer: '{{diff}}°C 더 따뜻해요',
    tempSimilar: '기온 비슷해요',
    pollenWorse: '꽃가루 심해요',
    pollenBetter: '꽃가루 나아요',
    pollenSimilar: '꽃가루 비슷해요',
  },

  locationPicker: {
    heading: '📍 지역 선택',
    subheading: '꽃가루·날씨 정보를 표시할 지역을 선택해주세요',
    warning: '⚠️ 현재 위치에서는 꽃가루 데이터를 사용할 수 없습니다. 지역을 선택해주세요.',
    japan: '🇯🇵 일본',
    korea: '🇰🇷 한국',
    confirmTitle: '지역 변경',
    confirmMessage: '{{name}}으로 설정을 바꾸겠습니까?',
    confirmOk: '변경',
    confirmCancel: '취소',
  },

  whatsNew: {
    title: '새로운 기능 🎉',
    confirm: '확인',
    v110: {
      notif: { title: '꽃가루 알림', desc: '아침·저녁 두 번, 분 단위로 알림 시간을 설정할 수 있어요' },
      onboarding: { title: '온보딩 화면', desc: '첫 실행 시 앱 소개 및 알림 설정 안내' },
    },
    v120: {
      region: { title: '한국 지역 세분화', desc: '시/군/구 단위까지 세밀하게 선택할 수 있어요' },
      lang: { title: '다국어 표시 개선', desc: '지역명이 설정 언어에 맞게 정확히 표시돼요' },
      android: { title: 'Android 버전 출시 예정', desc: 'Google Play에서 곧 만나볼 수 있어요 🎉' },
    },
  },

  onboarding: {
    intro: {
      title: '꽃가루 & 날씨 한눈에 🌿',
      body: '오늘의 꽃가루 수치, 날씨, 코디 추천까지\n매일 스마트하게 준비하세요.',
      next: '시작하기',
    },
    notif: {
      title: '알림 설정',
      body: '내일 꽃가루, 날씨 정보를\n설정한 시간에 알려드릴게요 🙋‍♂️',
      enable: '알림 켜기 🔔',
      skip: '나중에',
    },
  },
} as const

export default ko
