# Jenkins Documentation Generator

AI-powered documentation generator for Jenkins pipelines. Upload screenshots, record your screen, or upload Jenkins `config.xml` files to automatically generate comprehensive pipeline documentation using Claude Sonnet 4.5 or Gemini 3 Flash.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS, Shadcn/UI, React Router |
| Backend | Python 3.11, FastAPI, Motor (async MongoDB driver) |
| Database | MongoDB |
| AI | Claude Sonnet 4.5 (Anthropic), Gemini 3 Flash (Google) via Emergent Integrations |
| Storage | Emergent Object Storage (for uploaded files) |
| Export | ReportLab (PDF), python-docx (Word) |

---

## Features

- **Screen Capture** -- Upload screenshots, take on-demand screenshots, or record your screen
- **Jenkins config.xml Upload** -- Auto-parses job type, parameters, SCM, triggers, build steps, pipeline scripts, post-build actions, and environment variables
- **AI Documentation Generation** -- Choose between Claude Sonnet 4.5 or Gemini 3 Flash
- **Markdown Editor** -- View and edit generated documentation with syntax highlighting
- **Export** -- Download as PDF or Word document
- **Templates** -- Create reusable prompt templates for different pipeline types
- **History** -- Browse, edit, and manage all generated documentation

---

## Prerequisites

- **Python 3.11+**
- **Node.js 18+** and **Yarn**
- **MongoDB** (running locally or remote)
- **Emergent LLM Key** (for AI generation and object storage)

---

## Project Structure

```
.
├── backend/
│   ├── server.py            # FastAPI application (all routes and logic)
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js           # React Router setup
│   │   ├── pages/
│   │   │   ├── Dashboard.js         # Home page
│   │   │   ├── NewDocumentation.js  # Create docs (upload, capture, XML)
│   │   │   ├── EditDocumentation.js # View/edit/export docs
│   │   │   ├── History.js           # Documentation history
│   │   │   └── Templates.js         # Template management
│   │   ├── components/
│   │   │   ├── Navigation.js        # Top navigation bar
│   │   │   └── ui/                  # Shadcn UI components
│   │   ├── index.css        # Global styles and CSS variables
│   │   └── App.css          # Component styles
│   ├── package.json
│   └── .env                 # Frontend environment variables
└── README.md
```

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <repo-name>
```

### 2. Backend setup

```bash
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
```

### 3. Configure backend environment variables

Create (or edit) `backend/.env`:

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="jenkins_doc_gen"
CORS_ORIGINS="*"
EMERGENT_LLM_KEY=<your-emergent-llm-key>
```

| Variable | Description |
|----------|-------------|
| `MONGO_URL` | MongoDB connection string |
| `DB_NAME` | Database name |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated, or `*` for all) |
| `EMERGENT_LLM_KEY` | Emergent universal key for AI (Claude/Gemini) and object storage |

### 4. Frontend setup

```bash
cd frontend

# Install dependencies
yarn install
```

### 5. Configure frontend environment variables

Create (or edit) `frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

| Variable | Description |
|----------|-------------|
| `REACT_APP_BACKEND_URL` | URL where the backend API is running |

---

## Running the Application

### Start MongoDB

```bash
# If using local MongoDB:
mongod --dbpath /path/to/data
```

### Start the backend

```bash
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The API will be available at `http://localhost:8001`. All routes are prefixed with `/api`.

### Start the frontend

```bash
cd frontend
yarn start
```

The app will open at `http://localhost:3000`.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/` | Health check |
| `POST` | `/api/upload` | Upload screenshot/image files |
| `POST` | `/api/upload-xml` | Upload and parse Jenkins config.xml |
| `GET` | `/api/files/{file_id}` | Retrieve an uploaded file |
| `GET` | `/api/xml-files/{xml_id}` | Get parsed XML file metadata |
| `POST` | `/api/generate` | Generate documentation via AI |
| `GET` | `/api/documentations` | List all documentation |
| `GET` | `/api/documentations/{id}` | Get single documentation |
| `PUT` | `/api/documentations/{id}` | Update documentation |
| `DELETE` | `/api/documentations/{id}` | Delete documentation |
| `POST` | `/api/templates` | Create a template |
| `GET` | `/api/templates` | List all templates |
| `DELETE` | `/api/templates/{id}` | Delete a template |
| `GET` | `/api/export/pdf/{id}` | Export documentation as PDF |
| `GET` | `/api/export/word/{id}` | Export documentation as Word (.docx) |

### Generate documentation request body

```json
{
  "title": "My Pipeline Docs",
  "file_ids": ["<screenshot-file-id>"],
  "xml_file_ids": ["<config-xml-id>"],
  "template_id": "<optional-template-id>",
  "ai_provider": "claude"
}
```

- `file_ids` and `xml_file_ids` are both optional, but at least one must be non-empty.
- `ai_provider` accepts `"claude"` (Claude Sonnet 4.5) or `"gemini"` (Gemini 3 Flash).

---

## Usage Guide

### Generating docs from screenshots

1. Navigate to **NEW** in the top navigation.
2. Use **Upload Files**, **Screenshot**, or **Record** to capture your Jenkins pipeline screens.
3. Click **Upload Selected Files** to upload them.
4. Enter a title, select an AI provider, and optionally pick a template.
5. Click **GENERATE DOCS** (takes ~1-2 minutes).
6. Edit, export to PDF/Word, or save.

### Generating docs from config.xml

1. Navigate to **NEW**.
2. Scroll to the **JENKINS CONFIG.XML** section.
3. Click the upload area and select one or more `config.xml` files.
4. Click **PARSE & UPLOAD XML** -- the app will parse and show a preview of extracted data.
5. Expand the preview card to verify parameters, triggers, build steps, etc.
6. Enter a title and click **GENERATE DOCS**.

### Combined approach

Upload both screenshots and config.xml files for the richest documentation output. The AI receives the pre-parsed XML structure, the raw XML content, and context about the screenshots.

### Using templates

1. Go to **TEMPLATES** and click **NEW TEMPLATE**.
2. Define a name, description, and a custom prompt (e.g., focused on Helm values or DSL scripts).
3. When generating docs, select your template from the dropdown.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | Yes | MongoDB connection string |
| `DB_NAME` | Yes | MongoDB database name |
| `CORS_ORIGINS` | No | Allowed origins (default: `*`) |
| `EMERGENT_LLM_KEY` | Yes | Emergent universal key for AI + storage |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_BACKEND_URL` | Yes | Backend API base URL |

---

## License

MIT
