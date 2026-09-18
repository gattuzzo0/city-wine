from __future__ import annotations

import time

CHECKOUT_LIMIT_MAX = 10
CHECKOUT_LIMIT_WINDOW_MS = 60_000


class CheckoutLimiter:
    def __init__(self, max_hits: int = CHECKOUT_LIMIT_MAX, window_ms: int = CHECKOUT_LIMIT_WINDOW_MS) -> None:
        self.max_hits = max_hits
        self.window_ms = window_ms
        self._hits: dict[str, list[int]] = {}

    def limited(self, ip: str, now_ms: int | None = None) -> bool:
        now = now_ms if now_ms is not None else int(time.time() * 1000)
        start = now - self.window_ms
        prev = [t for t in self._hits.get(ip, []) if t > start]
        if len(prev) >= self.max_hits:
            self._hits[ip] = prev
            return True
        prev.append(now)
        self._hits[ip] = prev
        return False


checkout_limiter = CheckoutLimiter()


def client_ip(headers) -> str:
    xf = headers.get("x-forwarded-for")
    if xf:
        return xf.split(",")[0].strip() or "unknown"
    return (headers.get("x-real-ip") or "unknown").strip()
