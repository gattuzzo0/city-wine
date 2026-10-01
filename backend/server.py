from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.config import get_cors_allowed_origins
from api.router import api_router

app = FastAPI(title="City Wine API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(get_cors_allowed_origins()),
    allow_origin_regex=r"^https://[\w.-]+\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    return {
        "service": "citywine-api",
        "docs": "/docs",
        "corsProfile": "origins-plus-vercel-app-regex",
    }
