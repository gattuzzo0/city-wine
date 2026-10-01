from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from api.auth_jwt import require_access_token
from api.catalog_routes import catalog_router
from api.config import get_staff_emails, is_database_configured, is_stripe_configured
from api.shop_routes import shop_router
from api.shop_rules import is_staff_email
from api.staff_routes import staff_router
from api.stripe_webhook_routes import webhooks_router
from api.supabase_client import citywine

logger = logging.getLogger(__name__)

api_router = APIRouter()
api_router.include_router(catalog_router)
api_router.include_router(shop_router)
api_router.include_router(staff_router)
api_router.include_router(webhooks_router)


def _ping_catalog():
    citywine().table("catalog_products").select("id").limit(1).execute()


@api_router.get("/health")
async def health():
    if not is_database_configured():
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"ok": False, "detail": "Base de datos no configurada"},
        )
    try:
        await asyncio.to_thread(_ping_catalog)
    except Exception:
        logger.exception("Health check: fallo al consultar Supabase")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"ok": False, "detail": "No se pudo conectar a Supabase"},
        )
    return {
        "ok": True,
        "database": "connected",
        "shopCheckout": {"stripe": is_stripe_configured()},
    }


@api_router.get("/me")
async def me(claims: dict = Depends(require_access_token)):
    email = claims.get("email")
    is_staff = isinstance(email, str) and is_staff_email(email, get_staff_emails())
    return {
        "userId": claims.get("sub"),
        "email": email,
        "isStaff": is_staff,
    }
