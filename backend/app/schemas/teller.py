"""
Teller.io Pydantic Schemas
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TellerEnrollmentCreate(BaseModel):
    """Payload sent from the frontend after Teller Connect completes"""
    enrollment_id: str
    access_token: str
    institution_name: Optional[str] = None


class TellerEnrollmentResponse(BaseModel):
    id: int
    enrollment_id: str
    institution_name: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Teller API response shapes ---

class TellerAccountBalance(BaseModel):
    account_id: str
    available: Optional[str]
    ledger: Optional[str]


class TellerAccount(BaseModel):
    id: str
    name: str
    type: str
    subtype: Optional[str]
    status: str
    currency: str
    institution: Optional[dict]
    last_four: Optional[str]


class TellerTransaction(BaseModel):
    id: str
    account_id: str
    date: str
    description: str
    amount: str
    type: str
    status: str
    details: Optional[dict]
    running_balance: Optional[str]


class TellerAccountsResponse(BaseModel):
    accounts: List[TellerAccount]
    enrollment_id: str


class TellerTransactionsResponse(BaseModel):
    transactions: List[TellerTransaction]
    account_id: str
