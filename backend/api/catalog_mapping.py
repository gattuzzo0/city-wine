from __future__ import annotations

from api.config import get_supabase_url
from api.shop_rules import public_product_image


def product_from_row(row: dict) -> dict:
    locale = row.get("locale") if isinstance(row.get("locale"), dict) else {}
    return {
        "id": str(row.get("id", "")),
        "kind": row.get("kind"),
        "name": str(row.get("name") or ""),
        "pricePesos": int(row.get("price_pesos") or 0),
        "stock": int(row.get("stock") or 0),
        "active": bool(row.get("active")),
        "imagePath": None if row.get("image_path") is None else str(row.get("image_path")),
        "locale": locale,
    }


def to_shop_product(product: dict, include_path: bool = False) -> dict:
    url = get_supabase_url() or ""
    out = {
        "id": product["id"],
        "kind": product["kind"],
        "name": product["name"],
        "pricePesos": product["pricePesos"],
        "stock": product["stock"],
        "active": product["active"],
        "imageUrl": public_product_image(product.get("imagePath"), url),
        "locale": product.get("locale") or {},
    }
    if include_path:
        out["imagePath"] = product.get("imagePath")
    return out
