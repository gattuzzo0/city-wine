from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, ConfigDict, Field

from api.catalog_mapping import product_from_row, to_shop_product
from api.config import is_database_configured
from api.deps import require_staff
from api.shop_rules import CATALOG_BUCKET, assert_product_id
from api.supabase_client import citywine, get_supabase

logger = logging.getLogger(__name__)
staff_router = APIRouter(prefix="/staff", tags=["staff"])

SELECT_COLS = "id, kind, name, price_pesos, stock, active, image_path, locale"
MAX_BYTES = 4_500_000
MIME = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
KINDS = ("wine", "beer", "glass")


class ProductCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    kind: str
    name: str
    price_pesos: int = Field(alias="pricePesos", ge=0)
    stock: int = Field(ge=0)
    active: bool = True
    locale: dict | None = None


class ProductPatch(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str | None = None
    kind: str | None = None
    price_pesos: int | None = Field(default=None, alias="pricePesos", ge=0)
    stock: int | None = Field(default=None, ge=0)
    active: bool | None = None
    locale: dict | None = None


def _staff_product(row: dict) -> dict:
    return to_shop_product(product_from_row(row), include_path=True)


def _list_products():
    return (
        citywine()
        .table("catalog_products")
        .select(f"{SELECT_COLS}, updated_at")
        .order("kind")
        .order("name")
        .execute()
    )


def _insert_product(payload: dict):
    return citywine().table("catalog_products").insert(payload).select(SELECT_COLS).execute()


def _update_product(product_id: str, payload: dict):
    return (
        citywine()
        .table("catalog_products")
        .update(payload)
        .eq("id", product_id)
        .select(SELECT_COLS)
        .execute()
    )


def _upload_image(key: str, data: bytes, content_type: str):
    return get_supabase().storage.from_(CATALOG_BUCKET).upload(
        key,
        data,
        {"content-type": content_type, "upsert": "false"},
    )


@staff_router.get("/products")
async def list_staff_products(_staff: dict = Depends(require_staff)):
    if not is_database_configured():
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Base de datos no configurada")
    try:
        res = await asyncio.to_thread(_list_products)
    except Exception:
        logger.exception("list_staff_products falló")
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="No se pudo leer el inventario") from None
    return {"products": [_staff_product(row) for row in (res.data or [])]}


@staff_router.post("/products", status_code=201)
async def create_staff_product(body: ProductCreate, _staff: dict = Depends(require_staff)):
    if not is_database_configured():
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Base de datos no configurada")
    if body.kind not in KINDS:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Tipo de producto inválido")
    try:
        product_id = assert_product_id(body.id)
    except ValueError as e:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)) from None
    name = body.name.strip()
    if not name:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Falta el nombre")
    locale = body.locale if isinstance(body.locale, dict) else {}
    payload = {
        "id": product_id,
        "kind": body.kind,
        "name": name,
        "price_pesos": body.price_pesos,
        "stock": body.stock,
        "active": body.active is not False,
        "locale": locale,
    }
    try:
        res = await asyncio.to_thread(_insert_product, payload)
    except Exception as e:
        msg = str(e)
        if "23505" in msg:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Ese id ya existe") from None
        logger.exception("create_staff_product falló")
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="No se pudo crear el producto") from None
    rows = res.data or []
    if not rows:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="No se pudo crear el producto")
    return {"product": _staff_product(rows[0])}


@staff_router.patch("/products/{product_id}")
async def patch_staff_product(product_id: str, body: ProductPatch, _staff: dict = Depends(require_staff)):
    if not is_database_configured():
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Base de datos no configurada")
    try:
        pid = assert_product_id(product_id)
    except ValueError as e:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)) from None
    patch: dict = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if body.name is not None:
        name = body.name.strip()
        if not name:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Falta el nombre")
        patch["name"] = name
    if body.kind is not None:
        if body.kind not in KINDS:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Tipo de producto inválido")
        patch["kind"] = body.kind
    if body.price_pesos is not None:
        patch["price_pesos"] = body.price_pesos
    if body.stock is not None:
        patch["stock"] = body.stock
    if body.active is not None:
        patch["active"] = body.active
    if body.locale is not None:
        if not isinstance(body.locale, dict):
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Locale inválido")
        patch["locale"] = body.locale
    try:
        res = await asyncio.to_thread(_update_product, pid, patch)
    except Exception:
        logger.exception("patch_staff_product falló")
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="No se pudo guardar") from None
    rows = res.data or []
    if not rows:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return {"product": _staff_product(rows[0])}


@staff_router.delete("/products/{product_id}")
async def archive_staff_product(product_id: str, _staff: dict = Depends(require_staff)):
    if not is_database_configured():
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Base de datos no configurada")
    try:
        pid = assert_product_id(product_id)
    except ValueError as e:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)) from None
    payload = {"active": False, "updated_at": datetime.now(timezone.utc).isoformat()}
    try:
        res = await asyncio.to_thread(_update_product, pid, payload)
    except Exception:
        logger.exception("archive_staff_product falló")
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="No se pudo archivar") from None
    if not (res.data or []):
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return {"ok": True}


@staff_router.post("/products/{product_id}/image")
async def upload_staff_product_image(
    product_id: str,
    file: UploadFile = File(...),
    _staff: dict = Depends(require_staff),
):
    if not is_database_configured():
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Base de datos no configurada")
    try:
        pid = assert_product_id(product_id)
    except ValueError as e:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)) from None
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    ext = MIME.get(content_type)
    if not ext:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Usa JPEG, PNG o WebP")
    data = await file.read()
    if not data:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Falta el archivo")
    if len(data) > MAX_BYTES:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="La imagen es demasiado grande")
    key = f"catalog/{pid}/{uuid.uuid4()}.{ext}"
    try:
        await asyncio.to_thread(_upload_image, key, data, content_type)
    except Exception:
        logger.exception("upload_staff_product_image storage falló")
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="No se pudo subir la imagen") from None
    patch = {"image_path": key, "updated_at": datetime.now(timezone.utc).isoformat()}
    try:
        res = await asyncio.to_thread(_update_product, pid, patch)
    except Exception:
        logger.exception("upload_staff_product_image db falló")
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Imagen subida pero no se guardó en el producto",
        ) from None
    rows = res.data or []
    if not rows:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Imagen subida pero no se guardó en el producto",
        )
    return {"product": _staff_product(rows[0])}
