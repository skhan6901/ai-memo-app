# Hooks - AI Agent 지침서

## 모듈 역할

클라이언트 상태 관리를 위한 커스텀 React 훅 집합. 메모 CRUD, 검색, 필터링 로직을 캡슐화한다.

## 의존성 관계

- `@/types/memo` — Memo, MemoFormData 타입
- `@/app/actions/memos` — 서버 액션 (목록·CRUD·요약)

## 훅 목록

| 파일 | 역할 | 반환값 |
|------|------|--------|
| `useMemos.ts` | 메모 상태 전체 관리 | memos, CRUD 함수, 필터 함수, stats, summarizeMemo |

## useMemos 구조

```tsx
const {
  memos,
  allMemos,
  loading,
  searchQuery,
  selectedCategory,
  stats,
  createMemo,
  updateMemo,
  deleteMemo,
  getMemoById,
  searchMemos,
  filterByCategory,
  clearAllMemos,
  summarizeMemo,
} = useMemos()
```

- `createMemo` / `updateMemo` / `deleteMemo` / `clearAllMemos` / `summarizeMemo`는 서버 액션을 호출하는 비동기 함수입니다.

## Local Golden Rules

### Do's

- 훅 이름은 `use` 접두사 필수
- 에러 처리: try-catch 또는 액션 결과 분기 후 `console.error` 로깅
- 로딩 상태 항상 제공

### Don'ts

- 훅 내부에서 직접 UI 렌더링 금지
- 조건부 훅 호출 금지 (React 규칙)
