from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Header, Query, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import requests
from emergentintegrations.llm.chat import LlmChat, UserMessage
import base64
from io import BytesIO
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Preformatted
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Object Storage Setup
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "jenkins-doc-gen"
storage_key = None

def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple:
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Pydantic Models
class FileUploadResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    storage_path: str
    original_filename: str
    content_type: str
    size: int
    created_at: str

class DocumentationCreate(BaseModel):
    title: str
    file_ids: List[str]
    template_id: Optional[str] = None
    ai_provider: str = "claude"

class DocumentationUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class Documentation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    content: str
    file_ids: List[str]
    template_id: Optional[str] = None
    created_at: str
    updated_at: str

class TemplateCreate(BaseModel):
    name: str
    description: str
    prompt_template: str

class Template(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    prompt_template: str
    created_at: str

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Jenkins Documentation Generator API"}

@api_router.post("/upload", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    try:
        ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
        path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
        data = await file.read()
        result = put_object(path, data, file.content_type or "application/octet-stream")
        
        file_doc = {
            "id": str(uuid.uuid4()),
            "storage_path": result["path"],
            "original_filename": file.filename,
            "content_type": file.content_type,
            "size": result["size"],
            "is_deleted": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.files.insert_one(file_doc)
        return FileUploadResponse(**file_doc)
    except Exception as e:
        logging.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/files/{file_id}")
async def get_file(file_id: str, authorization: str = Header(None), auth: str = Query(None)):
    try:
        record = await db.files.find_one({"id": file_id, "is_deleted": False}, {"_id": 0})
        if not record:
            raise HTTPException(status_code=404, detail="File not found")
        
        data, content_type = get_object(record["storage_path"])
        return Response(content=data, media_type=record.get("content_type", content_type))
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get file error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/generate", response_model=Documentation)
async def generate_documentation(doc_create: DocumentationCreate):
    try:
        # Get file URLs
        files = await db.files.find({"id": {"$in": doc_create.file_ids}, "is_deleted": False}, {"_id": 0}).to_list(100)
        
        if not files:
            raise HTTPException(status_code=400, detail="No valid files found")
        
        # Get template if provided
        template_prompt = ""
        if doc_create.template_id:
            template = await db.templates.find_one({"id": doc_create.template_id}, {"_id": 0})
            if template:
                template_prompt = template["prompt_template"]
        
        # Build prompt
        base_prompt = template_prompt if template_prompt else """You are an expert DevOps documentation specialist. Analyze the provided Jenkins pipeline screenshots and create comprehensive, professional documentation.

Focus on:
- Pipeline structure and stages
- Environment variables and configurations
- Build steps and deployment processes
- Error handling and notifications
- Best practices and optimizations

Provide clear, well-structured documentation in Markdown format with proper headings, code blocks, and explanations."""
        
        # Prepare images for AI
        image_data = []
        for f in files:
            try:
                data, _ = get_object(f["storage_path"])
                b64_data = base64.b64encode(data).decode('utf-8')
                image_data.append(b64_data)
            except:
                continue
        
        if not image_data:
            raise HTTPException(status_code=400, detail="Could not process images")
        
        # Generate documentation with AI
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"doc-gen-{uuid.uuid4()}",
            system_message=base_prompt
        )
        
        if doc_create.ai_provider == "claude":
            chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
        else:
            chat.with_model("gemini", "gemini-3-flash-preview")
        
        # Create message with images
        user_message = UserMessage(
            text=f"Analyze these Jenkins pipeline screenshots and create detailed documentation for: {doc_create.title}"
        )
        
        response = await chat.send_message(user_message)
        
        # Save documentation
        doc_data = {
            "id": str(uuid.uuid4()),
            "title": doc_create.title,
            "content": response,
            "file_ids": doc_create.file_ids,
            "template_id": doc_create.template_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.documentations.insert_one(doc_data)
        
        return Documentation(**doc_data)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Generate error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/documentations", response_model=List[Documentation])
async def get_documentations():
    docs = await db.documentations.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return docs

@api_router.get("/documentations/{doc_id}", response_model=Documentation)
async def get_documentation(doc_id: str):
    doc = await db.documentations.find_one({"id": doc_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Documentation not found")
    return doc

@api_router.put("/documentations/{doc_id}", response_model=Documentation)
async def update_documentation(doc_id: str, update: DocumentationUpdate):
    doc = await db.documentations.find_one({"id": doc_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Documentation not found")
    
    update_data = update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.documentations.update_one({"id": doc_id}, {"$set": update_data})
    updated_doc = await db.documentations.find_one({"id": doc_id}, {"_id": 0})
    return updated_doc

@api_router.delete("/documentations/{doc_id}")
async def delete_documentation(doc_id: str):
    result = await db.documentations.delete_one({"id": doc_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Documentation not found")
    return {"message": "Documentation deleted"}

@api_router.post("/templates", response_model=Template)
async def create_template(template: TemplateCreate):
    template_data = {
        "id": str(uuid.uuid4()),
        **template.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.templates.insert_one(template_data)
    return Template(**template_data)

@api_router.get("/templates", response_model=List[Template])
async def get_templates():
    templates = await db.templates.find({}, {"_id": 0}).to_list(100)
    return templates

@api_router.delete("/templates/{template_id}")
async def delete_template(template_id: str):
    result = await db.templates.delete_one({"id": template_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"message": "Template deleted"}

@api_router.get("/export/pdf/{doc_id}")
async def export_pdf(doc_id: str):
    doc = await db.documentations.find_one({"id": doc_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Documentation not found")
    
    buffer = BytesIO()
    pdf_doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=RGBColor(0, 47, 167),
        spaceAfter=30
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=RGBColor(0, 0, 0),
        spaceAfter=12
    )
    
    code_style = ParagraphStyle(
        'Code',
        parent=styles['Code'],
        fontSize=9,
        leftIndent=20,
        textColor=RGBColor(50, 50, 50),
        backColor=RGBColor(240, 240, 240)
    )
    
    story = []
    story.append(Paragraph(doc["title"], title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Parse markdown content
    lines = doc["content"].split('\n')
    for line in lines:
        if line.startswith('# '):
            story.append(Paragraph(line[2:], title_style))
        elif line.startswith('## '):
            story.append(Paragraph(line[3:], heading_style))
        elif line.startswith('```'):
            continue
        elif line.strip():
            story.append(Paragraph(line, styles['Normal']))
        story.append(Spacer(1, 0.1*inch))
    
    pdf_doc.build(story)
    buffer.seek(0)
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{doc["title"]}.pdf"'}
    )

@api_router.get("/export/word/{doc_id}")
async def export_word(doc_id: str):
    doc = await db.documentations.find_one({"id": doc_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Documentation not found")
    
    word_doc = Document()
    
    # Add title
    title = word_doc.add_heading(doc["title"], 0)
    title.alignment = WD_PARAGRAPH_ALIGNMENT.LEFT
    
    # Parse and add content
    lines = doc["content"].split('\n')
    in_code_block = False
    
    for line in lines:
        if line.startswith('```'):
            in_code_block = not in_code_block
            continue
        
        if line.startswith('# '):
            word_doc.add_heading(line[2:], 1)
        elif line.startswith('## '):
            word_doc.add_heading(line[3:], 2)
        elif line.startswith('### '):
            word_doc.add_heading(line[4:], 3)
        elif in_code_block:
            p = word_doc.add_paragraph(line)
            p.style = 'Code'
        elif line.strip():
            word_doc.add_paragraph(line)
    
    buffer = BytesIO()
    word_doc.save(buffer)
    buffer.seek(0)
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{doc["title"]}.docx"'}
    )

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()