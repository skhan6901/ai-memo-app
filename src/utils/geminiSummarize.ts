export const GEMINI_SUMMARY_MODEL = 'gemini-2.5-flash-lite'

function buildUserPrompt(title: string, content: string): string {
  return `다음은 사용자 메모입니다. 핵심만 한국어로 요약하세요.

규칙:
- 추측하지 말고 메모에 있는 내용만 반영합니다.
- 핵심 내용을 최대 3개의 불릿(- 로 시작)으로 작성합니다. 내용이 매우 짧으면 1문장으로만 요약해도 됩니다.
- 코드 블록이나 표는 필요한 경우 간단히 한 줄로 설명합니다.
- 제목은 다시 출력하지 않습니다.

제목: ${title}

본문:
${content}`
}

export async function generateMemoSummary(
  title: string,
  content: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey?.trim()) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.')
  }

  const userPrompt = buildUserPrompt(title, content)
  const { GoogleGenAI } = await import('@google/genai')
  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: GEMINI_SUMMARY_MODEL,
    contents: userPrompt,
    config: {
      temperature: 0.3,
      maxOutputTokens: 512,
    },
  })

  const summary = response.text?.trim()
  if (!summary) {
    throw new Error('요약 결과를 가져오지 못했습니다.')
  }

  return summary
}
