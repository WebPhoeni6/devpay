"""
Paystack API client helpers.
All amounts are handled in kobo (smallest NGN unit = 100 kobo per naira).
"""
import hashlib
import hmac
import secrets

import requests
from django.conf import settings

PAYSTACK_BASE = "https://api.paystack.co"


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }


def generate_reference() -> str:
    """Return a cryptographically secure unique transaction reference."""
    return secrets.token_hex(16)


def initialize_transaction(email: str, amount_naira: float, reference: str, callback_url: str = "") -> dict:
    """
    Initialize a Paystack transaction.

    Args:
        email: Customer email address.
        amount_naira: Amount in naira (will be converted to kobo).
        reference: Unique transaction reference.
        callback_url: Optional URL Paystack redirects to after payment.

    Returns:
        Paystack API response dict.
    """
    payload = {
        "email": email,
        "amount": int(float(amount_naira) * 100),  # convert to kobo
        "reference": reference,
    }
    if callback_url:
        payload["callback_url"] = callback_url

    response = requests.post(
        f"{PAYSTACK_BASE}/transaction/initialize",
        json=payload,
        headers=_headers(),
        timeout=15,
    )
    response.raise_for_status()
    return response.json()


def verify_transaction(reference: str) -> dict:
    """
    Verify a Paystack transaction by reference.

    Returns:
        Paystack API response dict.
    """
    response = requests.get(
        f"{PAYSTACK_BASE}/transaction/verify/{reference}",
        headers=_headers(),
        timeout=15,
    )
    response.raise_for_status()
    return response.json()


def verify_webhook_signature(payload_bytes: bytes, signature_header: str) -> bool:
    """
    Verify that a webhook request originated from Paystack using HMAC SHA512.

    Args:
        payload_bytes: Raw request body bytes.
        signature_header: Value of the x-paystack-signature header.

    Returns:
        True if signature is valid, False otherwise.
    """
    secret = settings.PAYSTACK_SECRET_KEY.encode("utf-8")
    computed = hmac.new(secret, payload_bytes, hashlib.sha512).hexdigest()
    return hmac.compare_digest(computed, signature_header)
