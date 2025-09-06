from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.core.config import settings
from app.schemas.token import Token
from app.schemas.user import User
from app.services.user import get_user_by_email, create_user_from_google, get_user_by_google_id
from app.auth.service import create_access_token
from app.auth.google import GoogleOAuth2
from app.auth.dependencies import get_current_active_user

router = APIRouter()

@router.get("/google/login")
def google_login():
    """Initiate Google OAuth2 login"""
    google_oauth2 = GoogleOAuth2()
    authorization_url = google_oauth2.get_authorization_url()
    return RedirectResponse(authorization_url)

@router.get("/google/callback")
def google_callback(code: str, db: Session = Depends(get_db)):
    """Handle Google OAuth2 callback"""
    google_oauth2 = GoogleOAuth2()
    
    # Exchange code for token
    token_response = google_oauth2.exchange_code_for_token(code)
    
    if "error" in token_response:
        raise HTTPException(status_code=400, detail="Failed to authenticate with Google")
    
    access_token = token_response.get("access_token")
    
    # Get user info from Google
    user_info = google_oauth2.get_user_info(access_token)
    
    # Check if user exists in our database
    db_user = get_user_by_google_id(db, google_id=user_info.get("id"))
    
    if not db_user:
        # Check if user exists with the same email
        db_user = get_user_by_email(db, email=user_info.get("email"))
        if db_user and not getattr(db_user, 'google_id', None):
            # Update existing user with Google ID
            db_user.google_id = user_info.get("id")
            # In memory mode, we would update the user object directly
            if db is None:
                # For in-memory storage, we need to handle this differently
                pass
            else:
                db.commit()
        else:
            # Create new user
            db_user = create_user_from_google(db, user_info)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user