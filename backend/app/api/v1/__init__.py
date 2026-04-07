from fastapi import APIRouter
from app.api.v1 import auth, users, cards, dashboard, recommendations, chat, teller

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(cards.router, prefix="/cards", tags=["cards"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(teller.router, prefix="/teller", tags=["teller"])
