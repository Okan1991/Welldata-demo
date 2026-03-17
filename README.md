# WellData Month-1 Demo

Participant dashboard demonstrating three preventive health features with WeAre federated authentication.

## Features

| Feature | Description | IG Reference |
|---------|-------------|-------------|
| **Participant Feedback Timeline** | Longitudinal view of questionnaire sessions with side-by-side comparison | IG §11.3–4 |
| **Score Explainability Panel** | Score breakdown per SNOMED-CT/LOINC coded Observation domain | IG §11.3, §10 |
| **Preventive Action Panel** | Rule-based lifestyle recommendations with triggering domain references | IG §8 |

## Architecture

```
Frontend (React/Vite, port 5174)
  ├── Questionnaire input (6 IG §11.3 domains)
  ├── Dashboard (timeline / explainability / actions)
  └── Auth status + consent flow UI

Backend (Express, port 3000)
  ├── HTI token callback (/oidc_redirect)
  ├── WeAre client auth + VC access request (/api/exchange-token-real)
  ├── Consent URL generation (/api/start-consent)
  ├── Access grant callback (/access-grant-callback)
  ├── UMA ticket + token exchange (/api/exchange-access-grant)
  ├── Survey save (/api/survey/save)
  └── Participant data (/api/participant)

WeAre Infrastructure
  ├── OIDC IdP (openid.we-are-acc.vito.be)
  ├── VC Service (vc.sandbox-pod.datanutsbedrijf.be)
  ├── UMA Service (uma.sandbox-pod.datanutsbedrijf.be)
  └── Solid Pod (storage.sandbox-pod.datanutsbedrijf.be)
```

## Prerequisites

- Node.js 18+
- npm
- `.env` file with WeAre credentials (see `.env.example` or below)

## Quick Start

```bash
# Install dependencies
npm install

# Create .env with required credentials
cp .env.example .env   # then fill in secrets

# Start backend (terminal 1)
node server.cjs

# Start frontend (terminal 2)
npm run dev
```

Backend runs on http://localhost:3000
Frontend runs on http://localhost:5174

## Environment Variables

```env
PORT=3000
FRONTEND_URL=http://localhost:5174
WEARE_AUTH_BASE_URL=https://we-are-acc.vito.be/nl/hti/launch
WEARE_CLIENT_ID=https://id.we-are-acc.vito.be/client/dcd2499f-...
WEARE_REDIRECT_URI=http://localhost:3000/oidc_redirect
WE_ARE_OIDC_HOST=https://openid.we-are-acc.vito.be
WE_ARE_OIDC_CLIENT_ID=https://id.we-are-acc.vito.be/client/dcd2499f-...
WE_ARE_OIDC_CLIENT_SECRET=<secret>
VC_HOST=https://vc.sandbox-pod.datanutsbedrijf.be
UMA_HOST=https://uma.sandbox-pod.datanutsbedrijf.be
```

## Authentication Flow

The app implements the full 12-step WeAre/Solid authentication chain:

1. Citizen login via DigiD (eIDAS) → HTI token
2. HTI token decode → WebID extraction
3. We.Are client authentication → access + id token
4. VC configuration discovery
5. Access request VC creation (201 Created)
6. Citizen consent via We.Are portal (browser redirect)
7. Access grant VC retrieval
8. UMA configuration discovery
9. UMA ticket retrieval (intentional 401)
10. UMA token exchange → access token (read,write scope)
11. Solid pod resource access (200 OK, RDF/Turtle)

## Data Model

Observation domains aligned with WellData IG §11.3:

| Domain | Code | System |
|--------|------|--------|
| Stress | 68011-6 | LOINC |
| Physical exercise | 228450008 | SNOMED-CT |
| Daily life | 91621-3 | LOINC |
| Social contact | 61581-5 | LOINC |
| Alcohol consumption | 897148007 | SNOMED-CT |
| Smoking | 63638-1 | LOINC |

Survey data is stored as FHIR R4 QuestionnaireResponse resources.

## Project Structure

```
welldata-demo/
├── server.cjs                    # Express backend
├── routes/
│   ├── authRoutes.cjs            # Auth debug endpoints
│   └── surveyRoutes.cjs          # Survey save endpoints
├── services/
│   ├── tokenService.cjs          # HTI token handling
│   ├── realTokenService.cjs      # Full 12-step auth chain
│   └── podService.cjs            # Solid pod operations
├── src/
│   ├── App.jsx                   # Main app with auth + features
│   ├── data/
│   │   ├── mockParticipant.js    # IG-aligned mock data
│   │   └── getParticipantData.js # Adapter layer (mock ↔ backend)
│   ├── components/               # Shared UI components
│   ├── features/
│   │   ├── timeline/             # Feature 1
│   │   ├── explainability/       # Feature 2
│   │   ├── actions/              # Feature 3
│   │   └── survey/               # Questionnaire input
│   └── style.css
├── data/                         # Local survey saves (gitignored)
└── .env                          # Credentials (gitignored)
```

## Security Notes

- `.env` contains secrets and is gitignored
- `data/` directory contains survey saves and is gitignored
- UMA tokens expire after 300 seconds
- Consent grant validity is set to 24 hours for development
- No production credentials are stored in the repository
