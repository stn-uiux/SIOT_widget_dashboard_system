# Design System Documentation

**UNIFIED DESIGN LANGUAGE & TOKEN SYSTEM**  
Version: **v1.2.0**  
Source: `design-tokens.json` · 앱: Design Sidebar → Design → Design System Documentation

> 이 문서는 앱 내 **Design System Documentation** (DesignDocs.tsx)과 동일한 구조·변수명·설명을 사용합니다.

---

## 1. Design Tokens

### 1.1 Color Palette

앱에서는 각 토큰을 **스와치 카드**로 표시합니다 (상단 컬러 블록 + 이름 대문자 + CSS 변수명 + 설명).

#### Brand Colors
| Name (앱 표기) | CSS Variable | Description (앱과 동일) |
|----------------|--------------|------------------------|
| Primary | `--primary-color` | Main brand color for actions |
| Secondary | `--secondary-color` | Alternative brand color |
| Primary Gradient | `--primary-gradient` | Dynamic gradient for primary actions |
| Primary Subtle | `--primary-subtle` | Transparent primary background |

추가 브랜드 토큰 (design-tokens.json): Premium Start `#7c3aed`, Premium End `#db2777`, Neon Cyan (Cyber).

---

#### Semantic (Auto-Themed)
| Name | CSS Variable | Light | Dark |
|------|--------------|-------|------|
| Background | `--background` | `#f8fafc` | `#020617` |
| Surface | `--surface` | `#ffffff` | `#0f172a` |
| Text Main | `--text-main` | `#0f172a` | `#f8fafc` |
| Text Secondary | `--text-secondary` | `#334155` | `#cbd5e1` |
| Text Muted | `--text-muted` | `#64748b` | `#94a3b8` |
| Border Base | `--border-base` | `#e2e8f0` | `#1e293b` |
| Surface Elevated | `--surface-elevated` | `#f1f5f9` | `#1e293b` |

Token path: `colors.semantic.light` / `colors.semantic.dark` (design-tokens.json 기준)

---

#### Status Colors
| Name | CSS Variable | Value | Token Path |
|------|--------------|-------|------------|
| Success | `--success` | `#10b981` | `colors.status.success` |
| Error | `--error` | `#ef4444` | `colors.status.error` |
| Warning | `--warning` | `#f59e0b` | `colors.status.warning` |
| Info | `--info` | `#3b82f6` | `colors.status.info` |

---

#### High-Tech (Cyber) Tokens
| Name | CSS Variable | Description |
|------|--------------|-------------|
| Neon Cyan | `--primary-color` (Cyber) | Active in Cyber mode |
| Deep Background | `--background` | `#02040a` in Cyber |
| Cyber Surface | `--surface` | Glassmorphism surface |
| Accent Border | `--border-strong` | Neon accent |

Token path: `colors.semantic.cyber`

---

#### Borders
| Name | CSS Variable | Token Path | Usage |
|------|--------------|------------|--------|
| Border Base | `--border-base` | `colors.semantic.light/dark.border_base` | Default borders, dividers |
| Border Muted | `--border-muted` | `colors.semantic.light/dark.border_muted` | Subtle dividers |
| Border Strong | `--border-strong` | `colors.semantic.light/dark.border_strong` | Emphasis, focus rings |

---

### 1.2 Typography

#### Font Scale
| Label | CSS Variable | Typical Use |
|-------|--------------|-------------|
| Hero Title | `--text-hero` | 48px · Main hero header |
| Page Title | `--text-lg` | 30px · Page-level heading |
| Section Title | `--title-size` | 18px · Section heading |
| Body Normal | `--text-base` | 14px · Standard body text |
| Body Small | `--text-small` | 13px · Secondary, metadata |
| Caption (Tiny) | `--text-tiny` | 12px · Legal, caption |

Token reference: App uses `titleSize`, `contentSize`, `textTiny`, `textSmall`, `textMd`, `textLg`, `textHero` from theme.

#### Font Weights
| Name | Value | CSS |
|------|--------|-----|
| Normal | 400 | `font-normal` |
| Medium | 500 | `font-medium` |
| Semibold | 600 | `font-semibold` |
| Bold | 700 | `font-bold` |
| Black | 900 | `font-black` |

#### Font Families
| Name | CSS Variable | Usage |
|------|--------------|--------|
| Sans (Default) | `--font-sans` | Inter · UI, body |
| Monospace | `font-mono` | JetBrains Mono · Code, values |

---

### 1.3 Spacing & Shapes

#### Spacing Scale
| Token | CSS Variable | Value | Usage |
|-------|--------------|-------|--------|
| xs | `--spacing-xs` | 4px | Tight gaps, padding |
| sm | `--spacing-sm` | 8px | Inline spacing |
| md | `--spacing-md` | 16px | Default gap/padding |
| lg | `--spacing-lg` | 24px | Section spacing |
| xl | `--spacing-xl` | 32px | Large sections |

Token path: `layout.spacing`

#### Border Radius
| Token | CSS Variable | Value | Usage |
|-------|--------------|-------|--------|
| xs | `--radius-xs` | 4px | Pills, tags |
| sm | `--radius-sm` | 8px | Buttons, inputs |
| md | `--radius-md` | 12px | Cards, panels |
| lg | `--radius-lg` | 16px | Containers |
| xl | `--radius-xl` | 24px | Modals, hero |

Token path: `layout.borderRadius`

---

## 2. UI Components

### 2.0 Dashboard Layout (앱·Pencil 동일)

| 영역 | CSS 변수 | 용도 |
|------|----------|------|
| **대시보드 헤더** | `--background` | 헤더 배경 (constants `DEFAULT_HEADER.backgroundColor`, Pencil header fill) |
| **탭 행** (페이지 탭) | `--surface-muted` | 탭 영역 배경 |
| **본문** | `--background` | 메인 영역 배경 |
| **카드/위젯** | `--surface-elevated` | 카드 배경 |
| **헤더 하단 선** | `--border-base` | 구분선 |

앱과 Pencil이 위 변수를 동일하게 사용하도록 유지할 것.

---

### 2.1 Buttons

#### Main Buttons
- **Action Primary** · `btn-base bg-primary text-white` · Primary CTA
- **Solid Primary** · Same, no hover brightness
- **Surface Button** · `btn-base btn-surface` · Secondary actions
- **Ghost Button** · `btn-base btn-ghost` · Tertiary, low emphasis
- **Active Ghost** · `btn-base btn-ghost active` · Selected state

Use: `rounded-xl`, `py-2.5`, `px-6`, `font-bold`. Shadow: `shadow-lg shadow-blue-500/20` for primary.

#### Premium Controls
- **Mode Toggle (Light/Dark)** · `ModeToggle` component · 64×34px, thumb 26px, glow in Cyber.  
  Token: `components.premium_mode_toggle`

#### Status Buttons
- Success · `bg-[var(--success)]` · Confirm, done
- Error · `bg-[var(--error)]` · Destructive
- Warning · `bg-[var(--warning)]` · Caution
- Info · `bg-[var(--info)]` · Neutral action

Use: `rounded-xl`, `px-5 py-2.5`, `text-white font-bold text-sm`, status-specific shadow.

#### Navigation Tabs
- Active · `nav-tab-clean active`
- Inactive · `nav-tab-clean`  
  In Cyber: container `backgroundColor: var(--background)`.

#### Iconic & Small
- Icon button · `p-2.5 bg-[var(--border-muted)] border border-[var(--border-base)] rounded-xl text-primary`
- Text button · `text-[10px] font-black uppercase text-primary border-b-2 border-primary`

---

### 2.2 Forms & Inputs

#### Text Inputs
- **Standard Input** · `p-md pl-10 bg-surface border-main rounded-xl`, focus ring `focus:ring-2 focus:ring-primary/20`
- **Value Field (Mono)** · `font-mono font-bold text-primary`, `rounded-xl`

#### Selects & Dropdowns
- Custom select · `p-2.5 bg-[var(--surface)] border border-[var(--border-base)] rounded-xl`, chevron icon

#### Toggles & Switches
- `Switch` component · Primary when ON, muted when OFF. Use for boolean settings.

---

### 2.3 Layout & Cards

#### Content Container
- **Standard Card** · `p-design bg-surface border-main rounded-design shadow-base` · Widgets, default content
- **Premium Card** · `shadow-premium` · Modals, elevated widgets

Use design tokens: `--spacing` (padding), `var(--border-base)` (border), `var(--radius-md)` or `var(--border-radius)` (radius).

#### Widget Card
- Action hover: `components.widget_card.action_hover_bg` · `rgba(0, 0, 0, 0.05)`
- Edit handle: `components.widget_card.edit_handle_color` · `#64748b`

---

## 3. Project Icons

**Provider:** Lucide React  
Icons use consistent stroke weight (1.5–2px). Size via CSS variables or fixed (e.g. `w-4 h-4`, `w-5 h-5`).

| Icon | Name | Use |
|------|------|-----|
| Layout | Layout | Overall dashboard layout |
| Edit3 | Edit3 | Enter/Exit Edit mode |
| Eye | Eye | Preview Mode |
| Plus | Plus | Add Widget/Page |
| Palette | Palette | Design Sidebar |
| Settings | Settings | Widget settings |
| FileSpreadsheet | FileSpreadsheet | Excel data management |
| X | X | Delete widget, Close modals |
| Sun | Sun | Light Mode toggle |
| Moon | Moon | Dark Mode toggle |
| GripVertical | GripVertical | Widget drag handle |
| CheckCircle2 | CheckCircle2 | Success feedback |
| AlertTriangle | AlertTriangle | Warning/System alert |

Token path: `icons.list` in `design-tokens.json`.

---

## 4. Usage Notes

- **앱** · Design Sidebar → “Design” 열기 → “Design System Documentation”으로 이 문서와 동일 구조 확인.
- **단일 소스**: `design-tokens.json` → 앱(index.css, DesignSystem.tsx, constants.tsx), Pencil(`docs/PENCIL_TOKENS_MAPPING.md`), 이 문서와 동기화. 토큰 변경 시 위 파일들 함께 갱신.
- **Pencil** · 디자인 시 가능한 한 `$--변수명` 사용. 프레임 이름에 `Dark Mode` / `Light Mode` 접두사 사용.
