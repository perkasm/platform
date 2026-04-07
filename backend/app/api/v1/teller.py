"""
Teller.io API Routes

Endpoints for linking bank accounts via Teller Connect and fetching
real financial data (accounts, balances, transactions).
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.teller import TellerEnrollment
from app.schemas.teller import (
    TellerEnrollmentCreate,
    TellerEnrollmentResponse,
)
from app.services.teller import TellerService

router = APIRouter()


def _get_enrollment(db: Session, user_id: int, enrollment_id: int) -> TellerEnrollment:
    enrollment = db.query(TellerEnrollment).filter(
        TellerEnrollment.id == enrollment_id,
        TellerEnrollment.user_id == user_id,
    ).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return enrollment


# ---------------------------------------------------------------------------
# Enrollment management
# ---------------------------------------------------------------------------

@router.post("/enrollments", response_model=TellerEnrollmentResponse)
async def create_enrollment(
    payload: TellerEnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Save a Teller access token after the user completes Teller Connect.
    The frontend receives the enrollment_id and access_token from the
    Teller Connect onSuccess callback and posts them here.
    """
    # Avoid duplicate enrollments for the same enrollment_id
    existing = db.query(TellerEnrollment).filter(
        TellerEnrollment.enrollment_id == payload.enrollment_id,
        TellerEnrollment.user_id == current_user.id,
    ).first()
    if existing:
        return existing

    enrollment = TellerEnrollment(
        user_id=current_user.id,
        enrollment_id=payload.enrollment_id,
        access_token=payload.access_token,
        institution_name=payload.institution_name,
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.get("/enrollments", response_model=List[TellerEnrollmentResponse])
async def list_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all bank connections for the current user."""
    return db.query(TellerEnrollment).filter(
        TellerEnrollment.user_id == current_user.id
    ).all()


@router.delete("/enrollments/{enrollment_id}", status_code=204)
async def delete_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Disconnect a bank account."""
    enrollment = _get_enrollment(db, current_user.id, enrollment_id)
    db.delete(enrollment)
    db.commit()


# ---------------------------------------------------------------------------
# Accounts
# ---------------------------------------------------------------------------

@router.get("/enrollments/{enrollment_id}/accounts")
async def get_accounts(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all accounts for a linked bank enrollment."""
    enrollment = _get_enrollment(db, current_user.id, enrollment_id)
    return TellerService.get_accounts(enrollment.access_token)


@router.get("/enrollments/{enrollment_id}/accounts/{account_id}")
async def get_account(
    enrollment_id: int,
    account_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific account."""
    enrollment = _get_enrollment(db, current_user.id, enrollment_id)
    return TellerService.get_account(enrollment.access_token, account_id)


@router.get("/enrollments/{enrollment_id}/accounts/{account_id}/balances")
async def get_balances(
    enrollment_id: int,
    account_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current balance for an account."""
    enrollment = _get_enrollment(db, current_user.id, enrollment_id)
    return TellerService.get_account_balances(enrollment.access_token, account_id)


# ---------------------------------------------------------------------------
# Transactions
# ---------------------------------------------------------------------------

@router.get("/enrollments/{enrollment_id}/accounts/{account_id}/transactions")
async def get_transactions(
    enrollment_id: int,
    account_id: str,
    count: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get transactions for a specific account."""
    enrollment = _get_enrollment(db, current_user.id, enrollment_id)
    return TellerService.get_account_transactions(
        enrollment.access_token, account_id, count
    )


@router.get("/enrollments/{enrollment_id}/transactions")
async def get_all_transactions(
    enrollment_id: int,
    count: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get transactions across all accounts for an enrollment."""
    enrollment = _get_enrollment(db, current_user.id, enrollment_id)
    return TellerService.get_all_transactions(enrollment.access_token, count)
