/**
 * WellData Mock Participant Data
 *
 * Data model aligned with WellData Implementation Guide v0.1.2:
 * - Observation domains from IG §11.3 with SNOMED-CT / LOINC codes
 * - QuestionnaireResponse structure from IG §11.4
 * - Gezondheidsgids questionnaire themes from IG §10
 *
 * This mock will be replaced by the adapter layer (getParticipantData.js)
 * once backend / pod integration is available.
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

// ── Helper: domain lookup ──────────────────────────────────────────────
export function getDomainMeta(key) {
  return OBSERVATION_DOMAINS.find((d) => d.key === key) || null
}

// ── Mock participant with per-session, per-domain scores ───────────────
export const mockParticipant = {
  participantId: 'P-001',
  name: 'Demo Participant',
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

  // Derived from most recent completed session (session-2)
  currentWellbeing: {
    score: 72,
    maxScore: 100,
    sessionId: 'session-2',
    summary: 'Overall wellbeing slightly improved compared to last week.',
    focusDomain: 'stress', // lowest-scoring domain
  },

  // Generated from domains scoring below threshold (< 6.0)
  recommendations: [
    {
      id: 'rec-1',
      text: 'Keep a regular bedtime for the next 7 days.',
      triggerDomain: 'stress',
      triggerScore: 5.0,
      threshold: 6.0,
      status: 'pending', // pending | acknowledged | completed
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
      triggerDomain: null, // general platform engagement
      triggerScore: null,
      threshold: null,
      status: 'pending',
    },
  ],
}