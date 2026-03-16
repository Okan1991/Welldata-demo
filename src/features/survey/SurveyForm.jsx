import React, { useEffect, useState } from 'react'
import { submitSurvey } from '../../data/getParticipantData.js'

const SURVEY_FIELDS = [
  {
    key: 'stress',
    label: 'Stress',
    code: '68011-6',
    system: 'http://loinc.org',
    min: 0,
    max: 10,
    step: 0.5,
  },
  {
    key: 'physical_exercise',
    label: 'Physical exercise',
    code: '228450008',
    system: 'http://snomed.info/sct',
    min: 0,
    max: 10,
    step: 0.5,
  },
  {
    key: 'daily_life',
    label: 'Daily life',
    code: '91621-3',
    system: 'http://loinc.org',
    min: 0,
    max: 10,
    step: 0.5,
  },
  {
    key: 'social_contact',
    label: 'Social contact',
    code: '61581-5',
    system: 'http://loinc.org',
    min: 0,
    max: 10,
    step: 0.5,
  },
  {
    key: 'alcohol',
    label: 'Alcohol consumption',
    code: '897148007',
    system: 'http://snomed.info/sct',
    min: 0,
    max: 10,
    step: 0.5,
  },
  {
    key: 'smoking',
    label: 'Smoking',
    code: '63638-1',
    system: 'http://loinc.org',
    min: 0,
    max: 10,
    step: 0.5,
  },
]

function getInitialAnswers(participant) {
  const currentSession =
    participant?.sessions?.find((session) => session.id === participant.currentSessionId) ||
    null

  return {
    stress: currentSession?.domainScores?.stress ?? 5,
    physical_exercise: currentSession?.domainScores?.physical_exercise ?? 7,
    daily_life: currentSession?.domainScores?.daily_life ?? 7,
    social_contact: currentSession?.domainScores?.social_contact ?? 7,
    alcohol: currentSession?.domainScores?.alcohol ?? 7,
    smoking: currentSession?.domainScores?.smoking ?? 7,
  }
}

export default function SurveyForm({
  participant,
  authState,
  onSurveySubmitted,
}) {
  const [answers, setAnswers] = useState(() => getInitialAnswers(participant))
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitResult, setSubmitResult] = useState(null)

  useEffect(() => {
    setAnswers(getInitialAnswers(participant))
  }, [participant])

  function handleChange(key, value) {
    setAnswers((prev) => ({
      ...prev,
      [key]: Number(value),
    }))
  }

  function buildFhirData() {
    return SURVEY_FIELDS.map((field) => ({
      linkId: field.key,
      text: field.label,
      code: [
        {
          system: field.system,
          code: field.code,
          display: field.label,
        },
      ],
      answer: [
        {
          valueDecimal: Number(answers[field.key]),
        },
      ],
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    setSubmitResult(null)

    try {
      const fhirData = buildFhirData()

      const saveResult = await submitSurvey(
        authState?.webId || 'https://example.org/profile/card#me',
        fhirData,
        authState?.umaAccessToken || null,
        authState?.resourceUrl || null
      )

      setSubmitResult(saveResult)

      onSurveySubmitted?.({
        domainScores: {
          stress: Number(answers.stress),
          physical_exercise: Number(answers.physical_exercise),
          daily_life: Number(answers.daily_life),
          social_contact: Number(answers.social_contact),
          alcohol: Number(answers.alcohol),
          smoking: Number(answers.smoking),
        },
        fhirData,
        saveResult,
      })
    } catch (error) {
      console.error(error)
      setSubmitError(error.message || 'Survey submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <p style={{ marginTop: 0 }}>
        Complete a short lifestyle-oriented questionnaire and render the updated result in the dashboard.
      </p>

      <form onSubmit={handleSubmit}>
        {SURVEY_FIELDS.map((field) => (
          <div key={field.key} style={{ marginBottom: '16px' }}>
            <label htmlFor={field.key} style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
              {field.label} ({field.min}–{field.max})
            </label>

            <input
              id={field.key}
              type="range"
              min={field.min}
              max={field.max}
              step={field.step}
              value={answers[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              style={{ width: '100%' }}
            />

            <div style={{ marginTop: '4px' }}>
              Current value: <strong>{answers[field.key]}</strong>
            </div>
          </div>
        ))}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit questionnaire'}
        </button>
      </form>

      {submitError && (
        <p style={{ color: 'red', marginTop: '12px' }}>
          {submitError}
        </p>
      )}

      {submitResult && (
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '12px',
            marginTop: '16px',
            background: '#f8f8f8',
          }}
        >
          <p><strong>Survey save result:</strong></p>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(submitResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}