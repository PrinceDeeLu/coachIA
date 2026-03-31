import { API_URL } from '../constants'
import { getAuthToken } from './supabase'

async function authFetch(path: string, options: RequestInit = {}) {
  const token = await getAuthToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erreur ${res.status}`)
  }
  return res.json()
}

// ─── Coach IA ───────────────────────────────────────────────────────────────

export async function generatePlan(recoveryScore: number, notes?: string) {
  return authFetch('/api/coach/plan', {
    method: 'POST',
    body: JSON.stringify({
      recovery_score: recoveryScore,
      notes,
      date: new Date().toISOString().split('T')[0],
    }),
  })
}

export async function sendChatMessage(messages: { role: string; content: string }[]) {
  return authFetch('/api/coach/chat', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  })
}

// ─── Séances ────────────────────────────────────────────────────────────────

export async function getSessions() {
  return authFetch('/api/sessions')
}

export async function createSession(data: {
  session_date: string
  recovery_score?: number
  notes?: string
}) {
  return authFetch('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function addExercise(sessionId: string, exercise: {
  exercise_name: string
  sets: number
  reps: number
  weight_kg: number
  perceived_effort?: string
}) {
  return authFetch(`/api/sessions/${sessionId}/exercises`, {
    method: 'POST',
    body: JSON.stringify(exercise),
  })
}
