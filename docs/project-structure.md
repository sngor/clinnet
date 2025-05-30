# Clinnet-EMR Project Structure

This document describes the directory and file layout of the Clinnet-EMR project, with explanations for each major folder and file. For local setup and deployment, see [local-development.md](./local-development.md) and [deployment.md](./deployment.md).

## Root Directory

- `README.md` — Project overview and quick links
- `docs/` — All documentation guides (see below)
- `frontend/` — React frontend (Vite, Material UI)
- `backend/` — Python backend (AWS Lambda, SAM, DynamoDB)

## docs/

- `project-structure.md` — This file
- `deployment.md` — Unified deployment guide (backend & frontend)
- `profile-image-system.md` — Profile image upload/fetch system (API, S3, IAM)
- `troubleshooting.md` — Common issues, logs, and solutions
- `architecture.md` — High-level system architecture (diagrams, flow)
- `local-development.md` — Local setup, environment, and scripts
- `cognito-custom-attributes-guide.md` — Cognito integration and custom attributes
- `dynamodb-guide.md` — DynamoDB schema, indexes, and usage
- `medical-reports-api.md` — Medical reports API endpoints and usage

## frontend/

- `src/` — All React source code (see below)
- `public/` — Static assets (favicon, etc.)
- `package.json` — Frontend dependencies and scripts
- `vite.config.js` — Vite configuration
- `test_profile_images.js` — Profile image system test script
- `README.md` — Frontend-specific guide

### frontend/src/

- `app/` — App configuration, providers, and theme
- `components/` — Shared UI components (see `components/ui/` for design system)
- `features/` — Feature modules (appointments, patients, etc.)
- `mock/` — Mock data for development/testing
- `pages/` — Page-level React components (route targets)
- `services/` — API and business logic services
- `utils/` — Utility functions (date, status, etc.)

## backend/

- `src/` — Lambda handlers and utilities
- `template.yaml` — AWS SAM template (infrastructure as code)
- `requirements.txt` — Python dependencies
- `test_end_to_end.py` — End-to-end backend tests
- `deploy_validation.py` — Deployment automation
- `README.md` — Backend-specific guide

### backend/src/

- `handlers/` — Lambda function handlers (API endpoints)
- `utils/` — Shared Python utilities

## Key Scripts

- `frontend/scripts/update-dependencies.sh` — Update Node dependencies
- `frontend/scripts/deploy-frontend.sh` — Deploy frontend to S3/static host
- `backend/quick_deploy.sh` — Quick backend deploy
- `backend/scripts/seed_data.sh` — Seed DynamoDB with test data

---

For more details, see the other guides in the `docs/` folder.
