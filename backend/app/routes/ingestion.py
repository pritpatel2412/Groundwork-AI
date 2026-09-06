import io
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel

from app.db.client import db_client
from app.rag.chunking import chunk_text
from app.rag.embeddings import embed
from app.models.schemas import SourceDocument, SourceChunk, Workspace
from app.llm_clients.sarvam_client import sarvam_client
from app.auth import get_current_user, AuthenticatedUser

router = APIRouter(prefix="/workspaces", tags=["Ingestion"])

def check_workspace_access(workspace_id: str, current_user: AuthenticatedUser) -> Workspace:
    ws = db_client.get_workspace(workspace_id, current_user.id)
    if not ws:
        raise HTTPException(
            status_code=404,
            detail=f"Workspace '{workspace_id}' not found or you do not have permission to access it."
        )
    return ws

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

    valid_source_types = {"document", "voice_transcript", "screenshot_ocr", "free_text", "meeting_transcript"}
    normalized_source_type = source_type if source_type in valid_source_types else "document"

    # 1. Save Source Document
    doc = db_client.save_source_document(
        workspace_id=workspace_id,
        filename=filename,
        raw_text=raw_text,
        source_type=normalized_source_type
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
async def ingest_text(
    workspace_id: str,
    request: TextIngestRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Ingest free-text, meeting notes, or pasted transcripts."""
    check_workspace_access(workspace_id, current_user)

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
    file: UploadFile = File(...),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Ingest file: PDF, DOCX, TXT, Image (OCR), or Audio (Sarvam STT)."""
    check_workspace_access(workspace_id, current_user)

    content = await file.read()
    filename = file.filename or "uploaded_file"
    ext = filename.lower().split(".")[-1]

    extracted_text = ""
    source_type = "document"

    ALLOWED_EXTENSIONS = {
        "pdf", "docx", "doc", "txt", "md", "csv", "json",
        "png", "jpg", "jpeg", "webp", "bmp",
        "wav", "mp3", "m4a", "ogg"
    }
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{ext}'. Supported formats include: PDF, DOCX, TXT, MD, CSV, JSON, PNG, JPG, WEBP, WAV, MP3, M4A, OGG."
        )

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

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail=f"Could not extract text from file: {filename}")

    return process_and_save_document(
        workspace_id=workspace_id,
        raw_text=extracted_text,
        filename=filename,
        source_type=source_type
    )

@router.get("/{workspace_id}/sources", response_model=List[SourceDocument])
async def list_sources(
    workspace_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """List all ingested sources for a workspace."""
    check_workspace_access(workspace_id, current_user)
    return db_client.get_documents_by_workspace(workspace_id)
