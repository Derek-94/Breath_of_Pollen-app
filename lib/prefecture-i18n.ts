/**
 * Romanized display names for all 47 prefectures.
 * Keys match PREFECTURE_COORDS keys (Japanese names).
 */
export const PREFECTURE_ROMANIZED: Record<string, string> = {
  '北海道':   'Hokkaido',
  '青森県':   'Aomori',
  '岩手県':   'Iwate',
  '宮城県':   'Miyagi',
  '秋田県':   'Akita',
  '山形県':   'Yamagata',
  '福島県':   'Fukushima',
  '東京都':   'Tokyo',
  '神奈川県': 'Kanagawa',
  '埼玉県':   'Saitama',
  '千葉県':   'Chiba',
  '茨城県':   'Ibaraki',
  '栃木県':   'Tochigi',
  '群馬県':   'Gunma',
  '新潟県':   'Niigata',
  '富山県':   'Toyama',
  '石川県':   'Ishikawa',
  '福井県':   'Fukui',
  '山梨県':   'Yamanashi',
  '長野県':   'Nagano',
  '岐阜県':   'Gifu',
  '静岡県':   'Shizuoka',
  '愛知県':   'Aichi',
  '三重県':   'Mie',
  '滋賀県':   'Shiga',
  '京都府':   'Kyoto',
  '大阪府':   'Osaka',
  '兵庫県':   'Hyogo',
  '奈良県':   'Nara',
  '和歌山県': 'Wakayama',
  '鳥取県':   'Tottori',
  '島根県':   'Shimane',
  '岡山県':   'Okayama',
  '広島県':   'Hiroshima',
  '山口県':   'Yamaguchi',
  '徳島県':   'Tokushima',
  '香川県':   'Kagawa',
  '愛媛県':   'Ehime',
  '高知県':   'Kochi',
  '福岡県':   'Fukuoka',
  '佐賀県':   'Saga',
  '長崎県':   'Nagasaki',
  '熊本県':   'Kumamoto',
  '大分県':   'Oita',
  '宮崎県':   'Miyazaki',
  '鹿児島県': 'Kagoshima',
  '沖縄県':   'Okinawa',
}

/**
 * Emoji for ~12 most-visited tourist prefectures.
 * Shown as a prefix on the chip when language is not Japanese.
 */
export const PREFECTURE_HIGHLIGHT_EMOJI: Record<string, string> = {
  '北海道':   '❄️',
  '東京都':   '🗼',
  '神奈川県': '⛵',  // Yokohama harbor
  '長野県':   '⛷️',  // ski resort
  '静岡県':   '🍵',  // green tea & Mt. Fuji view
  '愛知県':   '🏯',  // Nagoya Castle
  '京都府':   '⛩️',
  '大阪府':   '🐙',  // takoyaki
  '奈良県':   '🦌',
  '広島県':   '🕊️',  // peace memorial
  '福岡県':   '🍜',  // Hakata ramen
  '沖縄県':   '🌺',
}

/**
 * Romanized region names for non-Japanese UI.
 * Keys match REGIONS keys.
 */
export const REGIONS_ROMANIZED: Record<string, string> = {
  '北海道・東北': 'Hokkaido & Tōhoku',
  '関東':         'Kantō',
  '中部':         'Chūbu',
  '近畿':         'Kinki / Kansai',
  '中国':         'Chūgoku',
  '四国':         'Shikoku',
  '九州・沖縄':   'Kyūshū & Okinawa',
}

/** Katakana names for Korean 시/도 (Japanese UI). Keys match KOREA_REGIONS keys. */
export const KOREA_KATAKANA: Record<string, string> = {
  '서울': 'ソウル',
  '부산': 'プサン',
  '대구': 'テグ',
  '인천': 'インチョン',
  '광주': 'クァンジュ',
  '대전': 'テジョン',
  '울산': 'ウルサン',
  '세종': 'セジョン',
  '경기': 'キョンギ',
  '강원': 'カンウォン',
  '충북': 'チュンブク',
  '충남': 'チュンナム',
  '전북': 'チョンブク',
  '전남': 'チョンナム',
  '경북': 'キョンブク',
  '경남': 'キョンナム',
  '제주': 'チェジュ',
}

/** Romanized names for Korean 시/도. Keys match KOREA_REGIONS keys. */
export const KOREA_ROMANIZED: Record<string, string> = {
  '서울': 'Seoul',
  '부산': 'Busan',
  '대구': 'Daegu',
  '인천': 'Incheon',
  '광주': 'Gwangju',
  '대전': 'Daejeon',
  '울산': 'Ulsan',
  '세종': 'Sejong',
  '경기': 'Gyeonggi',
  '강원': 'Gangwon',
  '충북': 'Chungbuk',
  '충남': 'Chungnam',
  '전북': 'Jeonbuk',
  '전남': 'Jeonnam',
  '경북': 'Gyeongbuk',
  '경남': 'Gyeongnam',
  '제주': 'Jeju',
}

/** Emoji highlights for Korean regions */
export const KOREA_HIGHLIGHT_EMOJI: Record<string, string> = {
  '서울': '🗼',
  '부산': '🌊',
  '제주': '🌺',
  '경주': '🏯',
}

/** Romanized group names for Korean regions */
export const KOREA_GROUPS_ROMANIZED: Record<string, string> = {
  '수도권': 'Seoul Metro',
  '강원':   'Gangwon',
  '충청':   'Chungcheong',
  '전라':   'Jeolla',
  '경상':   'Gyeongsang',
  '제주':   'Jeju',
}

/**
 * Returns a localized display name for a stored location key.
 * - Japanese UI: returns the key as-is
 * - English/Korean UI: returns romanized name for JP prefectures, romanized for KR regions in English
 * - Unknown keys (GPS geocoded names): returns as-is
 */
export function localizeLocationName(name: string, language: string): string {
  if (language === 'ja') {
    // JP prefectures are already Japanese; KR regions → Katakana
    return KOREA_KATAKANA[name] ?? name
  }
  if (PREFECTURE_ROMANIZED[name]) return PREFECTURE_ROMANIZED[name]
  if (language === 'en' && KOREA_ROMANIZED[name]) return KOREA_ROMANIZED[name]
  return name
}
