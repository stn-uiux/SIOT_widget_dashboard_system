# Figma 레이어 이름 정리 (앱 구조 기준)

선택한 **main** 프레임의 레이어를 앱(App.tsx, WidgetCard) 구조에 맞게 정리할 때 참고용입니다.  
**TalkToFigma MCP에는 레이어 이름 변경 API가 없어**, 아래 표를 보고 Figma에서 **수동으로 이름을 변경**해 주세요.

---

## 1. 최상위 · 레이아웃

| 현재 이름 (예시) | 권장 이름 | 비고 |
|------------------|-----------|------|
| main | **main** | 유지 (페이지/화면 루트) |
| mL | **layout** | 앱 전체 레이아웃 래퍼 |

---

## 2. 헤더 (header)

| 현재 이름 (예시) | 권장 이름 | 비고 |
|------------------|-----------|------|
| Header | **header** | 앱의 `<header>` |
| Container (헤더 왼쪽 묶음) | **header-left** | 로고 + 타이틀 + 프로젝트 드롭다운 |
| Container (header-left 1단계 자식) | **header-left-inner** | 필요 시만 사용, 없으면 header-left만 있어도 됨 |
| Container (로고 영역) | **logo-icon** | 40×40 로고/아이콘 |
| Container (STN infotech + MY WORKSPACE 묶음) | **title-block** | 브랜드명 + 프로젝트명 영역 |
| Container (title-block 안, 상단 줄) | **title-row** | "STN infotech" 텍스트 줄 |
| Container (title-block 안, 하단 줄) | **project-name** | "MY WORKSPACE" 등 프로젝트 드롭다운 라벨 |
| STN | **logo-text** | 로고 안 텍스트(있는 경우) |
| STN infotech | (텍스트 내용 유지) | 레이어명은 **logo-title** 또는 그대로 |
| MY WORKSPACE | (텍스트 내용 유지) | 레이어명은 **project-label** |

---

## 3. 헤더 오른쪽 (header-right)

| 현재 이름 (예시) | 권장 이름 | 비고 |
|------------------|-----------|------|
| Container (헤더 오른쪽 묶음) | **header-right** | 라이브러리 + 구분선 + 버튼들 |
| Recharts Dropdown | **library-dropdown** | 차트 라이브러리 선택 버튼 (Recharts ▼) |
| icon-box | **library-icon** | 드롭다운 안 아이콘 영역 |
| label | **library-label** | "Recharts" 텍스트 |
| chevron | **library-chevron** | ▼ |
| baseline / bar1, bar2, bar3 | **chart-icon-baseline**, **chart-icon-bar-1** 등 | 아이콘 내부 요소 (선택) |
| Button (Examples 등) | **btn-examples** 또는 **header-cta** | 헤더 액션 버튼 |

---

## 4. 본문 (main-content)

| 현재 이름 (예시) | 권장 이름 | 비고 |
|------------------|-----------|------|
| Main Content | **main-content** | 앱의 메인 콘텐츠 영역 |
| Heading 1 | **page-title** 또는 **dashboard-title** | "MY CUSTOM DASHBOARD" |
| Container (위젯들이 들어 있는 그리드) | **widget-grid** | 위젯 카드들이 들어 있는 컨테이너 |

---

## 5. 위젯 카드 (각 차트/위젯)

| 현재 이름 (예시) | 권장 이름 | 비고 |
|------------------|-----------|------|
| Container (카드 전체) | **widget-card** 또는 **widget-CHART_BAR** 등 | 타입이 있으면 widget-{WidgetType} |
| Heading 3 | **widget-title** | 카드 제목 ("세로 막대", "가로 막대" 등) |
| BarChart / LineChart / AreaChart / PieChart / RadarChart | **chart** 또는 **chart-area** | 차트 영역 |
| Vl | **chart-inner** | 차트 내부 래퍼 (필요 시) |
| Container (범례 묶음) | **legend** | 범례(수치, 차원 01 등) |
| Container (범례 항목 하나) | **legend-item** | 도트 + 텍스트 한 줄 |
| Text (범례 텍스트 감싼 프레임) | **legend-label** | "수치", "차원 01" 등 |

---

## 6. 기타

| 현재 이름 (예시) | 권장 이름 | 비고 |
|------------------|-----------|------|
| Group | **그룹 역할에 맞게** (예: x-axis-labels, chart-bars) | 가능하면 의미 있는 이름으로 |
| Text | **내용 또는 역할** (예: axis-label, legend-label) | 텍스트 내용으로 구분 가능 |

---

## 적용 순서 제안

1. **main** → **layout** (mL 등) 한 번에 정리  
2. **header** 아래 **header-left** / **header-right**  
3. **header-left** 안 **logo-icon**, **title-block**, **project-name** 등  
4. **header-right** 안 **library-dropdown**, **btn-examples** 등  
5. **main-content** → **page-title**, **widget-grid**  
6. 각 위젯 카드 → **widget-card** 또는 **widget-{타입}**, **widget-title**, **chart**, **legend**

이렇게 맞춰 두면 앱 컴포넌트와 1:1로 대응하기 쉽고, 나중에 Code Connect나 디자인–코드 매핑할 때도 유리합니다.
