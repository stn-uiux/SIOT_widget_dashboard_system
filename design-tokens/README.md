# Design Tokens → 앱 연결

## 단일 소스: `design-tokens.json`

프로젝트 루트의 **`design-tokens.json`** 이 디자인 시스템 토큰의 단일 소스입니다.

- **colors**: brand(primary, primary_scale, secondary, gradient 등), status, semantic(light/dark/cyber)
- **layout**: borderRadius, spacing, dashboardPadding, shadow, widgetBorderWidth (아래 [Layout 토큰] 참고)
- **typography**: titleSize, titleWeight, contentSize, textTiny ~ textHero
- **components**: button, widget_card 등 (추후 CSS/컴포넌트에서 직접 참조 가능)

## Layout 토큰 — `design-tokens.json`의 `tokens.layout`

아래는 **design-tokens.json** 안의 `tokens.layout` 키입니다. (프로젝트 루트의 **chart-layout-tokens.json** 과는 별도 파일.)

| 토큰 | 설명 | 앱 사용처 |
|------|------|-----------|
| **borderRadius** | xs(4px), sm(8px), md(12px), lg(16px), xl(24px), full(9999px). 위젯·카드·버튼 모서리 둥글기 | `theme.borderRadius` → 위젯 카드, 차트 radius. themeFromTokens는 `lg` 사용 |
| **spacing** | xs(4px), sm(8px), md(16px), lg(24px), xl(32px). 요소 간 간격 스케일 | `theme.spacing` → 그리드/패딩. themeFromTokens는 `md` 사용 |
| **dashboardPadding** | 대시보드 전체 패딩 (기본 32px) | `theme.dashboardPadding` |
| **shadowBaseLight** | 라이트 모드 기본 카드 그림자 | `theme.cardShadow` (라이트 시) |
| **shadowBaseDark** | 다크 모드 기본 카드 그림자 | `theme.cardShadow` (다크 시) |
| **shadowPremium** | 버튼/프리미엄 요소용 그림자 | 컴포넌트에서 직접 참조 가능 |
| **widgetBorderWidth** | 위젯 카드 테두리 두께 (기본 1px) | `theme.borderWidth` |

## Chart layout tokens — `chart-layout-tokens.json` (프로젝트 루트)

**chart-layout-tokens.json** 은 차트·위젯 레이아웃용 토큰만 담은 별도 파일입니다. `design-tokens.json` 과 다릅니다.

| 경로 | 설명 | 사용처 |
|------|------|--------|
| **tokens.charts.bar** | mode(grouped/stacked), spacing, maxWidth | 차트 바 간격·최대 너비 |
| **tokens.charts.line** | tension, dotRadius | 라인 차트 곡선·점 크기 |
| **tokens.charts.common** | gridOpacity, legendPadding | 그리드·범례 여백 |
| **tokens.widgets.header** | height(48px), paddingX | 위젯 헤더 높이·패딩 |
| **tokens.widgets.content** | gap(16px) | 위젯 본문 간격 |

앱에서는 **WidgetCard.tsx** 가 `chart-layout-tokens.json` 을 import 해서 차트/위젯 스타일 값으로 사용합니다.

## 연결 구조

```
design-tokens.json
       │
       ▼
design-tokens/themeFromTokens.ts
  - tokensToDashboardTheme(tokens, mode, overrides)  → DashboardTheme
  - getDefaultThemeFromTokens()                       → 기본 Dark 테마
  - getLightThemeFromTokens()                        → Light 프리셋
       │
       ▼
constants.tsx
  - DEFAULT_THEME  = getDefaultTheme()  (토큰 기반, 실패 시 fallback)
  - THEME_PRESETS  = [ Light(토큰), Dark(토큰) ]
  - PROJECT2_CUSTOM_THEME = { ...DEFAULT_THEME, ...overrides }
       │
       ▼
DesignSystem.tsx
  - theme(primaryColor, backgroundColor, ...) 받아서 CSS 변수로 주입
```

## 토큰 수정 시

1. **`design-tokens.json`** 만 수정 (색, 간격, 타이포 등).
2. 앱은 **`themeFromTokens.ts`** 를 통해 이 값을 읽어 `DEFAULT_THEME` / 프리셋에 반영.
3. **`DesignSystem.tsx`** 는 기존처럼 `theme` 객체를 받아 CSS 변수로 적용하므로 변경 없음.

## 매핑 (themeFromTokens.ts)

| JSON 경로 | DashboardTheme 필드 |
|-----------|---------------------|
| colors.brand.primary.value | primaryColor |
| colors.semantic.{light,dark}.* | backgroundColor, surfaceColor, titleColor, textColor, borderColor |
| layout.borderRadius.lg | borderRadius |
| layout.spacing.md | spacing |
| layout.dashboardPadding | dashboardPadding |
| layout.shadowBaseDark / shadowBaseLight | cardShadow |
| layout.widgetBorderWidth | borderWidth |
| typography.* | titleSize, titleWeight, contentSize, textTiny ~ textHero |

앱 전용 필드(`chartLibrary`, `mode`, `showPageTabs` 등)는 코드에서 기본값으로 채웁니다.
