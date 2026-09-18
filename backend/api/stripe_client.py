from __future__ import annotations

import stripe

from api.config import get_stripe_secret_key


def stripe_api():
    key = get_stripe_secret_key()
    if not key:
        raise RuntimeError("Stripe no configurado")
    stripe.api_key = key
    return stripe
