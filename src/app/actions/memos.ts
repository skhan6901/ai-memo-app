'use server'

import { v4 as uuidv4 } from 'uuid'

import { Memo, MemoFormData } from '@/types/memo'
import { GEMINI_SUMMARY_MODEL, generateMemoSummary } from '@/utils/geminiSummarize'
import { MemoRow, rowToMemo } from '@/utils/memoRow'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export type MemosActionResult =
  | { ok: true; memos: Memo[] }
  | { ok: false; error: string }

export type MemoActionResult =
  | { ok: true; memo: Memo }
  | { ok: false; error: string }

export type EmptyActionResult = { ok: true } | { ok: false; error: string }

function parseMemoRow(data: unknown): MemoRow | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const row = data as Record<string, unknown>
  if (
    typeof row.id !== 'string' ||
    typeof row.title !== 'string' ||
    typeof row.content !== 'string' ||
    typeof row.category !== 'string' ||
    !Array.isArray(row.tags) ||
    row.tags.some(t => typeof t !== 'string') ||
    typeof row.created_at !== 'string' ||
    typeof row.updated_at !== 'string'
  ) {
    return null
  }
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags as string[],
    created_at: row.created_at,
    updated_at: row.updated_at,
    summary: typeof row.summary === 'string' ? row.summary : null,
    summary_model:
      typeof row.summary_model === 'string' ? row.summary_model : null,
    summarized_at:
      typeof row.summarized_at === 'string' ? row.summarized_at : null,
  }
}

export async function listMemosAction(): Promise<MemosActionResult> {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return { ok: false, error: error.message }
    }

    const rows = (data ?? []) as unknown[]
    const memos: Memo[] = []
    for (const item of rows) {
      const parsed = parseMemoRow(item)
      if (parsed) memos.push(rowToMemo(parsed))
    }
    return { ok: true, memos }
  } catch (e) {
    const message = e instanceof Error ? e.message : '메모 목록을 불러오지 못했습니다.'
    return { ok: false, error: message }
  }
}

export async function createMemoAction(
  formData: MemoFormData
): Promise<MemoActionResult> {
  const title = formData.title.trim()
  const content = formData.content.trim()
  if (!title || !content) {
    return { ok: false, error: '제목과 내용을 모두 입력해주세요.' }
  }

  const now = new Date().toISOString()
  const id = uuidv4()

  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('memos')
      .insert({
        id,
        title,
        content,
        category: formData.category,
        tags: formData.tags,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }
    const parsed = parseMemoRow(data)
    if (!parsed) {
      return { ok: false, error: '저장된 메모 형식이 올바르지 않습니다.' }
    }
    return { ok: true, memo: rowToMemo(parsed) }
  } catch (e) {
    const message = e instanceof Error ? e.message : '메모를 저장하지 못했습니다.'
    return { ok: false, error: message }
  }
}

export async function updateMemoAction(
  id: string,
  formData: MemoFormData
): Promise<MemoActionResult> {
  const title = formData.title.trim()
  const content = formData.content.trim()
  if (!title || !content) {
    return { ok: false, error: '제목과 내용을 모두 입력해주세요.' }
  }

  const now = new Date().toISOString()

  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('memos')
      .update({
        title,
        content,
        category: formData.category,
        tags: formData.tags,
        updated_at: now,
        summary: null,
        summary_model: null,
        summarized_at: null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }
    const parsed = parseMemoRow(data)
    if (!parsed) {
      return { ok: false, error: '수정된 메모 형식이 올바르지 않습니다.' }
    }
    return { ok: true, memo: rowToMemo(parsed) }
  } catch (e) {
    const message = e instanceof Error ? e.message : '메모를 수정하지 못했습니다.'
    return { ok: false, error: message }
  }
}

export async function deleteMemoAction(id: string): Promise<EmptyActionResult> {
  try {
    const supabase = createSupabaseServerClient()
    const { error } = await supabase.from('memos').delete().eq('id', id)

    if (error) {
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : '메모를 삭제하지 못했습니다.'
    return { ok: false, error: message }
  }
}

export async function clearAllMemosAction(): Promise<EmptyActionResult> {
  try {
    const supabase = createSupabaseServerClient()
    const { error } = await supabase
      .from('memos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (e) {
    const message =
      e instanceof Error ? e.message : '메모를 모두 삭제하지 못했습니다.'
    return { ok: false, error: message }
  }
}

export async function summarizeMemoAction(id: string): Promise<MemoActionResult> {
  try {
    const supabase = createSupabaseServerClient()
    const { data: existing, error: fetchError } = await supabase
      .from('memos')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      return { ok: false, error: fetchError.message }
    }
    const row = parseMemoRow(existing)
    if (!row) {
      return { ok: false, error: '메모를 찾을 수 없습니다.' }
    }

    const summary = await generateMemoSummary(row.title, row.content)
    const now = new Date().toISOString()

    const { data: updated, error: updateError } = await supabase
      .from('memos')
      .update({
        summary,
        summary_model: GEMINI_SUMMARY_MODEL,
        summarized_at: now,
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return { ok: false, error: updateError.message }
    }
    const parsed = parseMemoRow(updated)
    if (!parsed) {
      return { ok: false, error: '요약 저장 후 데이터 형식이 올바르지 않습니다.' }
    }
    return { ok: true, memo: rowToMemo(parsed) }
  } catch (e) {
    const message =
      e instanceof Error ? e.message : '요약 생성 중 오류가 발생했습니다.'
    return { ok: false, error: message }
  }
}
