from __future__ import annotations

from functools import lru_cache

from supabase import Client, create_client

from api.config import get_supabase_service_role_key, get_supabase_url
from api.shop_rules import CITYWINE_SCHEMA


@lru_cache
def get_supabase() -> Client:
    url = get_supabase_url()
    key = get_supabase_service_role_key()
    if not url or not key:
        raise RuntimeError("Supabase URL o service role key no configurados")
    return create_client(url, key)


def citywine():
    return get_supabase().schema(CITYWINE_SCHEMA)
