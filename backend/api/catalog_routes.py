from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, HTTPException, status

from api.catalog_mapping import product_from_row, to_shop_product
from api.config import is_database_configured
from api.supabase_client import citywine

logger = logging.getLogger(__name__)
catalog_router = APIRouter()


def _fetch_active():
    return (
        citywine()
        .table("catalog_products")
        .select("id, kind, name, price_pesos, stock, active, image_path, locale")
        .eq("active", True)
        .order("kind")
        .order("name")
        .execute()
    )


@catalog_router.get("/catalog")
async def list_catalog():
    if not is_database_configured():
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Base de datos no configurada")
    try:
        res = await asyncio.to_thread(_fetch_active)
    except Exception:
        logger.exception("list_catalog falló")
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="No se pudo leer el catálogo") from None
    products = [to_shop_product(product_from_row(row)) for row in (res.data or [])]
    return {"products": products}
