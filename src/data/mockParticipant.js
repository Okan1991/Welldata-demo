/**
 * WellData Mock Participant Data
 *
 * Data model aligned with WellData Implementation Guide v0.1.2:
 * - Observation domains from IG §11.3 with SNOMED-CT / LOINC codes
 * - QuestionnaireResponse structure from IG §11.4
 * - Gezondheidsgids questionnaire themes from IG §10
 */

// ── Observation domain definitions (IG §11.3) ──────────────────────────
export const OBSERVATION_DOMAINS = [
  {
    key: 'stress',
    label: 'Stress',
    description: 'Stress ervaring',
    system: 'http://loinc.org',
    code: '68011-6',
    codeDisplay: 'Stress',
    source: 'Intake vragenlijst',
  },
  {
    key: 'physical_exercise',
    label: 'Physical exercise',
    description: 'Beweegminuten',
    system: 'http://snomed.info/sct',
    code: '228450008',
    codeDisplay: 'Physical exercise',
    source: 'GGDM Zipster Selfcare',
  },
  {
    key: 'daily_life',
    label: 'Daily life',
    description: 'Dagelijks leven',
    system: 'http://loinc.org',
    code: '91621-3',
    codeDisplay: 'Daily life',
    source: 'Intake vragenlijst',
  },
  {
    key: 'social_contact',
    label: 'Social contact',
    description: 'Voldoening uit sociale contacten',
    system: 'http://loinc.org',
    code: '61581-5',
    codeDisplay: 'Social contact',
    source: 'Intake vragenlijst / Selfcare',
  },
  {
    key: 'alcohol',
    label: 'Alcohol consumption',
    description: 'Alcohol drinken',
    system: 'http://snomed.info/sct',
    code: '897148007',
    codeDisplay: 'Alcohol consumption',
    source: 'Intake vragenlijst / GGDM',
  },
  {
    key: 'smoking',
    label: 'Smoking',
    description: 'Roken (ja/nee)',
    system: 'http://loinc.org',
    code: '63638-1',
    codeDisplay: 'Smoking status',
    secondarySystem: 'http://snomed.info/sct',
    secondaryCode: '77176002',
    source: 'Intake vragenlijst / GGDM',
  },
]

export function getDomainMeta(key) {
  return OBSERVATION_DOMAINS.find((d) => d.key === key) || null
}

const participantABase = {
  participantId: 'P-001',
  name: 'Demo Participant A',
  currentSessionId: 'session-2',
  sessions: [
    {
      id: 'session-1',
      date: '2026-03-01',
      label: 'Baseline questionnaire completed',
      status: 'completed',
      overallScore: 68,
      domainScores: {
        stress: 5.5,
        physical_exercise: 7.0,
        daily_life: 7.5,
        social_contact: 8.0,
        alcohol: 6.0,
        smoking: 7.0,
      },
    },
    {
      id: 'session-2',
      date: '2026-03-08',
      label: 'Weekly check-in',
      status: 'completed',
      overallScore: 72,
      domainScores: {
        stress: 5.0,
        physical_exercise: 7.5,
        daily_life: 8.0,
        social_contact: 8.5,
        alcohol: 6.5,
        smoking: 7.0,
      },
    },
    {
      id: 'session-3',
      date: '2026-03-15',
      label: 'Follow-up review',
      status: 'planned',
      overallScore: null,
      domainScores: null,
    },
  ],
  currentWellbeing: {
    score: 72,
    maxScore: 100,
    sessionId: 'session-2',
    summary: 'Overall wellbeing slightly improved compared to last week.',
    focusDomain: 'stress',
  },
  recommendations: [
    {
      id: 'rec-1',
      text: 'Keep a regular bedtime for the next 7 days.',
      triggerDomain: 'stress',
      triggerScore: 5.0,
      threshold: 6.0,
      status: 'pending',
    },
    {
      id: 'rec-2',
      text: 'Add one 20-minute walk after lunch, 3 times this week.',
      triggerDomain: 'physical_exercise',
      triggerScore: 7.5,
      threshold: 8.0,
      status: 'pending',
    },
    {
      id: 'rec-3',
      text: 'Complete the next check-in before Friday.',
      triggerDomain: null,
      triggerScore: null,
      threshold: null,
      status: 'pending',
    },
  ],
}

const participantBBase = {
  participantId: 'P-002',
  name: 'Demo Participant B',
  currentSessionId: 'session-2',
  sessions: [
    {
      id: 'session-1',
      date: '2026-03-01',
      label: 'Baseline questionnaire completed',
      status: 'completed',
      overallScore: 61,
      domainScores: {
        stress: 7.0,
        physical_exercise: 4.5,
        daily_life: 6.0,
        social_contact: 6.5,
        alcohol: 8.0,
        smoking: 8.0,
      },
    },
    {
      id: 'session-2',
      date: '2026-03-08',
      label: 'Weekly check-in',
      status: 'completed',
      overallScore: 64,
      domainScores: {
        stress: 7.5,
        physical_exercise: 5.0,
        daily_life: 6.5,
        social_contact: 6.0,
        alcohol: 8.0,
        smoking: 8.0,
      },
    },
    {
      id: 'session-3',
      date: '2026-03-15',
      label: 'Follow-up review',
      status: 'planned',
      overallScore: null,
      domainScores: null,
    },
  ],
  currentWellbeing: {
    score: 64,
    maxScore: 100,
    sessionId: 'session-2',
    summary: 'Physical exercise remains the main improvement area this week.',
    focusDomain: 'physical_exercise',
  },
  recommendations: [
    {
      id: 'rec-1',
      text: 'Add two 15-minute walks on workdays this week.',
      triggerDomain: 'physical_exercise',
      triggerScore: 5.0,
      threshold: 6.0,
      status: 'pending',
    },
    {
      id: 'rec-2',
      text: 'Plan one social activity with a friend or relative this week.',
      triggerDomain: 'social_contact',
      triggerScore: 6.0,
      threshold: 6.5,
      status: 'pending',
    },
    {
      id: 'rec-3',
      text: 'Complete the next check-in before Friday.',
      triggerDomain: null,
      triggerScore: null,
      threshold: null,
      status: 'pending',
    },
  ],
}

export const mockParticipantA = participantABase
export const mockParticipantB = participantBBase

// Backward-compatible default export target
export const mockParticipant = mockParticipantA