'use client'

import { useCallback, useEffect, useState } from 'react'
import type { SummarizeMemoResult } from '@/hooks/useMemos'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'
import MarkdownViewer from '@/components/MarkdownViewer'

interface MemoDetailModalProps {
  memo: Memo | null
  isOpen: boolean
  onClose: () => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
  onSummarize: (id: string) => Promise<SummarizeMemoResult>
}

export default function MemoDetailModal({
  memo,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onSummarize,
}: MemoDetailModalProps) {
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen || !memo) return
    setSummary(memo.summary ?? '')
    setSummaryError(null)
    setSummaryLoading(false)
  }, [isOpen, memo])

  const handleSummarize = useCallback(async () => {
    if (!memo) return
    setSummaryLoading(true)
    setSummaryError(null)

    try {
      const outcome = await onSummarize(memo.id)
      if (outcome.ok) {
        if (outcome.memo.summary) {
          setSummary(outcome.memo.summary)
        } else {
          setSummaryError('요약 결과 형식이 올바르지 않습니다.')
        }
      } else {
        setSummaryError(outcome.error)
      }
    } catch {
      setSummaryError('요약 처리 중 오류가 발생했습니다.')
    } finally {
      setSummaryLoading(false)
    }
  }, [memo, onSummarize])

  if (!isOpen || !memo) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const handleDelete = () => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="memo-detail-title"
      >
        <div className="p-6">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h2
                id="memo-detail-title"
                className="text-xl font-semibold text-gray-900 break-words"
              >
                {memo.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(memo.category)}`}
                >
                  {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
                    memo.category}
                </span>
                <span className="text-xs text-gray-500">
                  수정 {formatDate(memo.updatedAt)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <p className="text-xs text-gray-500 mb-4">
            작성 {formatDate(memo.createdAt)}
          </p>

          <div className="mb-6 break-words">
            <MarkdownViewer content={memo.content} />
          </div>

          <section
            className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
            aria-labelledby="memo-ai-summary-heading"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3
                id="memo-ai-summary-heading"
                className="text-sm font-semibold text-gray-900"
              >
                AI 요약 (Gemini)
              </h3>
              <button
                type="button"
                onClick={handleSummarize}
                disabled={summaryLoading}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {summaryLoading ? '요약 중...' : '요약하기'}
              </button>
            </div>
            {summaryError && (
              <p className="mb-2 text-sm text-red-600" role="alert">
                {summaryError}
              </p>
            )}
            {summary ? (
              <div className="rounded-md border border-gray-100 bg-white p-3">
                <MarkdownViewer content={summary} />
              </div>
            ) : summaryLoading ? (
              <p className="text-sm text-gray-600" aria-live="polite">
                요약 중...
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                요약하기를 누르면 현재 메모를 Gemini로 요약합니다.
              </p>
            )}
          </section>

          {memo.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-6">
              {memo.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              삭제
            </button>
            <button
              type="button"
              onClick={() => onEdit(memo)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              편집
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
