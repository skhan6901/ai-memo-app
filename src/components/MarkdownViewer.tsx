'use client'

import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownViewerProps {
  content: string
  className?: string
}

const baseMarkdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1
      className="mt-6 mb-3 text-2xl font-bold text-gray-900 first:mt-0"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="mt-5 mb-2 text-xl font-semibold text-gray-900" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="mt-4 mb-2 text-lg font-semibold text-gray-900" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="mt-3 mb-1 text-base font-semibold text-gray-900" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-3 text-sm leading-relaxed text-gray-800 last:mb-0" {...props}>
      {children}
    </p>
  ),
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-800"
      {...props}
    >
      {children}
    </a>
  ),
  ul: ({ children, ...props }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-gray-800" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-gray-800" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="mb-3 border-l-4 border-gray-300 bg-gray-50 py-2 pl-4 pr-2 text-sm text-gray-700 italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: ({ ...props }) => <hr className="my-4 border-gray-200" {...props} />,
  table: ({ children, ...props }) => (
    <div className="my-3 overflow-x-auto">
      <table
        className="min-w-full border-collapse border border-gray-200 text-sm text-gray-800"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-gray-100" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-900"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-gray-200 px-3 py-2" {...props}>
      {children}
    </td>
  ),
  tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
  tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
  pre: ({ children, ...props }) => (
    <pre
      className="mb-3 overflow-x-auto rounded-lg bg-gray-900 p-3 text-sm text-gray-100"
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className?.startsWith('language-'))
    if (isBlock) {
      return (
        <code className={`${className ?? ''} font-mono text-[0.9em]`} {...props}>
          {children}
        </code>
      )
    }
    return (
      <code
        className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.9em] text-gray-800"
        {...props}
      >
        {children}
      </code>
    )
  },
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-gray-900" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-gray-800" {...props}>
      {children}
    </em>
  ),
  del: ({ children, ...props }) => (
    <del className="text-gray-500 line-through" {...props}>
      {children}
    </del>
  ),
  input: ({ type, ...props }) => {
    if (type === 'checkbox') {
      return <input type="checkbox" className="mr-2 align-middle" {...props} />
    }
    return <input type={type} {...props} />
  },
}

export default function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  const components = useMemo(() => baseMarkdownComponents, [])

  return (
    <div className={className ?? 'markdown-viewer text-gray-800'}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
