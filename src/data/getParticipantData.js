import { mockParticipant, OBSERVATION_DOMAINS, getDomainMeta } from './mockParticipant'

const DATA_MODE = 'mock' // later: 'backend'

/**
 * Main data entry point for the dashboard.
 * In Phase 2 we still return mock data, but via an adapter layer
 * so that the UI no longer depends directly on the mock source.
 */
export async function getParticipantData() {
  if (DATA_MODE === 'mock') {
    return Promise.resolve(mockParticipant)
  }

  // Placeholder for future backend integration (Phase 3)
  throw new Error('Backend mode not yet implemented.')
}

/**
 * Return only completed sessions.
 */
export function getCompletedSessions(participant) {
  if (!participant?.sessions) return []
  return participant.sessions.filter((session) => session.status === 'completed')
}

/**
 * Return domain rows for a specific session:
 * [{ key, label, score, meta }]
 */
export function getSessionDomainBreakdown(session) {
  if (!session?.domainScores) return []

  return OBSERVATION_DOMAINS.map((domain) => ({
    key: domain.key,
    label: domain.label,
    score: session.domainScores[domain.key] ?? null,
    meta: domain,
  }))
}

/**
 * Compare two sessions side by side for Timeline comparison view.
 */
export function compareSessions(sessionA, sessionB) {
  if (!sessionA?.domainScores || !sessionB?.domainScores) return []

  return OBSERVATION_DOMAINS.map((domain) => {
    const scoreA = sessionA.domainScores[domain.key]
    const scoreB = sessionB.domainScores[domain.key]

    let trend = 'stable'
    if (scoreB > scoreA) trend = 'up'
    if (scoreB < scoreA) trend = 'down'

    return {
      key: domain.key,
      label: domain.label,
      scoreA,
      scoreB,
      delta: Number((scoreB - scoreA).toFixed(1)),
      trend,
      meta: domain,
    }
  })
}

/**
 * Return all domains sorted by score (ascending),
 * useful for explainability ranking.
 */
export function getSortedDomains(session) {
  return getSessionDomainBreakdown(session).sort((a, b) => {
    const aScore = a.score ?? -Infinity
    const bScore = b.score ?? -Infinity
    return aScore - bScore
  })
}

/**
 * Recommendations enriched with domain metadata.
 */
export function getRecommendationsWithMeta(participant) {
  if (!participant?.recommendations) return []

  return participant.recommendations.map((recommendation) => ({
    ...recommendation,
    domainMeta: recommendation.triggerDomain
      ? getDomainMeta(recommendation.triggerDomain)
      : null,
  }))
}

export { OBSERVATION_DOMAINS, getDomainMeta }