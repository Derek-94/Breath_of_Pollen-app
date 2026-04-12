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

  weekly: {
    header: '주간 예보',
    krPollenDisclaimer: '* 한국 꽃가루 데이터는 3일치만 제공됩니다.',
    dayCol: '날짜',
    weatherCol: '날씨',
    pollenCol: '🌿',
    tempRange: '── 이번 주 기온 ──',
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
    appInfo: '앱 정보',
    appName: '꽃가루의 호흡',
    version: '버전',
    dataProvider: '데이터 제공',
    dataProviderKR: '한국 꽃가루 (기상청)',
    sourceCode: '소스코드',
    footer: 'Made with ❤️ for allergy sufferers',
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
} as const

export default ko
