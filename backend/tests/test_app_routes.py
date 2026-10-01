from server import app


def test_shop_routes_mounted() -> None:
    paths = set(app.openapi()["paths"])
    assert "/api/health" in paths
    assert "/api/catalog" in paths
    assert "/api/checkout" in paths
    assert "/api/consignacion" in paths
    assert "/api/staff/products" in paths
    assert "/api/webhooks/stripe" in paths
