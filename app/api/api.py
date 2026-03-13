from fastapi import APIRouter
from app.api.endpoints import auth, movements, goals

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(movements.router, prefix="/movements", tags=["movements"])
api_router.include_router(goals.router, prefix="/goals", tags=["goals"])
