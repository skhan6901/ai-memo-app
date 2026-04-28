import { Memo } from '@/types/memo'

/** Supabase `memos` 테이블 행 (스네이크 케이스) */
export interface MemoRow {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  created_at: string
  updated_at: string
  summary: string | null
  summary_model: string | null
  summarized_at: string | null
}

export function rowToMemo(row: MemoRow): Memo {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    summary: row.summary,
    summaryModel: row.summary_model,
    summarizedAt: row.summarized_at,
  }
}
