from __future__ import annotations

from fastapi import Depends, HTTPException, status

from api.auth_jwt import require_access_token
from api.config import get_staff_emails, is_database_configured
from api.shop_rules import is_staff_email


async def require_staff(claims: dict = Depends(require_access_token)) -> dict:
    if not is_database_configured():
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Base de datos no configurada")
    email = claims.get("email")
    if not isinstance(email, str):
        meta = claims.get("user_metadata")
        if isinstance(meta, dict) and isinstance(meta.get("email"), str):
            email = meta["email"]
    if isinstance(email, str) and is_staff_email(email, get_staff_emails()):
        return {"user_id": claims.get("sub"), "email": email}
    raise HTTPException(status.HTTP_403_FORBIDDEN, detail="No tienes acceso al inventario")
