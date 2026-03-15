const express = require('express')
const fs = require('fs')
const path = require('path')

const router = express.Router()

function ensureSurveyDir() {
  const dir = path.join(__dirname, '..', 'data')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

// ------------------------------
// Survey save route
// ------------------------------
router.post('/survey/save', async (req, res) => {
  try {
    const {
      webId = null,
      timestamp = new Date().toISOString(),
      fhirData = [],
    } = req.body || {}

    const normalizedItems = Array.isArray(fhirData)
      ? fhirData
      : []

    const surveyPayload = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      authored: timestamp,
      subject: webId
        ? {
            reference: webId,
          }
        : null,
      item: normalizedItems,
    }

    const dir = ensureSurveyDir()
    const safeTime = timestamp.replace(/[:.]/g, '-')
    const filename = `survey-save-${safeTime}.json`
    const filepath = path.join(dir, filename)

    const storedRecord = {
      savedAt: new Date().toISOString(),
      webId,
      timestamp,
      surveyPayload,
    }

    fs.writeFileSync(filepath, JSON.stringify(storedRecord, null, 2), 'utf-8')

    return res.json({
      success: true,
      message: 'Survey payload prepared and saved locally',
      webId,
      timestamp,
      surveyPayload,
      itemCount: normalizedItems.length,
      filename,
      filepath,
    })
  } catch (error) {
    console.error('Survey route error:', error)

    return res.status(500).json({
      success: false,
      error: error.message || 'Survey route failed',
    })
  }
})

module.exports = router