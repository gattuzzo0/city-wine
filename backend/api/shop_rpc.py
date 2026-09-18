from __future__ import annotations

import json

import httpx

from api.config import get_supabase_service_role_key, get_supabase_url
from api.shop_rules import CITYWINE_SCHEMA


def fulfill_stripe_checkout_rpc(payload: dict) -> str:
    url_base = get_supabase_url()
    key = get_supabase_service_role_key()
    if not url_base or not key:
        raise RuntimeError("Supabase no configurado")
    url = f"{url_base.rstrip('/')}/rest/v1/rpc/fulfill_stripe_checkout"
    with httpx.Client(timeout=60.0) as http:
        r = http.post(
            url,
            json=payload,
            headers={
                "apikey": key,
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Content-Profile": CITYWINE_SCHEMA,
                "Accept-Profile": CITYWINE_SCHEMA,
            },
        )
    if r.is_error:
        msg = r.text
        ctype = r.headers.get("content-type", "")
        if ctype.startswith("application/json"):
            try:
                body = r.json()
                msg = str(body.get("message") or body.get("details") or body)
            except json.JSONDecodeError:
                msg = r.text
        raise RuntimeError(f"PostgREST {r.status_code}: {msg}")
    data = r.json()
    return str(data)
