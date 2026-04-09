# STN Widget Dashboard (v1)

대시보드 위젯 편집·디자인·내보내기/불러오기가 가능한 프로젝트입니다.

## 실행

```bash
npm install
npm run dev
```

로컬 기본 주소: http://localhost:5173 (포트 지정 시 `npm run dev -- --port 3000`)

## 빌드 / 배포

```bash
npm run build
```

정적 파일은 `dist/`에 생성됩니다. Vercel 등 정적 호스팅에 배포 가능합니다.

## 주요 기능

- 프로젝트·페이지 단위 대시보드, 위젯 그리드 편집
- 디자인 패널(테마, 헤더, 배경, 글래스모피즘)
- 차트 엔진 선택(Recharts / ApexCharts / AMCharts)
- 프로젝트 내보내기/불러오기(ZIP: manifest + 이미지 + 미리보기)
- IndexedDB 기반 레이아웃·프로젝트 저장

## 디자인 토큰

`design-tokens.json` + `design-tokens/themeFromTokens.ts` → `DesignSystem.tsx` 로 연결됩니다. 자세한 매핑은 `design-tokens/README.md` 참고.
