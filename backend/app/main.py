import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes.ingestion import router as ingestion_router
from app.routes.generate import router as generate_router
from app.routes.workspaces import router as workspaces_router

load_dotenv()

app = FastAPI(
    title="GroundWork AI API",
    description="Evidence-grounded Business Transformation Copilot (Chaos2Commit Hackathon)",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow local Vite frontend during dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(ingestion_router)
app.include_router(generate_router)
app.include_router(workspaces_router)

@app.get("/")
def root():
    return {
        "app": "GroundWork AI",
        "status": "online",
        "version": "1.0.0",
        "architecture_invariants": {
            "cite_or_abstain": "active",
            "independent_verifier": "NVIDIA NIM",
            "primary_generator": "Groq",
            "multilingual_voice": "Sarvam AI"
        }
    }

@app.get("/health")
def health():
    return {"status": "ok"}
