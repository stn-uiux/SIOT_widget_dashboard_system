# Figma 변수 매핑 (design-tokens.json 기준)

앱의 `design-tokens.json` 및 `index.css` 변수와 동일한 값으로 Figma 변수(또는 스타일)를 만들 때 사용하세요.
**모드: 다크 (semantic.dark)**

## Color – Semantic Dark

| Figma 변수명 (권장) | design-tokens 경로 | HEX | RGBA (0-1) |
|---------------------|--------------------|-----|------------|
| background | colors.semantic.dark.background | #020617 | 0.0078, 0.0235, 0.09 |
| surface | colors.semantic.dark.surface | #0f172a | 0.059, 0.09, 0.165 |
| text_main | colors.semantic.dark.text_main | #f8fafc | 0.973, 0.98, 0.988 |
| text_secondary | colors.semantic.dark.text_secondary | #cbd5e1 | 0.796, 0.835, 0.882 |
| text_muted | colors.semantic.dark.text_muted | #94a3b8 | 0.58, 0.64, 0.72 |
| border_base | colors.semantic.dark.border_base | #1e293b | 0.118, 0.16, 0.231 |
| border_muted | colors.semantic.dark.border_muted | rgba(255,255,255,0.05) | 1,1,1,0.05 |
| surface_elevated | colors.semantic.dark.surface_elevated | #1e293b | 0.118, 0.16, 0.231 |

## Color – Brand

| Figma 변수명 | 경로 | HEX | RGBA (0-1) |
|--------------|------|-----|------------|
| primary | colors.brand.primary_scale.50 | #6366f1 | 0.39, 0.42, 0.96 |
| primary_scale_90 | colors.brand.primary_scale.90 | #272860 | 0.153, 0.157, 0.376 |

## Layout – 앱 메인 헤더와 동일

| 토큰 | 값 | 비고 |
|------|-----|------|
| header padding | 24px 12px | px-6 py-3 |
| header gap (left↔right) | 24px | gap-6 |
| header-left gap | 12px | gap-3 (로고 ↔ 타이틀 블록) |
| header-right gap | 8px | gap-2 |
| logo size | 40×40 | w-10 h-10 |
| btn padding | 8px 16px | .btn-base |
| btn gap | 8px | .btn-base gap |
| btn border-radius | 12px | calc(--border-radius * 0.75), --border-radius 16px |
| icon-box (library) | 20×20, radius 8px | w-5 h-5 rounded-md |
| divider | 1×24px | h-6 w-px |
| dashboard padding | 32px | layout.dashboardPadding |
| spacing md | 16px | layout.spacing.md |
| radius sm/md/lg | 8 / 12 / 16px | layout.borderRadius |

## Typography

| 토큰 | 값 |
|------|-----|
| title (h1) | 18px, 700 |
| project name | 10px, 700, uppercase |
| button label | 13px, 600 (btn-base) |
| badge PRO | 10px, 800, uppercase |

## 적용 순서 (Figma에서 – variable대로)

1. **Figma Variables** (Local variables 또는 Variables 모드)에서 위 표의 **Color** 변수 생성  
   (이름: `background`, `surface`, `text_main`, `text_muted`, `border_base`, `primary` 등).
2. **바인딩**
   - 메인·본문 배경 → `background` (#020617)
   - 헤더 배경 → `surface` (#0f172a)
   - 헤더 하단 테두리 → `border_base` (#1e293b)
   - 제목·버튼 텍스트 → `text_main` (#f8fafc)
   - 프로젝트명·탭·placeholder·chevron → `text_muted` (#94a3b8)
   - 라이브러리·모드 토글·페이지 탭 영역 배경 → `surface_elevated` (#1e293b)
   - 로고·PRO 뱃지·primary 강조 → `primary` (#6366f1)
3. **Layout** 값은 위 표 숫자대로 패딩/갭 적용 (24, 12, 8, 32px 등).

이렇게 하면 앱과 **variable대로** 동일한 스타일을 Figma에서 유지할 수 있습니다.
