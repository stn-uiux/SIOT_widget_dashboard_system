# Design Tokens → 앱 연결

## 단일 소스: `design-tokens.json`

프로젝트 루트의 **`design-tokens.json`** 이 디자인 시스템 토큰의 단일 소스입니다.

- **colors**: brand(primary, primary_scale, secondary, gradient 등), status, semantic(light/dark/cyber)
- **layout**: borderRadius, spacing, dashboardPadding, shadow, widgetBorderWidth
- **typography**: titleSize, titleWeight, contentSize, textTiny ~ textHero
- **components**: button, widget_card 등 (추후 CSS/컴포넌트에서 직접 참조 가능)

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
