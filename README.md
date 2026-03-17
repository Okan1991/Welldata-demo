# WellData Month-1 PIP Demo 

Participant dashboard demonstrating three preventive health features with WeAre federated authentication.

## Features

| Feature | Description | IG Reference |
|---------|-------------|-------------|
| **Participant Feedback Timeline** | Longitudinal view of questionnaire sessions with side-by-side comparison | IG §11.3–4 |
| **Score Explainability Panel** | Score breakdown per SNOMED-CT/LOINC coded Observation domain | IG §11.3, §10 |
| **Preventive Action Panel** | Rule-based lifestyle recommendations with triggering domain references | IG §8 |

## Architecture

\\\
Frontend (React/Vite, port 5174)
  +-- Questionnaire input (6 IG §11.3 domains)
  +-- Dashboard (timeline / explainability / actions)
  +-- Auth status + consent flow UI

Backend (Express, port 3000)
  +-- HTI token callback (/oidc_redirect)
  +-- WeAre client auth + VC access request (/api/exchange-token-real)
  +-- Consent URL generation (/api/start-consent)
  +-- Access grant callback (/access-grant-callback)
  +-- UMA ticket + token exchange (/api/exchange-access-grant)
  +-- Survey save (/api/survey/save)
  +-- Participant data (/api/participant)

WeAre Infrastructure
  +-- OIDC IdP (openid.we-are-acc.vito.be)
  +-- VC Service (vc.sandbox-pod.datanutsbedrijf.be)
  +-- UMA Service (uma.sandbox-pod.datanutsbedrijf.be)
  +-- Solid Pod (storage.sandbox-pod.datanutsbedrijf.be)
\\\

## Prerequisites

- Node.js 18+
- npm
- \.env\ file with WeAre credentials

## Quick Start

\\\ash
npm install
cp .env.example .env
node server.cjs
npm run dev
\\\

Backend: http://localhost:3000  
Frontend: http://localhost:5174

## Security Notes

- \.env\ is gitignored  
- \data/\ is gitignored  
- Tokens expire after 300 seconds  
