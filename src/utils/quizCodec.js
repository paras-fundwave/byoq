import pako from 'pako'

/**
 * Encode quiz data to a shareable code
 */
export function encodeQuizCode(quizData) {
  const json = JSON.stringify(quizData)
  const compressed = pako.deflate(json)
  const base64 = btoa(String.fromCharCode(...compressed))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Decode quiz code back to quiz data
 */
export function decodeQuizCode(code) {
  try {
    const base64 = code.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const decompressed = pako.inflate(bytes, { to: 'string' })
    return JSON.parse(decompressed)
  } catch (e) {
    console.error('Failed to decode quiz code:', e)
    return null
  }
}

/**
 * Generate a short hash from quiz code for verification
 */
export async function generateHash(quizData) {
  const json = JSON.stringify(quizData)
  const encoder = new TextEncoder()
  const data = encoder.encode(json)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex.substring(0, 8).toUpperCase()
}

/**
 * Validate quiz JSON structure
 */
export function validateQuizJson(data) {
  const errors = []
  
  if (!data || typeof data !== 'object') {
    return ['Invalid JSON: must be an object']
  }
  
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Missing or invalid "title" field')
  }
  
  if (!data.quiz || !Array.isArray(data.quiz)) {
    errors.push('Missing or invalid "quiz" array')
    return errors
  }
  
  if (data.quiz.length === 0) {
    errors.push('Quiz must have at least one question')
  }
  
  data.quiz.forEach((q, i) => {
    if (!q.question) {
      errors.push(`Question ${i + 1}: missing "question" text`)
    }
    if (!q.answerOptions || !Array.isArray(q.answerOptions)) {
      errors.push(`Question ${i + 1}: missing or invalid "answerOptions"`)
    } else {
      const correctCount = q.answerOptions.filter(o => o.isCorrect).length
      if (correctCount === 0) {
        errors.push(`Question ${i + 1}: must have at least one correct answer`)
      }
      q.answerOptions.forEach((opt, j) => {
        if (!opt.text) {
          errors.push(`Question ${i + 1}, Option ${j + 1}: missing "text"`)
        }
      })
    }
  })
  
  return errors
}
