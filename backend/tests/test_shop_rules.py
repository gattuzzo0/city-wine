from datetime import datetime, timezone

from api.shop_rules import (
    clamp_line_qty,
    earliest_fulfillment_date,
    is_staff_email,
    merge_cart_lines,
    next_stock_after_sale,
    parse_checkout_items,
    shipping_pesos,
    validate_fulfillment_date,
)


def test_shipping_pickup_always_zero() -> None:
    assert shipping_pesos(0, "pickup") == 0
    assert shipping_pesos(1999, "pickup") == 0
    assert shipping_pesos(9000, "pickup") == 0


def test_shipping_delivery_under_threshold() -> None:
    assert shipping_pesos(1999, "delivery") == 180
    assert shipping_pesos(1, "delivery") == 180


def test_shipping_delivery_free_at_2000() -> None:
    assert shipping_pesos(2000, "delivery") == 0
    assert shipping_pesos(2001, "delivery") == 0


def test_pickup_same_day_before_cutoff() -> None:
    now = datetime(2026, 9, 16, 20, 0, tzinfo=timezone.utc)
    assert earliest_fulfillment_date("pickup", now) == "2026-09-16"


def test_pickup_next_day_at_cutoff() -> None:
    now = datetime(2026, 9, 16, 22, 0, tzinfo=timezone.utc)
    assert earliest_fulfillment_date("pickup", now) == "2026-09-17"


def test_delivery_plus_four_business_days_skip_sunday() -> None:
    now = datetime(2026, 9, 16, 18, 0, tzinfo=timezone.utc)
    assert earliest_fulfillment_date("delivery", now) == "2026-09-21"


def test_rejects_past_pickup() -> None:
    now = datetime(2026, 9, 16, 20, 0, tzinfo=timezone.utc)
    assert validate_fulfillment_date("pickup", "2026-09-15", now).ok is False
    assert validate_fulfillment_date("pickup", "2026-09-16", now).ok is True


def test_rejects_sunday_delivery() -> None:
    now = datetime(2026, 9, 16, 18, 0, tzinfo=timezone.utc)
    assert validate_fulfillment_date("delivery", "2026-09-27", now).ok is False
    assert validate_fulfillment_date("delivery", "2026-09-21", now).ok is True


def test_staff_allowlist() -> None:
    assert is_staff_email("Ada@City.Wine", "ada@city.wine, other@x.com") is True
    assert is_staff_email("nope@x.com", "ada@city.wine") is False
    assert is_staff_email("ada@city.wine", "") is False


def test_cart_qty_and_parse() -> None:
    assert clamp_line_qty(0) == 1
    assert clamp_line_qty(3) == 3
    assert clamp_line_qty(40) == 12
    try:
        parse_checkout_items([])
        raise AssertionError("expected empty cart error")
    except ValueError:
        pass
    parsed = parse_checkout_items([{"productId": "nebbiolo-casa", "qty": 2}])
    assert parsed == [{"productId": "nebbiolo-casa", "qty": 2}]


def test_merge_duplicate_lines() -> None:
    assert merge_cart_lines(
        [
            {"productId": "a", "qty": 2},
            {"productId": "a", "qty": 3},
            {"productId": "b", "qty": 1},
        ]
    ) == [
        {"productId": "a", "qty": 5},
        {"productId": "b", "qty": 1},
    ]


def test_whatsapp_question_url() -> None:
    from api.shop_rules import whatsapp_question_url

    url = whatsapp_question_url("52 55 1234 5678", "  ¿Tienen nebbiolo?  ", "es")
    assert url.startswith("whatsapp://send?phone=525512345678&text=")
    assert "wa.me" not in url
    assert "Pregunta" in url
    assert "nebbiolo" in url.lower()


def test_whatsapp_ten_digit_gets_mexico_code() -> None:
    from api.shop_rules import whatsapp_question_url

    url = whatsapp_question_url("55 1234 5678", "Hola", "en")
    assert url.startswith("whatsapp://send?phone=525512345678&text=")
    assert "Question" in url


def test_stock_decrement() -> None:
    assert next_stock_after_sale(24, 2) == 22
    try:
        next_stock_after_sale(1, 2)
        raise AssertionError("expected stock error")
    except ValueError:
        pass
