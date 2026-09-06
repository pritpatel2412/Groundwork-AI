import io
import os
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel

from app.db.client import db_client
from app.rag.chunking import chunk_text
from app.rag.embeddings import embed
from app.models.schemas import SourceDocument, SourceChunk
from app.llm_clients.sarvam_client import sarvam_client

router = APIRouter(prefix="/workspaces", tags=["Ingestion"])

class TextIngestRequest(BaseModel):
    text: str
    filename: Optional[str] = "Pasted Input"
    source_type: Optional[str] = "free_text"

def extract_text_from_pdf(content: bytes) -> str:
    try:
        import fitz # PyMuPDF
        doc = fitz.open(stream=content, filetype="pdf")
        text = "\n\n".join([page.get_text() for page in doc])
        return text.strip()
    except Exception as e:
        print(f"[Ingestion] PyMuPDF failed: {e}")
        return ""

def extract_text_from_docx(content: bytes) -> str:
    try:
        import docx
        doc = docx.Document(io.BytesIO(content))
        text = "\n\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        return text.strip()
    except Exception as e:
        print(f"[Ingestion] python-docx failed: {e}")
        return ""

def extract_text_from_image(content: bytes) -> str:
    try:
        import pytesseract
        from PIL import Image
        img = Image.open(io.BytesIO(content))
        text = pytesseract.image_to_string(img)
        return text.strip()
    except Exception as e:
        print(f"[Ingestion] pytesseract failed: {e}")
        return ""

def process_and_save_document(
    workspace_id: str,
    raw_text: str,
    filename: str,
    source_type: str
) -> SourceDocument:
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="No readable text extracted from source.")

    # 1. Save Source Document
    doc = db_client.save_source_document(
        workspace_id=workspace_id,
        filename=filename,
        raw_text=raw_text,
        source_type=source_type
    )

    # 2. Chunk text
    chunks_text = chunk_text(raw_text)
    if not chunks_text:
        chunks_text = [raw_text]

    # 3. Embed chunks locally
    embeddings = embed(chunks_text)

    # 4. Save Source Chunks
    source_chunks = []
    for idx, (c_text, emb) in enumerate(zip(chunks_text, embeddings)):
        source_chunks.append(SourceChunk(
            source_document_id=doc.id,
            workspace_id=workspace_id,
            chunk_index=idx,
            text=c_text,
            embedding=emb
        ))
    db_client.save_source_chunks(source_chunks)

    return doc

@router.post("/{workspace_id}/sources/text", response_model=SourceDocument)
async def ingest_text(workspace_id: str, request: TextIngestRequest):
    """Ingest free-text, meeting notes, or pasted transcripts."""
    ws = db_client.get_workspace(workspace_id)
    if not ws:
        # Auto-create if not existing for smooth dev experience
        db_client.create_workspace(name=f"Workspace {workspace_id[:8]}")

    doc = process_and_save_document(
        workspace_id=workspace_id,
        raw_text=request.text,
        filename=request.filename or "Pasted Notes",
        source_type=request.source_type or "free_text"
    )
    return doc

@router.post("/{workspace_id}/sources/upload", response_model=SourceDocument)
async def ingest_file(
    workspace_id: str,
    file: UploadFile = File(...)
):
    """Ingest file: PDF, DOCX, TXT, Image (OCR), or Audio (Sarvam STT)."""
    ws = db_client.get_workspace(workspace_id)
    if not ws:
        db_client.create_workspace(name=f"Workspace {workspace_id[:8]}")

    content = await file.read()
    filename = file.filename or "uploaded_file"
    ext = filename.lower().split(".")[-1]

    extracted_text = ""
    source_type = "document"

    if ext == "pdf":
        extracted_text = extract_text_from_pdf(content)
        source_type = "document"
    elif ext in ["docx", "doc"]:
        extracted_text = extract_text_from_docx(content)
        source_type = "document"
    elif ext in ["png", "jpg", "jpeg", "webp", "bmp"]:
        source_type = "screenshot_ocr"
        extracted_text = extract_text_from_image(content)
        # If OCR text is weak, could be Indic scan
        if not extracted_text:
            extracted_text = "[Low-resolution image processed via OCR]"
    elif ext in ["wav", "mp3", "m4a", "ogg"]:
        source_type = "voice_transcript"
        stt_res = sarvam_client.speech_to_text(content, filename=filename)
        extracted_text = stt_res.get("transcript", "")
    elif ext in ["txt", "md", "csv", "json"]:
        source_type = "document"
        extracted_text = content.decode("utf-8", errors="ignore")
    else:
        extracted_text = content.decode("utf-8", errors="ignore")

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail=f"Could not extract text from file: {filename}")

    return process_and_save_document(
        workspace_id=workspace_id,
        raw_text=extracted_text,
        filename=filename,
        source_type=source_type
    )

@router.get("/{workspace_id}/sources", response_model=List[SourceDocument])
async def list_sources(workspace_id: str):
    """List all ingested sources for a workspace."""
    return db_client.get_documents_by_workspace(workspace_id)
