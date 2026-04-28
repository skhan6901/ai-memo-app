# Server Actions - AI Agent 지침서

## 모듈 역할

Next.js 서버 액션(`'use server'`)으로 Supabase CRUD 및 AI 요약 저장을 수행합니다.

## 파일

| 파일 | 역할 |
|------|------|
| `memos.ts` | 메모 목록/생성/수정/삭제/전체 삭제, Gemini 요약 후 DB 반영 |

## 의존성

- `@/utils/supabase/server` — `createClient` 래퍼
- `@/utils/memoRow` — DB 행 ↔ `Memo` 매핑
- `@/utils/geminiSummarize` — Gemini 요약 생성

## Golden Rules

- 서버 액션 파일 상단에 `'use server'` 유지
- 클라이언트 전용 API(`window`, `localStorage`) 사용 금지
- `insert`/`update` 후 `.select().single()`로 갱신된 행 반환
