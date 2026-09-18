from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, HTTPException, Request, status

from api.config import get_stripe_webhook_secret, is_database_configured, is_stripe_configured
from api.shop_rpc import fulfill_stripe_checkout_rpc
from api.shop_rules import stripe_amount_to_pesos
from api.stripe_client import stripe_api
from api.supabase_client import citywine

logger = logging.getLogger(__name__)
webhooks_router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def parse_lines(raw: str) -> list[dict]:
    if not (raw or "").strip():
        return []
    lines: list[dict] = []
    for part in raw.split(","):
        bits = part.split(":")
        if len(bits) < 3:
            continue
        product_id, qty_raw, price_raw = bits[0], bits[1], bits[2]
        try:
            qty = int(qty_raw)
            unit_price = int(price_raw)
        except ValueError:
            continue
        lines.append(
            {
                "productId": product_id,
                "qty": qty,
                "unitPricePesos": unit_price,
                "name": product_id,
            }
        )
    return lines


def _get(obj, name, default=None):
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(name, default)
    return getattr(obj, name, default)


def _names_for_ids(ids: list[str]):
    return citywine().table("catalog_products").select("id, name").in_("id", ids).execute()


def _address_from_session(session) -> dict | None:
    details = _get(session, "customer_details")
    addr = _get(details, "address")
    if not addr:
        return None
    return {
        "city": _get(addr, "city"),
        "country": _get(addr, "country"),
        "line1": _get(addr, "line1"),
        "line2": _get(addr, "line2"),
        "postal_code": _get(addr, "postal_code"),
        "state": _get(addr, "state"),
    }


@webhooks_router.post("/stripe")
async def stripe_webhook(request: Request):
    if not is_stripe_configured():
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Pagos no configurados")
    if not is_database_configured():
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Base de datos no configurada")
    secret = get_stripe_webhook_secret()
    if not secret:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Webhook no configurado")
    sig = request.headers.get("stripe-signature")
    if not sig:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Firma ausente")
    raw = await request.body()

    def _construct():
        return stripe_api().Webhook.construct_event(raw, sig, secret)

    try:
        event = await asyncio.to_thread(_construct)
    except Exception:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Firma inválida") from None

    event_type = _get(event, "type")
    if event_type != "checkout.session.completed":
        return {"ok": True}

    data = _get(event, "data")
    session = _get(data, "object")
    payment_status = _get(session, "payment_status")
    if payment_status and payment_status != "paid":
        return {"ok": True}

    meta = _get(session, "metadata") or {}
    fulfillment = _get(meta, "fulfillment") if not isinstance(meta, dict) else meta.get("fulfillment")
    if isinstance(meta, dict):
        date = meta.get("date") or ""
        shipping_raw = meta.get("shipping") or 0
        lines_raw = meta.get("lines") or ""
    else:
        date = _get(meta, "date") or ""
        shipping_raw = _get(meta, "shipping") or 0
        lines_raw = _get(meta, "lines") or ""
    if fulfillment not in ("pickup", "delivery"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Fulfillment inválido")
    try:
        shipping = int(shipping_raw)
    except (TypeError, ValueError):
        shipping = 0
    parsed = parse_lines(str(lines_raw))
    if not parsed:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Pedido sin líneas")

    session_id = _get(session, "id")
    amount_total = _get(session, "amount_total") or 0
    details = _get(session, "customer_details")
    email = _get(details, "email") or _get(session, "customer_email")

    try:
        names_res = await asyncio.to_thread(_names_for_ids, [l["productId"] for l in parsed])
        names = {str(r["id"]): str(r["name"]) for r in (names_res.data or [])}
        lines = [{**l, "name": names.get(l["productId"], l["name"])} for l in parsed]
        subtotal = sum(int(l["unitPricePesos"]) * int(l["qty"]) for l in lines)
        total = subtotal + shipping
        paid = stripe_amount_to_pesos(int(amount_total or 0))
        if paid != total:
            logger.error("stripe_total_mismatch %s", session_id)
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Total de Stripe no coincide")
        payload = {
            "p_event_id": _get(event, "id"),
            "p_session_id": session_id,
            "p_email": email,
            "p_fulfillment": fulfillment,
            "p_fulfillment_date": date,
            "p_shipping_pesos": shipping,
            "p_subtotal_pesos": subtotal,
            "p_total_pesos": total,
            "p_shipping_address": _address_from_session(session),
            "p_lines": lines,
        }
        order_id = await asyncio.to_thread(fulfill_stripe_checkout_rpc, payload)
        return {"ok": True, "orderId": order_id}
    except HTTPException:
        raise
    except Exception:
        logger.exception("fulfill_stripe_checkout falló %s", session_id)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No se pudo registrar el pedido") from None
