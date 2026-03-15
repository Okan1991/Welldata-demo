import {
  mockParticipantA,
  mockParticipantB,
  OBSERVATION_DOMAINS,
  getDomainMeta,
} from './mockParticipant'

export async function getParticipantData(userId = 'A') {
  if (userId === 'B') {
    return mockParticipantB
  }

  const response = await fetch('http://localhost:3000/api/participant')
  const result = await response.json()

  if (!response.ok || !result.success || !result.participant) {
    throw new Error('Failed to load participant data from backend.')
  }

  return result.participant
}

export function getCompletedSessions(participant) {
  if (!participant?.sessions) return []
  return participant.sessions.filter((session) => session.status === 'completed')
}

export function getSessionDomainBreakdown(session) {
  if (!session?.domainScores) return []

  return OBSERVATION_DOMAINS.map((domain) => ({
    key: domain.key,
    label: domain.label,
    score: session.domainScores[domain.key] ?? null,
    meta: domain,
  }))
}

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

export function getSortedDomains(session) {
  return getSessionDomainBreakdown(session).sort((a, b) => {
    const aScore = a.score ?? -Infinity
    const bScore = b.score ?? -Infinity
    return aScore - bScore
  })
}

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