'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  clearAllMemosAction,
  createMemoAction,
  deleteMemoAction,
  listMemosAction,
  summarizeMemoAction,
  updateMemoAction,
} from '@/app/actions/memos'
import { Memo, MemoFormData } from '@/types/memo'

export type SummarizeMemoResult =
  | { ok: true; memo: Memo }
  | { ok: false; error: string }

export const useMemos = () => {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const result = await listMemosAction()
        if (cancelled) return
        if (result.ok) {
          setMemos(result.memos)
        } else {
          console.error('Failed to load memos:', result.error)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load memos:', error)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const createMemo = useCallback(async (formData: MemoFormData): Promise<Memo | null> => {
    const result = await createMemoAction(formData)
    if (result.ok) {
      setMemos(prev => [result.memo, ...prev])
      return result.memo
    }
    console.error('Failed to create memo:', result.error)
    return null
  }, [])

  const updateMemo = useCallback(
    async (id: string, formData: MemoFormData): Promise<boolean> => {
      const result = await updateMemoAction(id, formData)
      if (result.ok) {
        setMemos(prev => prev.map(memo => (memo.id === id ? result.memo : memo)))
        return true
      }
      console.error('Failed to update memo:', result.error)
      return false
    },
    []
  )

  const deleteMemo = useCallback(async (id: string): Promise<boolean> => {
    const result = await deleteMemoAction(id)
    if (result.ok) {
      setMemos(prev => prev.filter(memo => memo.id !== id))
      return true
    }
    console.error('Failed to delete memo:', result.error)
    return false
  }, [])

  const searchMemos = useCallback((query: string): void => {
    setSearchQuery(query)
  }, [])

  const filterByCategory = useCallback((category: string): void => {
    setSelectedCategory(category)
  }, [])

  const getMemoById = useCallback(
    (id: string): Memo | undefined => {
      return memos.find(memo => memo.id === id)
    },
    [memos]
  )

  const filteredMemos = useMemo(() => {
    let filtered = memos

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memo => memo.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        memo =>
          memo.title.toLowerCase().includes(query) ||
          memo.content.toLowerCase().includes(query) ||
          memo.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [memos, selectedCategory, searchQuery])

  const clearAllMemos = useCallback(async (): Promise<boolean> => {
    const result = await clearAllMemosAction()
    if (result.ok) {
      setMemos([])
      setSearchQuery('')
      setSelectedCategory('all')
      return true
    }
    console.error('Failed to clear memos:', result.error)
    return false
  }, [])

  const summarizeMemo = useCallback(async (id: string): Promise<SummarizeMemoResult> => {
    const result = await summarizeMemoAction(id)
    if (result.ok) {
      setMemos(prev => prev.map(memo => (memo.id === id ? result.memo : memo)))
      return { ok: true, memo: result.memo }
    }
    console.error('Failed to summarize memo:', result.error)
    return { ok: false, error: result.error }
  }, [])

  const stats = useMemo(() => {
    const totalMemos = memos.length
    const categoryCounts = memos.reduce(
      (acc, memo) => {
        acc[memo.category] = (acc[memo.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: totalMemos,
      byCategory: categoryCounts,
      filtered: filteredMemos.length,
    }
  }, [memos, filteredMemos])

  return {
    memos: filteredMemos,
    allMemos: memos,
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
  }
}
