# SIOT Widget Dashboard Design System Governance

이 문서는 디자인 시스템의 일관성과 코드 품질을 유지하기 위한 거버넌스 규칙을 정의합니다.

## 1. 토큰 관리 (Token Management)
- 모든 디자인 값(색상, 간격, 그림자 등)은 `design-tokens.json`을 단일 소스(SSoT)로 삼아야 합니다.
- 하드코딩된 값(Hex, Px)은 절대 사용하지 않으며, 필요 시 새로운 토큰 생성을 제안해야 합니다.

## 2. 컴포넌트 리뷰 (Component Review)
- 새로운 UI 컴포넌트나 입력 타입을 추가할 때는 구현 전 토큰 맵핑과 스타일을 먼저 제안하고 리뷰를 받습니다.

## 3. Git 협업 규칙 (Git Governance) - 중요
- **무단 Push 금지**: AI 어시스턴트는 로컬 커밋까지는 진행할 수 있으나, 원격 저장소(`origin main`)로의 **Push는 반드시 사용자의 명시적인 허락**을 득한 후 실행합니다.
- 사용자가 직접 "Push 해주세요"라고 요청하기 전까지는 절대로 임의로 Push 명령을 실행하지 않습니다.
- 작업 완료 후 항상 "수정 사항을 Git에 반영할까요?"라고 승인을 요청합니다.

## 4. 변경 프로세스
- 제안(Propose) -> 승인(Approve) -> 문서화(Document) -> 구현(Implement) -> 승인 후 Push(Push after Approval)의 순서를 엄격히 준수합니다.
