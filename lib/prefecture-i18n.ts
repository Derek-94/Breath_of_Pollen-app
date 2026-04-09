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
