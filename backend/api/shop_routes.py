from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, ConfigDict

from api.catalog_mapping import product_from_row
from api.config import get_shop_public_url, get_whatsapp_phone, is_database_configured, is_stripe_configured
from api.shop_checkout_guards import checkout_limiter, client_ip
from api.shop_rules import (
    parse_checkout_items,
    pesos_to_stripe_amount,
    shipping_pesos,
    validate_fulfillment_date,
    whatsapp_question_url,
)
from api.stripe_client import stripe_api
from api.supabase_client import citywine

logger = logging.getLogger(__name__)
shop_router = APIRouter()


class CheckoutIn(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    fulfillment: str
    date: str
    items: list[dict]


class WhatsappAskIn(BaseModel):
    message: str
    locale: str | None = None


def _fetch_products_by_ids(ids: list[str]):
    return (
        citywine()
        .table("catalog_products")
        .select("id, kind, name, price_pesos, stock, active, image_path, locale")
        .in_("id", ids)
        .execute()
    )


def _as_fulfillment(value: str) -> str | None:
    return value if value in ("pickup", "delivery") else None


@shop_router.post("/checkout")
async def create_checkout(body: CheckoutIn, request: Request):
    if not is_database_configured():
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Base de datos no configurada")
    if not is_stripe_configured():
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Pagos no configurados")
    if checkout_limiter.limited(client_ip(request.headers)):
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, detail="Demasiados intentos. Espera un minuto.")

    fulfillment = _as_fulfillment(body.fulfillment)
    if not fulfillment:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Elige recolección o envío")
    when = validate_fulfillment_date(fulfillment, body.date)
    if not when.ok:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail=when.detail)

    try:
        items = parse_checkout_items(body.items)
    except ValueError as e:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)) from None

    try:
        res = await asyncio.to_thread(_fetch_products_by_ids, [str(i["productId"]) for i in items])
        rows = [product_from_row(row) for row in (res.data or [])]
        by_id = {p["id"]: p for p in rows}
        priced: list[dict] = []
        for line in items:
            product = by_id.get(str(line["productId"]))
            qty = int(line["qty"])
            if not product or not product["active"]:
                raise ValueError("Producto no disponible")
            if int(product["stock"]) < qty:
                raise ValueError(f"No hay suficiente inventario de {product['name']}")
            priced.append(
                {
                    "productId": product["id"],
                    "name": product["name"],
                    "qty": qty,
                    "unitPricePesos": int(product["pricePesos"]),
                }
            )
        subtotal = sum(int(l["unitPricePesos"]) * int(l["qty"]) for l in priced)
        shipping = shipping_pesos(subtotal, fulfillment)
        origin = get_shop_public_url()
        line_items = [
            {
                "quantity": int(l["qty"]),
                "price_data": {
                    "currency": "mxn",
                    "unit_amount": pesos_to_stripe_amount(int(l["unitPricePesos"])),
                    "product_data": {"name": str(l["name"])},
                },
            }
            for l in priced
        ]
        if shipping > 0:
            line_items.append(
                {
                    "quantity": 1,
                    "price_data": {
                        "currency": "mxn",
                        "unit_amount": pesos_to_stripe_amount(shipping),
                        "product_data": {"name": "Envío nacional"},
                    },
                }
            )
        params: dict = {
            "mode": "payment",
            "locale": "es",
            "success_url": f"{origin}/shop/success?session_id={{CHECKOUT_SESSION_ID}}",
            "cancel_url": f"{origin}/shop/cancel",
            "metadata": {
                "fulfillment": fulfillment,
                "date": body.date,
                "shipping": str(shipping),
                "lines": ",".join(f"{l['productId']}:{l['qty']}:{l['unitPricePesos']}" for l in priced),
            },
            "line_items": line_items,
        }
        if fulfillment == "delivery":
            params["shipping_address_collection"] = {"allowed_countries": ["MX"]}

        def _create():
            return stripe_api().checkout.Session.create(**params)

        session = await asyncio.to_thread(_create)
        if not getattr(session, "url", None):
            raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="No se pudo crear el pago")
        return {"url": session.url}
    except ValueError as e:
        msg = str(e)
        if msg.startswith("No hay") or msg.startswith("Producto") or msg.startswith("El carrito"):
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail=msg) from None
        logger.exception("create_checkout valor inesperado")
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="No se pudo crear el pago") from None
    except HTTPException:
        raise
    except Exception:
        logger.exception("create_checkout falló")
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="No se pudo crear el pago") from None


@shop_router.get("/checkout")
async def read_checkout(session_id: str = ""):
    if not is_stripe_configured():
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Pagos no configurados")
    if not session_id.startswith("cs_"):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Sesión inválida")

    def _retrieve():
        return stripe_api().checkout.Session.retrieve(session_id)

    try:
        session = await asyncio.to_thread(_retrieve)
    except Exception:
        logger.exception("read_checkout falló")
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="No se pudo leer el pago") from None
    details = getattr(session, "customer_details", None)
    email = getattr(details, "email", None) if details else None
    return {
        "paid": getattr(session, "payment_status", None) == "paid",
        "email": email if isinstance(email, str) else None,
    }


@shop_router.get("/consignacion")
async def consignacion_status():
    return {"enabled": bool(get_whatsapp_phone())}


@shop_router.post("/consignacion")
async def consignacion_link(body: WhatsappAskIn):
    phone = get_whatsapp_phone()
    if not phone:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="WhatsApp no está configurado")
    locale = "en" if body.locale == "en" else "es"
    message = " ".join(body.message.split())
    if len(message) < 4:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Escribe tu pregunta")
    if len(message) > 500:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="La pregunta es demasiado larga")
    return {"url": whatsapp_question_url(phone, message, locale)}
