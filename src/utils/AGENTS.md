# Utils - AI Agent 지침서

## 모듈 역할

순수 유틸리티 함수 및 헬퍼 집합. 비즈니스 로직과 독립적인 재사용 가능한 기능을 제공한다.

## 의존성 관계

- `@/types/memo` — Memo 타입

## 유틸리티 목록

| 파일 | 역할 |
|------|------|
| `memoRow.ts` | Supabase `memos` 행 ↔ `Memo` 매핑 |
| `geminiSummarize.ts` | Gemini로 메모 요약 텍스트 생성 |
| `seedData.ts` | SQL 시드·문서용 샘플 메모 상수 |
| `supabase/server.ts` | 서버 전용 Supabase 클라이언트 생성 |

## Implementation Patterns

### SSR 안전한 브라우저 API 접근

클라이언트 전용 코드에서 브라우저 API를 쓸 때는 함수 최상단에서 `typeof window === 'undefined'` 체크 후 early return.

### 새 유틸리티 파일 작성 템플릿

```typescript
import { SomeType } from '@/types/someType'

export const utilName = {
  method1: (param: ParamType): ReturnType => {
    // 구현
  },
}
```

## Local Golden Rules

### Do's

- 모든 유틸리티는 순수 함수로 작성 (사이드 이펙트 최소화)
- JSON 파싱/직렬화 시 try-catch 필수

### Don'ts

- React 훅 사용 금지 (유틸리티는 훅이 아님)
- 직접 DOM 조작 금지 (React에 위임)

## 테스트 고려사항

유틸리티 함수는 단위 테스트하기 용이함: 순수 함수는 입력 -> 출력 테스트.
