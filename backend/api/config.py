from __future__ import annotations

import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(
    dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"),
    override=False,
)


def _env(*names: str) -> str | None:
    for n in names:
        v = os.getenv(n)
        if v:
            return v.strip()
    return None


@lru_cache
def get_supabase_url() -> str | None:
    return _env("SUPABASE_URL", "supabase_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")


@lru_cache
def get_supabase_service_role_key() -> str | None:
    return _env("SUPABASE_SERVICE_ROLE_KEY", "supabase_SUPABASE_SERVICE_ROLE_KEY")


@lru_cache
def get_supabase_jwt_secret() -> str | None:
    return _env("SUPABASE_JWT_SECRET", "JWT_SECRET")


@lru_cache
def get_stripe_secret_key() -> str | None:
    return _env("STRIPE_SECRET_KEY")


@lru_cache
def get_stripe_webhook_secret() -> str | None:
    return _env("STRIPE_WEBHOOK_SECRET")


def get_staff_emails() -> str:
    return _env("STAFF_EMAILS") or ""


def get_whatsapp_phone() -> str | None:
    return _env("SHOP_WHATSAPP_PHONE")


def get_shop_public_url() -> str:
    explicit = _env("SITE_URL", "SHOP_PUBLIC_URL")
    if explicit:
        return explicit.rstrip("/")
    vercel = _env("VERCEL_URL")
    if vercel:
        return f"https://{vercel.rstrip('/')}"
    return "http://localhost:3000"


def get_cors_extra_origins() -> list[str]:
    raw = _env("CORS_EXTRA_ORIGINS") or ""
    return [p.strip() for p in raw.split(",") if p.strip()]


def is_database_configured() -> bool:
    return bool(get_supabase_url() and get_supabase_service_role_key())


def is_stripe_configured() -> bool:
    return bool(get_stripe_secret_key())


def get_cors_allowed_origins() -> list[str]:
    from api.settings import CORS_BASE_ORIGINS

    seen: list[str] = []
    for origin in (*CORS_BASE_ORIGINS, *get_cors_extra_origins()):
        if origin and origin not in seen:
            seen.append(origin)
    return seen
