const ja = {
  appName: '花粉の呼吸',

  tabs: {
    today: '今日',
    weekly: '週間',
    settings: '設定',
  },

  common: {
    loading: '天気情報を取得中...',
    error: 'データの取得に失敗しました',
    retry: '再試行',
    today: '今日',
    back: '← 戻る',
    autoDetect: '自動検出',
    selectPrefecture: '都道府県から選ぶ',
  },

  pollen: {
    title: '🌿 花粉',
    veryLow: '少ない',
    slightlyHigh: 'やや多い',
    high: '多い',
    veryHigh: '非常に多い',
    extreme: '極めて多い',
    offSeason: '現在は花粉シーズンではありません',
    offSeasonShort: 'シーズン外',
  },

  plant: {
    cedar: 'スギ',
    cypress: 'ヒノキ',
    pine: '松',
    oak: 'ナラ',
    weeds: '雑草',
  },

  weather: {
    sunny: '快晴',
    partlyCloudy: '晴れ時々曇り',
    cloudy: '曇り',
    foggy: '霧',
    rainy: '雨',
    snowy: '雪',
    showers: 'にわか雨',
    thunderstorm: '雷雨',
    bringUmbrella: '傘をお忘れなく',
  },

  day: {
    0: '日',
    1: '月',
    2: '火',
    3: '水',
    4: '木',
    5: '金',
    6: '土',
  },

  hourly: {
    title: '⏰ 時間別',
    hourFormat: '{{h}}時',
  },

  outfit: {
    cardTitle: '👔 おすすめコーデ',
    tapHint: 'タップして詳細を見る →',
    detailTitle: '今日のおすすめコーデ',
    pollenLabel: '花粉: {{level}}',
    recommended: 'おすすめ',
    optional: '任意',
    close: '閉じる',
    tshirt: 'Tシャツ',
    shorts: 'ショートパンツ',
    sunscreen: '日焼け止め',
    pants: 'パンツ',
    lightLayer: '薄手の羽織',
    longSleeveShirt: '長袖シャツ',
    lightJacket: '薄手ジャケット',
    jacket: 'ライトジャケット',
    coat: 'コート',
    sweater: 'セーター',
    heavyCoat: '厚手コート',
    scarf: 'マフラー',
    gloves: '手袋',
    mask: 'マスク',
    sunglasses: 'サングラス',
    sunProtection: '紫外線対策',
    pollenProtection: '花粉対策',
    warmthNeeded: '防寒に必要',
    warmthEssential: '防寒必須',
    tempOptimal: '気温{{temp}}°Cに最適',
  },

  outfitSummary: {
    hot: '気温{{temp}}°Cと暑め → 薄着で',
    warm: '気温{{temp}}°Cと快適 → 薄手の服装で',
    mild: '気温{{temp}}°Cとやや涼しめ → 長袖がおすすめ',
    cool: '気温{{temp}}°Cと肌寒め → ライトジャケットがおすすめ',
    cold: '気温{{temp}}°Cと寒い → コートが必要',
    veryCold: '気温{{temp}}°Cと厳しい寒さ → しっかり防寒を',
    maskSuffixHigh: '＋マスク必須（花粉多め）',
    maskSuffixExtreme: '＋マスク必須（花粉極多）',
  },

  laundry: {
    ok: '外干しOK',
    indoor: '部屋干し推奨',
    label: '洗濯物: {{status}}',
    okDesc: '花粉少なめ＆晴れ予報で安心',
    indoorDesc: '花粉が多いため室内干しがおすすめ',
    rainDesc: '雨／雪の予報があるため室内干しがおすすめ',
    bothDesc: '花粉も多く雨の予報もあり、室内干し必須',
  },

  uv: {
    label: 'UV指数',
    low: '弱い',
    medium: '中程度',
    high: '強い',
  },

  pm25: {
    label: '微細粒子',
    good: '良好',
    moderate: '普通',
    bad: '悪い',
    unavailable: '-',
  },

  humidity: {
    label: '湿度',
  },

  infoDetail: {
    uv: {
      title: 'UV指数',
      low: { desc: 'UV低め。特別な対策は不要です。', tip: '日焼け止めなしでも安全に外出できます。' },
      medium: { desc: 'UV中程度。対策を推奨します。', tip: 'SPF30以上の日焼け止めと帽子を着用してください。' },
      high: { desc: 'UV強め。対策必須です。', tip: 'SPF50+日焼け止め・サングラスを着用し、日中の外出を控えましょう。' },
    },
    pm25: {
      title: '微細粒子（PM2.5）',
      low: { desc: '空気質は良好です。', tip: '屋外活動に最適な日です。' },
      medium: { desc: '空気質は普通です。', tip: '喘息・アレルギーなど敏感な方は長時間の屋外活動を控えてください。' },
      high: { desc: '空気質が悪化しています。', tip: '外出時はマスク着用を。激しい屋外運動は避けましょう。' },
    },
    humidity: {
      title: '湿度',
      low: { desc: '乾燥した天気です。', tip: '花粉が舞いやすい状態です。水分補給と保湿を心がけてください。' },
      medium: { desc: '快適な湿度です。', tip: '適度な湿度は花粉の飛散を抑えてくれます。' },
      high: { desc: '湿度が高めです。', tip: '花粉は比較的飛びにくいですが、カビ胞子に注意してください。' },
    },
  },

  pollenDetail: {
    title: '🌿 花粉の詳細',
    todaySection: '今日の花粉',
    weeklySection: '今週の予報',
    tip: {
      1: '花粉は少ないです。いつも通りお出かけいただけます。',
      2: '花粉がやや多めです。アレルギーがある方はマスクを携帯しましょう。',
      3: '花粉が多いです。外出時はマスクの着用をお勧めします。',
      4: '花粉が非常に多いです。不織布マスクと保護メガネを着用し、帰宅後は洗顔を。',
      5: '花粉が極めて多いです。外出を控え、換気も最小限にしてください。',
    },
  },

  weekly: {
    header: '週間予報',
    krPollenDisclaimer: '* 韓国の花粉データは3日分のみ提供されます。',
    dayCol: '日付',
    weatherCol: '天気',
    pollenCol: '花粉',
    tempRange: '今週の気温',
    pollenLegend: '花粉レベル',
    dayFormat: '{{day}}曜',
  },

  settings: {
    header: '設定',
    location: '地域',
    currentLocation: '現在の地域',
    changeLocation: '都道府県を変更',
    resetLocation: 'GPS自動検出に戻す',
    theme: 'テーマ',
    themeSystem: 'システム',
    themeLight: 'ライト',
    themeDark: 'ダーク',
    language: '言語',
    notification: '通知',
    notifToggle: '夕方の花粉アラート',
    notifMorningToggle: '朝の花粉アラート',
    notifTime: '通知時刻',
    notifSaved: '✓ 保存しました',
    notifTest: '今すぐテスト通知を送る',
    notifPermissionDenied: '設定アプリで通知を許可してください',
    appInfo: 'アプリ情報',
    appName: '花粉の呼吸',
    version: 'バージョン',
    dataProvider: 'データ提供',
    dataProviderKR: '韓国花粉（気象庁）',
    sourceCode: 'ソースコード',
    footer: '花粉症で悩む皆さんのために ❤️',
  },

  review: {
    title: 'アプリはお役に立てていますか？🌿',
    body: '高評価はより多くの方にアプリを知っていただく力になります。',
    confirm: 'はい、評価する ⭐',
    dismiss: 'あとで',
  },

  comparison: {
    label: '昨日と比較',
    tempColder: '{{diff}}°C 寒い',
    tempWarmer: '{{diff}}°C 暖かい',
    tempSimilar: '気温は昨日と同じ',
    pollenWorse: '花粉が多め',
    pollenBetter: '花粉が少なめ',
    pollenSimilar: '花粉は昨日と同じ',
  },

  locationPicker: {
    heading: '📍 地域を選択',
    subheading: '花粉・天気情報を表示する地域を選んでください',
    warning: '⚠️ 現在地では花粉データが利用できません。地域を選択してください。',
    japan: '🇯🇵 日本',
    korea: '🇰🇷 韓国',
    confirmTitle: '地域を変更',
    confirmMessage: '{{name}}に変更しますか？',
    confirmOk: '変更',
    confirmCancel: 'キャンセル',
  },

  whatsNew: {
    title: '新機能 🎉',
    confirm: '確認',
    v110: {
      notif: { title: '花粉アラート', desc: '朝・夕の2回、分単位で通知時間を設定できます' },
      onboarding: { title: 'オンボーディング画面', desc: '初回起動時にアプリ紹介と通知設定をご案内' },
    },
  },

  onboarding: {
    intro: {
      title: '花粉・天気をひと目で 🌿',
      body: '今日の花粉レベル、天気、コーデ提案まで\n毎朝スマートに準備しましょう。',
      next: 'はじめる',
    },
    notif: {
      title: '通知設定',
      body: '明日の花粉・天気情報を\n設定した時間にお知らせします 🙋‍♂️',
      enable: '通知をオンにする 🔔',
      skip: 'あとで',
    },
  },
} as const

export default ja
export type TranslationKeys = typeof ja
