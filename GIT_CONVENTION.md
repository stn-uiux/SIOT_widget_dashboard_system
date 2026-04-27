# 🗂️ Git 커밋 컨벤션 (STN Widget Dashboard Pro)

> **AI 어시스턴트 필독**: 이 프로젝트의 모든 git 커밋 메시지는 **반드시 한국어**로 작성합니다.  
> 영어 커밋 메시지는 사용하지 않습니다. 예외 없음.

---

## ✅ 커밋 메시지 형식

```
<타입>: <한국어로 변경 내용 설명>
```

### 타입 목록

| 타입 | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `style` | UI/CSS 스타일 변경 |
| `refactor` | 코드 구조 개선 (기능 변경 없음) |
| `docs` | 문서 추가 또는 수정 |
| `chore` | 설정, 패키지, 환경 변경 |
| `checkpoint` | 작업 분기점 백업 |

---

## ✅ 커밋 메시지 예시

```bash
# ✅ 올바른 예시 (한국어)
git commit -m "feat: 위젯 피커 모달 너비 810px로 조정"
git commit -m "fix: 파일 다운로드 후 메모리 해제 타이밍 오류 수정"
git commit -m "style: 사이드바 버튼 레이아웃 디자인 시스템에 맞게 정렬"
git commit -m "checkpoint: v1 안정화 백업 - 로그인 기능 추가 전"

# ❌ 잘못된 예시 (영어 사용 금지)
git commit -m "feat: dashboard ui improvements"
git commit -m "fix: export logic update"
```

---

## ✅ 체크포인트(태그) 형식

주요 작업 시작 전 반드시 태그를 생성합니다.

```bash
git tag checkpoint-YYYY-MM-DD-v<번호>
git push origin --tags
```

**예시:**
```bash
git tag checkpoint-2026-04-27-v1   # 로그인 기능 추가 전 백업
git tag checkpoint-2026-05-01-v2   # DB 연동 완료 후 백업
```

---

## ✅ 기본 Push 순서

```bash
git add .
git commit -m "feat: (한국어로 설명)"
git push origin main
git push origin --tags   # 태그 있을 경우
```
