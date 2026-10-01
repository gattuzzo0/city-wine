from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

SHOP_TZ = ZoneInfo("America/Mexico_City")
SHIPPING_PESOS = 180
FREE_SHIPPING_OVER_PESOS = 2000
MAX_LINE_QTY = 12
PICKUP_CUTOFF_HOUR = 16
DELIVERY_LEAD_BUSINESS_DAYS = 4
CITYWINE_SCHEMA = "citywine"
CATALOG_BUCKET = "citywine-catalog"
YMD = re.compile(r"^\d{4}-\d{2}-\d{2}$")
PRODUCT_ID = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class DateCheck:
    def __init__(self, ok: bool, detail: str = "") -> None:
        self.ok = ok
        self.detail = detail


def shipping_pesos(subtotal_pesos: int, fulfillment: str) -> int:
    if fulfillment == "pickup":
        return 0
    if subtotal_pesos >= FREE_SHIPPING_OVER_PESOS:
        return 0
    return SHIPPING_PESOS


def mexico_city_parts(now: datetime) -> tuple[str, int]:
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)
    local = now.astimezone(SHOP_TZ)
    return local.strftime("%Y-%m-%d"), local.hour


def add_calendar_days(ymd: str, days: int) -> str:
    y, m, d = (int(p) for p in ymd.split("-"))
    dt = datetime(y, m, d, tzinfo=timezone.utc) + timedelta(days=days)
    return dt.strftime("%Y-%m-%d")


def weekday_sunday0(ymd: str) -> int:
    y, m, d = (int(p) for p in ymd.split("-"))
    return datetime(y, m, d, 18, 0, tzinfo=timezone.utc).isoweekday() % 7


def add_business_days_skip_sunday(ymd: str, n: int) -> str:
    cur = ymd
    added = 0
    while added < n:
        cur = add_calendar_days(cur, 1)
        if weekday_sunday0(cur) != 0:
            added += 1
    return cur


def earliest_fulfillment_date(fulfillment: str, now: datetime | None = None) -> str:
    when = now or datetime.now(timezone.utc)
    ymd, hour = mexico_city_parts(when)
    if fulfillment == "pickup":
        return add_calendar_days(ymd, 1) if hour >= PICKUP_CUTOFF_HOUR else ymd
    return add_business_days_skip_sunday(ymd, DELIVERY_LEAD_BUSINESS_DAYS)


def validate_fulfillment_date(fulfillment: str, date: str, now: datetime | None = None) -> DateCheck:
    if not YMD.match(date):
        return DateCheck(False, "Fecha inválida")
    min_date = earliest_fulfillment_date(fulfillment, now)
    if date < min_date:
        detail = (
            "La fecha de recolección no es válida"
            if fulfillment == "pickup"
            else "La fecha de entrega no es válida"
        )
        return DateCheck(False, detail)
    if fulfillment == "delivery" and weekday_sunday0(date) == 0:
        return DateCheck(False, "No entregamos en domingo")
    return DateCheck(True)


def upcoming_fulfillment_dates(fulfillment: str, now: datetime | None = None, count: int = 14) -> list[str]:
    when = now or datetime.now(timezone.utc)
    min_date = earliest_fulfillment_date(fulfillment, when)
    dates: list[str] = []
    cur = min_date
    guard = 0
    while len(dates) < count and guard < 60:
        guard += 1
        if validate_fulfillment_date(fulfillment, cur, when).ok:
            dates.append(cur)
        cur = add_calendar_days(cur, 1)
    return dates


def is_staff_email(email: str | None, allowlist: str | None) -> bool:
    if not email or not (allowlist or "").strip():
        return False
    want = email.strip().lower()
    allowed = [p.strip().lower() for p in re.split(r"[,;\s]+", allowlist or "") if p.strip()]
    return want in allowed


def clamp_line_qty(qty: float) -> int:
    if qty != qty:  # NaN
        return 1
    return min(MAX_LINE_QTY, max(1, int(qty)))


def merge_cart_lines(lines: list[dict[str, int | str]]) -> list[dict[str, int | str]]:
    order: list[str] = []
    qty: dict[str, int] = {}
    for line in lines:
        pid = str(line.get("productId", "")).strip()
        if not pid:
            continue
        if pid not in qty:
            order.append(pid)
        qty[pid] = clamp_line_qty(qty.get(pid, 0) + clamp_line_qty(float(line.get("qty", 1))))
    return [{"productId": pid, "qty": qty[pid]} for pid in order]


def parse_checkout_items(items: object) -> list[dict[str, int | str]]:
    if not isinstance(items, list) or len(items) == 0:
        raise ValueError("El carrito está vacío")
    lines: list[dict[str, int | str]] = []
    for raw in items:
        if not isinstance(raw, dict):
            raise ValueError("Línea de carrito inválida")
        product_id = str(raw.get("productId") or "").strip()
        if not product_id:
            raise ValueError("Falta productId")
        lines.append({"productId": product_id, "qty": clamp_line_qty(float(raw.get("qty", float("nan"))))})
    merged = merge_cart_lines(lines)
    if not merged:
        raise ValueError("El carrito está vacío")
    return merged


def next_stock_after_sale(stock: int, qty: int) -> int:
    if not isinstance(stock, int) or not isinstance(qty, int) or qty < 1:
        raise ValueError("Cantidad inválida")
    if stock < qty:
        raise ValueError("No hay suficiente inventario")
    return stock - qty


def pesos_to_stripe_amount(pesos: int) -> int:
    return int(pesos) * 100


def stripe_amount_to_pesos(amount: int) -> int:
    return int(amount) // 100


def assert_product_id(raw: str) -> str:
    value = raw.strip()
    if not PRODUCT_ID.match(value) or len(value) > 80:
        raise ValueError("El id debe ser minúsculas, números y guiones")
    return value


def whatsapp_phone_digits(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    return f"52{digits}" if len(digits) == 10 else digits


def whatsapp_question_url(phone: str, message: str, locale: str) -> str:
    full = whatsapp_phone_digits(phone)
    cleaned = " ".join(message.split())
    text = (
        f"City Wine. Question: {cleaned}"
        if locale == "en"
        else f"City Wine. Pregunta: {cleaned}"
    )
    from urllib.parse import quote

    return f"whatsapp://send?phone={full}&text={quote(text)}"


def public_product_image(image_path: str | None, supabase_url: str) -> str | None:
    if not image_path:
        return None
    if image_path.startswith("/") or image_path.startswith("http://") or image_path.startswith("https://"):
        return image_path
    base = supabase_url.rstrip("/")
    return f"{base}/storage/v1/object/public/{CATALOG_BUCKET}/{image_path}"
