# Jenkins Documentation Generator - PRD

## Original Problem Statement
Build an app that can create documentation using AI while seeing my screen. This app should be optimized for understanding Jenkins pipelines as I have created an end to end automated pipeline for doing everything from creating bitbucket repos, creating ecr repos, creating db and db users, creating aws secrets, creating microservice helm values file for argocd and even creating jenkins job via DSL script.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: Claude Sonnet 4.5 (Anthropic) + Gemini 3 Flash (Google) via Emergent LLM Key
- **Storage**: Emergent Object Storage for uploaded screenshots/recordings
- **Export**: ReportLab (PDF) + python-docx (Word)

## User Personas
1. **DevOps Engineer**: Creates Jenkins pipelines and needs to document them for the team
2. **Team Lead**: Reviews and edits generated documentation
3. **New Team Member**: Uses documentation to understand existing pipelines

## Core Requirements
- Screen capture (button click, manual upload, screen recording)
- AI-powered documentation generation (Claude Sonnet 4.5 / Gemini 3 Flash)
- Jenkins pipeline syntax highlighting
- Edit generated documentation
- Template support for different pipeline types
- Documentation history management
- Export to PDF and Word Document

## What's Been Implemented (April 12, 2026)
- Full backend API with CRUD for documentations, templates, files
- AI documentation generation endpoint using emergentintegrations
- Object storage integration for file uploads
- PDF export via ReportLab
- Word document export via python-docx
- Complete frontend with 5 pages (Dashboard, New, Edit, History, Templates)
- Dark Swiss/High-Contrast design theme
- 5 pre-seeded pipeline templates (CI/CD, Helm Values, ECR+Bitbucket, DB+Secrets, Jenkins DSL)
- Screen capture (upload, screenshot, recording) via browser APIs

## Prioritized Backlog
### P0
- (Done) Core documentation generation flow
- (Done) File upload and AI integration
- (Done) CRUD operations

### P1
- Image-aware AI generation (currently text-only, needs vision model support)
- Markdown preview in editor (side-by-side edit/preview)
- Search/filter documentation history

### P2
- User authentication
- Collaborative editing
- Version history for documents
- Auto-save during editing
- Batch export

## Next Tasks
1. Enhance AI generation to use vision capabilities (send base64 images to AI)
2. Add side-by-side markdown editor/preview
3. Add search functionality to history page
4. Improve export formatting (syntax highlighting in PDF/Word)
