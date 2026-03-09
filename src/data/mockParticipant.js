export const mockParticipant = {
  participantId: 'P-001',
  name: 'Demo Participant',
  currentSessionId: 'session-2',
  sessions: [
    {
      id: 'session-1',
      date: '2026-03-01',
      overallScore: 68,
      status: 'Completed',
      trendLabel: 'Needs attention',
      label: 'Baseline questionnaire completed',
    },
    {
      id: 'session-2',
      date: '2026-03-08',
      overallScore: 72,
      status: 'Pending',
      trendLabel: 'Improving',
      label: 'Weekly check-in pending',
    },
    {
      id: 'session-3',
      date: '2026-03-15',
      overallScore: null,
      status: 'Planned',
      trendLabel: 'Planned review',
      label: 'Follow-up review planned',
    },
  ],
  wellbeing: {
    score: 72,
    factors: [
      { key: 'sleep', label: 'Sleep quality', value: 'stable' },
      { key: 'activity', label: 'Activity consistency', value: 'moderate improvement' },
      { key: 'stress', label: 'Stress check-ins', value: 'mixed over the past week' },
    ],
  },
  recommendations: [
    'Keep a regular bedtime for the next 7 days.',
    'Add one 20-minute walk after lunch, 3 times this week.',
    'Complete the next check-in before Friday.',
  ],
}