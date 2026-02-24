# Figma 메인 화면 추가 요소

**대상 프레임:** `main` (2237:11531)  
**헤더:** 2237:11532 | **header-left:** 2237:11534 | **header-right:** 2237:11535

아래 요소들을 Figma에서 추가하면 앱 메인 화면과 동일한 구성을 만들 수 있습니다.

---

## 1. 로고 아이콘 (header-left 안에, 맨 앞)

- **이름:** logo-icon
- **parentId:** 2237:11534 (header-left)
- **크기:** 40 × 40
- **배경:** #6366f1 (primary) 또는 r:0.39, g:0.42, b:0.96
- **위치:** header-left의 첫 번째 자식 (로고 → STN infotech PRO → Project 1 순서)

---

## 2. 차트 라이브러리 드롭다운 (header-right 안에, 맨 앞)

- **이름:** library-dropdown
- **parentId:** 2237:11535 (header-right)
- **크기:** 약 120 × 36
- **배경:** #1e2230 (r:0.12, g:0.13, b:0.18)
- **모서리:** 8px
- **내부 구성 (가로 auto-layout):**
  - 아이콘 영역 (작은 사각형, 차트 아이콘 대체)
  - 텍스트: **"Recharts"** (14px, Bold, 흰색 계열)
  - 텍스트: **"▼"** 또는 ChevronDown (10px, muted)

---

## 3. 구분선 (header-right, 라이브러리 오른쪽)

- **이름:** divider
- **parentId:** 2237:11535
- **크기:** 1 × 24
- **배경:** #3f4556 (r:0.25, g:0.28, b:0.36)

---

## 4. 모드 토글 (header-right, 구분선 오른쪽)

- **이름:** mode-toggle
- **parentId:** 2237:11535
- **크기:** 약 80 × 32
- **구성 (가로 auto-layout, 4px 간격):**
  - **Sun** 아이콘 또는 텍스트 "☀" (Light)
  - **Moon** 아이콘 또는 텍스트 "🌙" (Dark)
  - 선택된 모드만 살짝 강조 (배경/테두리)

---

## 5. 헤더 오른쪽 순서 (왼쪽 → 오른쪽)

1. **library-dropdown** (Recharts ▼)
2. **divider** (세로선)
3. **mode-toggle** (☀ 🌙)
4. **Design** (기존 텍스트)
5. **Edit Project** (기존 텍스트)
6. **Preview** (기존 텍스트)

---

## 6. header-left 순서 (로고 추가 후)

1. **logo-icon** (40×40 보라색 사각형)
2. **logo-title** ("STN infotech PRO")
3. **project-name** ("Project 1")

---

## TalkToFigma MCP로 추가할 때 예시 (연결 성공 시)

```json
// 1) 로고
create_frame: { "parentId": "2237:11534", "x": 0, "y": 0, "width": 40, "height": 40, "name": "logo-icon", "fillColor": { "r": 0.39, "g": 0.42, "b": 0.96, "a": 1 } }

// 2) 라이브러리 드롭다운
create_frame: { "parentId": "2237:11535", "x": 0, "y": 0, "width": 120, "height": 36, "name": "library-dropdown", "fillColor": { "r": 0.12, "g": 0.13, "b": 0.18, "a": 1 }, "layoutMode": "HORIZONTAL", "counterAxisAlignItems": "CENTER", "primaryAxisAlignItems": "SPACE_BETWEEN", "paddingLeft": 12, "paddingRight": 12, "paddingTop": 8, "paddingBottom": 8 }

// 3) 라이브러리 안 텍스트
create_text: { "parentId": "<library-dropdown의 ID>", "x": 0, "y": 0, "text": "Recharts", "fontSize": 14, "fontWeight": 600, "fontColor": { "r": 0.9, "g": 0.91, "b": 0.94, "a": 1 } }
create_text: { "parentId": "<library-dropdown의 ID>", "x": 0, "y": 0, "text": "▼", "fontSize": 10, "fontColor": { "r": 0.6, "g": 0.65, "b": 0.75, "a": 1 } }

// 4) 구분선
create_frame: { "parentId": "2237:11535", "width": 1, "height": 24, "name": "divider", "fillColor": { "r": 0.25, "g": 0.28, "b": 0.36, "a": 1 } }

// 5) 모드 토글 (Sun / Moon)
create_frame: { "parentId": "2237:11535", "width": 80, "height": 32, "name": "mode-toggle", "layoutMode": "HORIZONTAL", "itemSpacing": 4 }
create_text: { "parentId": "<mode-toggle의 ID>", "text": "☀", "fontSize": 16 }
create_text: { "parentId": "<mode-toggle의 ID>", "text": "🌙", "fontSize": 16 }
```

Figma 플러그인(Talk to Figma)이 켜져 있고 채널 `p4wuwjch`에 연결된 상태에서, Cursor에서 다시 "다 추가해줘"라고 요청하면 위 항목들을 자동으로 추가 시도합니다.
