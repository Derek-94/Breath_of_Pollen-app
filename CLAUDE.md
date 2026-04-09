# 花粉の呼吸 (Breath of Pollen)

일본 花粉 & 날씨 React Native (Expo) iOS 앱.

## Tech Stack
- Expo SDK 54, Expo Router v6 (파일 기반 라우팅, tabs)
- React Native (TypeScript)
- `@/contexts/ThemeContext` — 다크모드 (`useTheme()` → `isDark`)
- `@/lib/weather-utils` — 花粉 레벨, 색상, 라벨 유틸
- `@/lib/prefecture-coords` — 47개 도도부현 좌표

## 최근 작업 (2026-04-09)
- OutfitDetail 바텀시트: 슬라이드업 애니메이션 + 드래그로 닫기 (PanResponder)
- 다크모드 laundryCard 수정

## 출시 전 TODO

### 1. 로그 수집
- PostHog 추천 (무료 월 1M 이벤트, RN SDK 지원, 펀넬 분석)
- 대안: Firebase Analytics, Aptabase

### 2. 앱 스토어 준비물
**iOS:**
- 스크린샷: 6.7인치, 6.1인치 최소 2장씩
- 앱 아이콘: 1024x1024
- 앱 설명 (짧은 30자 + 긴 4000자)
- 개인정보 처리방침 URL (필수)
- 카테고리: Weather 또는 Health & Fitness

**Android:**
- Feature Graphic: 1024x500
- 스크린샷 최소 2장
- 개인정보 처리방침 + 데이터 안전성 양식

### 3. API 키 보안 (우선순위 높음)
- 현재: 클라이언트에 API 키 하드코딩 → 디컴파일 시 노출 위험
- 해결: Cloudflare Workers 프록시 (무료 10만 req/일)
  - 앱 → 프록시 → 실제 API (키는 서버에만)
- 대안: Vercel Edge Function, Supabase Edge Function
- 어떤 API 쓰는지 코드 확인 후 프록시 설정 필요

## 응답 규칙
- 한국어로 대답할 것
