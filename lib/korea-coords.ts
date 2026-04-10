export interface KRRegion {
  lat: number
  lon: number
  /** 기상청 행정구역코드 (10자리) — 출처: 꽃가루농도지수 조회서비스(3.0) 행정구역코드 2025-03-10 */
  areaNo: string
}

export const KOREA_REGIONS: Record<string, KRRegion> = {
  '서울': { lat: 37.5636, lon: 126.9800, areaNo: '1100000000' },
  '부산': { lat: 35.1770, lon: 129.0770, areaNo: '2600000000' },
  '대구': { lat: 35.8685, lon: 128.6036, areaNo: '2700000000' },
  '인천': { lat: 37.4532, lon: 126.7074, areaNo: '2800000000' },
  '광주': { lat: 35.1570, lon: 126.8534, areaNo: '2900000000' },
  '대전': { lat: 36.3471, lon: 127.3866, areaNo: '3000000000' },
  '울산': { lat: 35.5354, lon: 129.3137, areaNo: '3100000000' },
  '세종': { lat: 36.4800, lon: 127.2891, areaNo: '3600000000' },
  '경기': { lat: 37.2718, lon: 127.0117, areaNo: '4100000000' },
  '충북': { lat: 36.6325, lon: 127.4936, areaNo: '4300000000' },
  '충남': { lat: 36.6588, lon: 126.6728, areaNo: '4400000000' },
  '전남': { lat: 34.8130, lon: 126.4650, areaNo: '4600000000' },
  '경북': { lat: 36.5760, lon: 128.5058, areaNo: '4700000000' },
  '경남': { lat: 35.2347, lon: 128.6942, areaNo: '4800000000' },
  '제주': { lat: 33.4857, lon: 126.5003, areaNo: '5000000000' },
  '강원': { lat: 37.8827, lon: 127.7320, areaNo: '5100000000' },
  '전북': { lat: 35.8173, lon: 127.1111, areaNo: '5200000000' },
}

export const KOREA_REGION_GROUPS: Record<string, string[]> = {
  '수도권': ['서울', '인천', '경기'],
  '강원': ['강원'],
  '충청': ['대전', '세종', '충북', '충남'],
  '전라': ['광주', '전북', '전남'],
  '경상': ['부산', '대구', '울산', '경북', '경남'],
  '제주': ['제주'],
}

export function findNearestKRRegion(lat: number, lon: number): string {
  let nearest = '서울'
  let minDist = Infinity
  for (const [name, region] of Object.entries(KOREA_REGIONS)) {
    const dist = (lat - region.lat) ** 2 + (lon - region.lon) ** 2
    if (dist < minDist) {
      minDist = dist
      nearest = name
    }
  }
  return nearest
}
