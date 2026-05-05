"""
Teller.io Service

Wraps the Teller REST API. Teller uses HTTP Basic Auth (access_token as
username, empty password) over mTLS with the certificate pair downloaded
from the Teller dashboard.
"""

import os
import requests
from pathlib import Path
from typing import List, Optional
from fastapi import HTTPException

from app.core.config import settings


TELLER_BASE_URL = "https://api.teller.io"

# Resolve paths relative to the backend directory (where this package lives)
_BACKEND_DIR = Path(__file__).resolve().parents[2]


def _resolve_path(p: str) -> str:
    """Resolve a path relative to the backend directory if it's not absolute."""
    resolved = Path(p) if os.path.isabs(p) else _BACKEND_DIR / p
    return str(resolved)


def _get_cert():
    """Return the (cert, key) tuple for mTLS, or None if paths aren't set."""
    cert_path = _resolve_path(settings.TELLER_CERT_PATH)
    key_path = _resolve_path(settings.TELLER_KEY_PATH)
    if cert_path and key_path and os.path.exists(cert_path) and os.path.exists(key_path):
        return (cert_path, key_path)
    return None


def _teller_get(path: str, access_token: str) -> dict | list:
    """Make an authenticated GET request to the Teller API."""
    cert = _get_cert()
    try:
        response = requests.get(
            f"{TELLER_BASE_URL}{path}",
            auth=(access_token, ""),
            cert=cert,
            timeout=15,
        )
        response.raise_for_status()
        return response.json()
    except requests.HTTPError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Teller API error: {e.response.text}",
        )
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Could not reach Teller API: {str(e)}")


class TellerService:
    @staticmethod
    def get_accounts(access_token: str) -> list:
        """List all accounts for an enrollment."""
        return _teller_get("/accounts", access_token)

    @staticmethod
    def get_account(access_token: str, account_id: str) -> dict:
        """Get a single account."""
        return _teller_get(f"/accounts/{account_id}", access_token)

    @staticmethod
    def get_account_balances(access_token: str, account_id: str) -> dict:
        """Get current balance for an account."""
        return _teller_get(f"/accounts/{account_id}/balances", access_token)

    @staticmethod
    def get_account_transactions(
        access_token: str, account_id: str, count: int = 100
    ) -> list:
        """Get transactions for an account."""
        return _teller_get(
            f"/accounts/{account_id}/transactions?count={count}", access_token
        )

    @staticmethod
    def get_all_transactions(access_token: str, count: int = 100) -> list:
        """Get transactions across all accounts for an enrollment."""
        accounts = TellerService.get_accounts(access_token)
        all_txns = []
        for account in accounts:
            txns = TellerService.get_account_transactions(
                access_token, account["id"], count
            )
            all_txns.extend(txns)
        return all_txns
