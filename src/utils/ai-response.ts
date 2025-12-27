type AiResponseLike = {
  thought?: string | null
  answer?: string | null
}

type ParsedAiResponse = {
  thought: string
  answer: string
}

function parseJsonBlock(text: string): ParsedAiResponse | null {
  const fencedMatch = text.match(/```json\s*([\s\S]+?)\s*```/i)
  const candidate = fencedMatch?.[1]?.trim() ?? text.trim()

  if (!candidate.startsWith('{') || !candidate.endsWith('}')) {
    return null
  }

  try {
    const parsed = JSON.parse(candidate) as AiResponseLike
    const thought = typeof parsed.thought === 'string' ? parsed.thought : ''
    const answer = typeof parsed.answer === 'string' ? parsed.answer : ''
    if (!thought && !answer) return null
    return { thought, answer }
  } catch {
    return null
  }
}

export function parseAiResponse(
  input: AiResponseLike | string
): ParsedAiResponse {
  let thought = ''
  let answer = ''

  if (typeof input === 'string') {
    answer = input
  } else {
    thought = input.thought ?? ''
    answer = input.answer ?? ''
  }

  const parsed = parseJsonBlock(answer)
  if (parsed) {
    thought = parsed.thought || thought
    answer = parsed.answer || answer
  }

  return {
    thought: thought.trim(),
    answer: answer.trim(),
  }
}
