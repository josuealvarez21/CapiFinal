from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.core.config import settings
from app.crud import crud
from app.schemas import schemas

router = APIRouter()

@router.post("/signup", response_model=schemas.Usuario)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UsuarioCreate
) -> Any:
    user = crud.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="El usuario ya existe en el sistema.",
        )
    return crud.create_user(db, user=user_in)

@router.post("/login", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.password): # user.password is now the hashed field
        raise HTTPException(status_code=400, detail="Email o contraseña incorrectos")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id_usuario, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
