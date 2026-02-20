# Pencil ↔ design-tokens.json 매핑

Pencil(.pen) 변수는 **design-tokens.json**을 단일 소스로 사용합니다.  
토큰 변경 시: `design-tokens.json` 수정 → 이 매핑 문서 갱신 → Pencil `set_variables` 또는 수동 변수 반영.

---

## 1. 색상 (tokens.colors)

### Brand (`tokens.colors.brand`)
| design-tokens.json 경로 | CSS 변수 (앱) | Pencil 변수 | Light | Dark |
|-------------------------|---------------|-------------|-------|------|
| brand.primary | `--primary-color` | `--primary` | #3b82f6 | #6366f1 |
| brand.secondary | `--secondary-color` | `--secondary` | #6366f1 | #6366f1 |
| brand.primary_gradient | `--primary-gradient` | (참고용) | linear-gradient(135deg, #3b82f6, #6366f1) | — |
| brand.primary_subtle | `--primary-subtle` | `--primary-subtle` | rgba(59,130,246,0.1) | rgba(59,130,246,0.1) |
| brand.premium_start | — | `--premium-start` | #7c3aed | #7c3aed |
| brand.premium_end | — | `--premium-end` | #db2777 | #db2777 |
| brand.neon_cyan | (Cyber) | — | #00e5ff | — |

#### Primary scale (brand.primary_scale)
| design-tokens.json 경로 | CSS 변수 (앱) | Pencil 변수 | 값 |
|-------------------------|---------------|-------------|-----|
| brand.primary_scale.5 | `--primary-5` | `--primary-5` | #a5aaff |
| brand.primary_scale.10 | `--primary-10` | `--primary-10` | #9ea3ff |
| brand.primary_scale.20 | `--primary-20` | `--primary-20` | #8f93ff |
| brand.primary_scale.30 | `--primary-30` | `--primary-30` | #8084ff |
| brand.primary_scale.40 | `--primary-40` | `--primary-40` | #7175ff |
| brand.primary_scale.50 | `--primary-50` | `--primary-50` | #6366f1 (base) |
| brand.primary_scale.60 | `--primary-60` | `--primary-60` | #5456cc |
| brand.primary_scale.70 | `--primary-70` | `--primary-70` | #4547a8 |
| brand.primary_scale.80 | `--primary-80` | `--primary-80` | #363884 |
| brand.primary_scale.90 | `--primary-90` | `--primary-90` | #272860 |
| brand.primary_scale.95 | `--primary-95` | `--primary-95` | #20214e |

### Semantic – Light (`tokens.colors.semantic.light`)
| design-tokens.json 경로 | CSS 변수 | Pencil 변수 | 값 |
|-------------------------|----------|-------------|-----|
| semantic.light.background | `--background` | `--background` | #f8fafc |
| semantic.light.surface | `--surface` | `--surface` | #ffffff |
| semantic.light.text_main | `--text-main` | `--text-main` | #0f172a |
| semantic.light.text_secondary | `--text-secondary` | `--text-secondary` | #334155 |
| semantic.light.text_muted | `--text-muted` | `--text-muted` | #64748b |
| semantic.light.border_base | `--border-base` | `--border-base` | #e2e8f0 |
| semantic.light.border_muted | `--border-muted` | `--border-muted` | #f1f5f9 |
| semantic.light.border_strong | `--border-strong` | `--border-strong` | #cbd5e1 |
| semantic.light.surface_elevated | (앱 보조) | `--surface-elevated` | #f1f5f9 |
| (surface_elevated 동일) | `--surface-muted` | `--surface-muted` | #f1f5f9 |

### Semantic – Dark (`tokens.colors.semantic.dark`)
| design-tokens.json 경로 | CSS 변수 | Pencil 변수 | 값 |
|-------------------------|----------|-------------|-----|
| semantic.dark.background | `--background` | `--background` | #020617 |
| semantic.dark.surface | `--surface` | `--surface` | #0f172a |
| semantic.dark.text_main | `--text-main` | `--text-main` | #f8fafc |
| semantic.dark.text_secondary | `--text-secondary` | `--text-secondary` | #cbd5e1 |
| semantic.dark.text_muted | `--text-muted` | `--text-muted` | #94a3b8 |
| semantic.dark.border_base | `--border-base` | `--border-base` | #1e293b |
| semantic.dark.border_muted | `--border-muted` | `--border-muted` | rgba(255,255,255,0.05) |
| semantic.dark.border_strong | `--border-strong` | `--border-strong` | rgba(255,255,255,0.15) |
| semantic.dark.surface_elevated | (앱 보조) | `--surface-elevated` | #1e293b |
| (surface_elevated 동일) | `--surface-muted` | `--surface-muted` | #1e293b |

### Status (`tokens.colors.status`)
| design-tokens.json 경로 | CSS 변수 | Pencil 변수 | 값 |
|-------------------------|----------|-------------|-----|
| status.success | `--success` | `--success` | #10b981 |
| status.error | `--error` | `--error` | #ef4444 |
| status.warning | `--warning` | `--warning` | #f59e0b |
| status.info | `--info` | `--info` | #3b82f6 |

### Cyber (`tokens.colors.semantic.cyber`)
| design-tokens.json 경로 | CSS 변수 (앱 .cyber) | 값 |
|-------------------------|------------------------|-----|
| cyber.background | `--background` | #02040a |
| cyber.surface | `--surface` | rgba(13, 15, 41, 0.7) |
| cyber.accent | (primary 등) | #00e5ff |

---

## 2. 레이아웃 (tokens.layout)

### Border Radius (`tokens.layout.borderRadius`)
| design-tokens.json 경로 | CSS 변수 | Pencil 변수 | 값 (숫자) |
|-------------------------|----------|-------------|-----------|
| layout.borderRadius.xs | `--radius-xs` | `--radius-xs` | 4 |
| layout.borderRadius.sm | `--radius-sm` | `--radius-sm` | 8 |
| layout.borderRadius.md | `--radius-md` | `--radius-md` | 12 |
| layout.borderRadius.lg | `--radius-lg` | `--radius-lg` | 16 |
| layout.borderRadius.xl | `--radius-xl` | `--radius-xl` | 24 |

### Spacing (`tokens.layout.spacing`)
| design-tokens.json 경로 | CSS 변수 | Pencil 변수 | 값 (숫자) |
|-------------------------|----------|-------------|-----------|
| layout.spacing.xs | `--spacing-xs` | `--spacing-xs` | 4 |
| layout.spacing.sm | `--spacing-sm` | `--spacing-sm` | 8 |
| layout.spacing.md | `--spacing-md` | `--spacing-md` | 16 |
| layout.spacing.lg | `--spacing-lg` | `--spacing-lg` | 24 |
| layout.spacing.xl | `--spacing-xl` | `--spacing-xl` | 32 |

### Dashboard & Shadow (`tokens.layout`)
| design-tokens.json 경로 | CSS 변수 | Pencil 변수 | Light | Dark |
|-------------------------|----------|-------------|-------|------|
| layout.dashboardPadding | `--dashboard-padding` | `--dashboard-padding` | 32 | 32 |
| layout.shadowBaseLight / shadowBaseDark | `--shadow-base` | `--shadow-base` | 0 4px 6px... | 0 10px 15px... |
| layout.shadowPremium | `--shadow-premium` | `--shadow-premium` | (동일) | — |
| layout.widgetBorderWidth | `--widget-border-width` | `--widget-border-width` | 1 | 1 |
| components.widget_card.border_color_* | `--widget-border-color` | `--widget-border-color` | #e2e8f0 | #1e293b |
| components.widget_card.header_color | `--widget-header-color` | `--widget-header-color` | transparent | transparent |

---

## 3. 타이포그래피 (tokens.typography / 앱 index.css·DesignSystem.tsx)

| design-tokens.json 경로 | CSS 변수 | Pencil 변수 | 값 |
|-------------------------|----------|-------------|-----|
| typography.titleSize | `--title-size` | `--title-size` | 18 |
| typography.titleWeight | `--title-weight` | `--title-weight` | 700 |
| typography.contentSize | `--content-size` | `--content-size` | 14 |
| typography.textTiny | `--text-tiny` | `--text-tiny` / `--font-size-tiny` | 12 |
| typography.textSmall | `--text-small` | `--text-small` / `--font-size-small` | 13 |
| typography.textBase | `--text-base` | `--text-base` / `--font-size-base` | 14 |
| typography.textMd | `--text-md` | `--text-md` / `--font-size-md` | 18 |
| typography.textLg | `--text-lg` | `--text-lg` / `--font-size-lg` | 30 |
| typography.textHero | `--text-hero` | `--text-hero` / `--font-size-hero` | 48 |
| (앱) | `--font-sans` | `--font-sans` | Inter, sans-serif |
| (앱) | `--font-weight-*` | `--font-weight-normal` 등 | 400, 500, 600, 700, 900 |

---

## 4. 기타 레이아웃 (앱 :root)

| CSS 변수 | Pencil 변수 | 값 |
|----------|-------------|-----|
| --border-radius | `--border-radius` | 16 |
| --transition-speed | `--transition-speed` | 0.2s |

---

## 5. 컴포넌트·아이콘

- **components.premium_mode_toggle**: width 64px, height 34px, thumb 26px (Pencil에서는 참고용).
- **components.widget_card**: action_hover_bg, edit_handle_color, border_width, border_color_light/dark, header_color (앱·Pencil 동기화).
- **icons.list**: design-tokens.json `tokens.icons.list`와 Design_System.md·DesignDocs 앱 목록 동일 (Layout, Edit3, Eye, Plus, Palette, Settings, FileSpreadsheet, X, Sun, Moon, GripVertical, CheckCircle2, AlertTriangle).

---

## 6. 컴포넌트별 변수 (앱 ↔ Pencil 동기화)

**개발(constants.tsx, App.tsx)과 Pencil이 같은 변수를 쓰도록 아래 규칙을 따르세요.**

| 영역 | 사용 변수 | 앱 (constants/App) | Pencil (fill 등) |
|------|-----------|---------------------|-------------------|
| **대시보드 헤더** | 배경 | `header.backgroundColor` = `var(--background)` | `$--background` |
| **탭 행** (페이지 탭 영역) | 배경 | `bg-[var(--surface-muted)]` | `$--surface-muted` |
| **카드/위젯** | 배경 | `--surface-elevated` 등 | `$--surface-elevated` |
| **본문 배경** | 배경 | `bg-[var(--background)]` | `$--background` |
| **헤더 하단 선** | 테두리 | `border-[var(--border-base)]` | `$--border-base` |

- **헤더는 반드시 `--background`** (surface 아님). constants `DEFAULT_HEADER.backgroundColor` = `'var(--background)'`, Pencil 헤더 frame fill = `$--background`.

---

## 7. 사용 규칙

- **프레임 이름**: `Dark Mode - ...` / `Light Mode - ...` 로 모드 구분.
- **Pencil 변수**: 색·간격·radius는 가능한 한 `$--변수명` 참조.
- **토큰 변경 시**: design-tokens.json 수정 후 이 매핑·Design_System.md·앱(index.css/DesignSystem/constants) 및 Pencil 변수 함께 갱신.
- **컴포넌트 색 변경 시**: 위 "6. 컴포넌트별 변수" 표와 constants.tsx·Pencil을 동시에 맞출 것.
