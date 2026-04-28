import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

/** App Router 메타데이터 아이콘 (favicon 대체) */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#2563eb',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        M
      </div>
    ),
    { ...size }
  )
}
